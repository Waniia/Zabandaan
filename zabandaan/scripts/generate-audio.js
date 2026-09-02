// Script to generate Urdu alphabet audio files using Microsoft Edge TTS
// Run: node scripts/generate-audio.js

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');

const VOICE = 'ur-PK-UzmaNeural'; // Female Urdu (Pakistan) voice
const OUTPUT_DIR = path.join(__dirname, '..', 'client', 'public', 'audio', 'alphabets');

// Alphabet data (same as client/src/data/alphabets.js)
const alphabets = [
  { id: 'alif',  nameUrdu: 'الف',  exampleWord: 'انار' },
  { id: 'bay',   nameUrdu: 'بے',   exampleWord: 'بلی' },
  { id: 'pay',   nameUrdu: 'پے',   exampleWord: 'پتنگ' },
  { id: 'tay',   nameUrdu: 'تے',   exampleWord: 'تالا' },
  { id: 'ttay',  nameUrdu: 'ٹے',   exampleWord: 'ٹوپی' },
  { id: 'say',   nameUrdu: 'ثے',   exampleWord: 'ثمر' },
  { id: 'jeem',  nameUrdu: 'جیم',  exampleWord: 'جہاز' },
  { id: 'chay',  nameUrdu: 'چے',   exampleWord: 'چاند' },
  { id: 'hay',   nameUrdu: 'حے',   exampleWord: 'حلقہ' },
  { id: 'khay',  nameUrdu: 'خے',   exampleWord: 'خط' },
];

async function generateAudio(tts, text, filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`  [skip] ${path.basename(filePath)} already exists`);
    return;
  }
  // toFile writes <dir>/audio.mp3, so use a temp dir then rename
  const tmpDir = filePath + '.tmp';
  fs.mkdirSync(tmpDir, { recursive: true });
  await tts.toFile(tmpDir, text);
  const generated = path.join(tmpDir, 'audio.mp3');
  fs.renameSync(generated, filePath);
  fs.rmSync(tmpDir, { recursive: true });
  console.log(`  [done] ${path.basename(filePath)}`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  console.log(`Voice: ${VOICE}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  for (const letter of alphabets) {
    console.log(`Generating audio for: ${letter.id} (${letter.nameUrdu})`);

    // Letter name audio
    const namePath = path.join(OUTPUT_DIR, `${letter.id}-name.mp3`);
    await generateAudio(tts, letter.nameUrdu, namePath);

    // Example word audio
    if (letter.exampleWord) {
      const wordPath = path.join(OUTPUT_DIR, `${letter.id}-word.mp3`);
      await generateAudio(tts, letter.exampleWord, wordPath);
    }
  }

  console.log('\nAll audio files generated!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
