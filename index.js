import { tts } from './model.js';
import fs from 'node:fs/promises';

const args = process.argv

if (args.length <= 2) {
    console.log(' Usage: npm start <TEXT> [OUTPUT]');
    process.exit(0);
}
const word = args[2];
const output = args[3] || 'audio.wav';

await fs.writeFile(output, await tts(word))