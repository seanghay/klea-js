## Get Started

Download the model checkpoint and G2P model on Hugging Face and place them in the current directory.

- [G_60000.int8.onnx](https://huggingface.co/spaces/seanghay/KLEA/resolve/main/G_60000.int8.onnx)
- [g2p.fst](https://huggingface.co/spaces/seanghay/KLEA/resolve/main/g2p.fst)

```javascript
import { tts } from "./model.js";
import fs from "node:fs/promises";

const wavBuffer = await tts("ស្រុកខ្មែរ");
await fs.writeFile("audio.wav", wavBuffer);
```

[audio.wav](./audio.wav)

## Test

```bash
npm i
npm start ស្រុកខ្មែរ test.wav
```

# Serving

Running a web service to serve text-to-speech request

```bash
npm run serve
```

Visit: [http://localhost:3000/កិច្ចការ](http://localhost:3000/កិច្ចការ)

## Container

```bash
docker build -t klea .
# run webservice
docker run --rm -it -p 3000:3000 klea
```

Visit: [http://localhost:3000/កិច្ចការ](http://localhost:3000/កិច្ចការ)
