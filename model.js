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

if (!fsSync.existsSync("g2p.fst")) {
  console.error("'g2p.fst' file not found")
  process.exit(1);
}

if (!fsSync.existsSync("G_60000.int8.onnx")) {
  console.error("'G_60000.int8.onnx' file not found")
  process.exit(1);
}

phonetisaurus.FS.writeFile("/model.fst", await fs.readFile("g2p.fst"));
const tokenizer = JSON.parse(await fs.readFile("tokenizer.json"));
const phonemizer = new phonetisaurus.Phonemizer("/model.fst", "");

export async function tts(text) {
  const phonemes = phonemizer.phoneticize(text, 1, 500, 10, false, false, 0.0)[0].join(" ");
  const ids = (phonemes + ".").split('').map(t => tokenizer[t] || tokenizer[' ']);
  const inputs = [intersperse(ids, 0)];
  const session = await ort.InferenceSession.create('G_60000.int8.onnx');
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
