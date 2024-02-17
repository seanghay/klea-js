import wavEncoder from 'wav-encoder';
import ort from 'onnxruntime-node';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import phonetisaurus from 'phonetisaurus';

function intersperse(array, something) {
  if (array.length < 2) { return array }

  const result = []
  let i = 0;
  let l = array.length;

  if (typeof something == 'function') {
    for (; i < l; i++) {
      if (i !== 0) { result.push(something()) }
      result.push(array[i])
    }
  } else {
    for (; i < l; i++) {
      if (i !== 0) { result.push(something) }
      result.push(array[i])
    }
  }

  result.unshift(something);
  result.push(something);
  return result
}

const fst = "g2p.fst"
if (!fsSync.existsSync(fst)) {
  console.error(`${fst} file not found`)
  process.exit(1);
}
const model ="G_60000.int8.onnx"
if (!fsSync.existsSync(model)) {
  console.error(`${model} file not found`)
  process.exit(1);
}

// system initialization
phonetisaurus.FS.writeFile("/model.fst", await fs.readFile(fst));
const tokenizer = JSON.parse(await fs.readFile("tokenizer.json"));
const phonemizer = new phonetisaurus.Phonemizer("/model.fst", "");
const session = await ort.InferenceSession.create(model);

export async function tts(text) {
  const phonemes = phonemizer.phoneticize(text, 1, 500, 10, false, false, 0.0)[0].join(" ");
  const ids = (phonemes + ".").split('').map(t => tokenizer[t] || tokenizer[' ']);
  const inputs = [intersperse(ids, 0)];
  const wrap = v => new ort.Tensor('int64', BigInt64Array.from(v.flat().map(x => BigInt(x))), [v.length, v[0].length]);

  const result = await session.run({
    input: wrap(inputs),
    input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(inputs[0].length)])),
    scales: new ort.Tensor('float32', [0.667, 1.0, 1.0]),
    sid: null,
  });

  const channelData = [result['output'].data];
  const sampleRate = 22050;
  const audioBuffer = await wavEncoder.encode({
    sampleRate,
    channelData,
  });

  return Buffer.from(audioBuffer)
}
