## Get Started

Download the model checkpoint and G2P model on Hugging Face and place them in the current directory.

- [G_60000.int8.onnx](https://huggingface.co/spaces/seanghay/KLEA/resolve/main/G_60000.int8.onnx)
- [g2p.fst](https://huggingface.co/spaces/seanghay/KLEA/resolve/main/g2p.fst)

```javascript
import { tts } from './model.js';
import fs from 'node:fs/promises';

const wavBuffer = await tts("ស្រុកខ្មែរ");
await fs.writeFile("audio.wav", wavBuffer);
```

[audio.wav](./audio.wav)

