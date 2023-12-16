import { tts } from './model.js';
import fs from 'node:fs/promises';

await fs.writeFile("audio.wav", await tts("ស្រុកខ្មែរ"))