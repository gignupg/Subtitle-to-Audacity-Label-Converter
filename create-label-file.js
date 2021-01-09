import fs from 'fs';
import os from 'os';
import path from 'path';
import { parse, map, filter } from 'subtitle';
import detectCharacterEncoding from 'detect-character-encoding';

let space = 0;
const firstArg = process.argv[2];

if (firstArg && !isNaN(firstArg)) {
  space = Number(firstArg);
}

const encodingTable = {
  "ISO-8859-1": "latin1",
  "UTF-8": "utf8"
};

// Tested this with Twilight. See Detecting Music.mdn 
const musicRegEx = new RegExp('♪');

const homedir = os.homedir();

const downloadDir = path.join(homedir, '/Downloads');

fs.readdir(downloadDir, function (err, files) {
  if (err) {
    console.log("File cannot be properly processed for the following reason:", err);

  } else {
    const srtFiles = files.filter(el => path.extname(el).toLowerCase() === ".srt");

    if (srtFiles && srtFiles.length === 1) {
      const fileName = path.join(downloadDir, srtFiles[0]);

      // Encoding
      const fileBuffer = fs.readFileSync(fileName);
      const fileEncoding = detectCharacterEncoding(fileBuffer);

      let previousEnd = 0;

      fs.createReadStream(fileName, encodingTable[fileEncoding])
        .pipe(parse())
        .pipe(map((node) => {
          if (node.type === 'cue') {
            const silenceStart = previousEnd;
            const elem = node.data;

            const sentenceEnd = numberConverter(elem.end);
            const sentenceStart = numberConverter(elem.start);

            // Spot music
            const music = musicRegEx.test(elem.text);

            // If it's music
            if (music) {
              return null;

              // If it's text and the silence gap is bigger than 2 seconds
            } else if (sentenceStart - silenceStart > 2) {
              previousEnd = sentenceEnd;
              return `${silenceStart + space}\t\t${sentenceStart - space}\t\tSilence\n`;

            } else {
              previousEnd = sentenceEnd;
              return null;
            }
          }
        }))
        .pipe(filter(elem => elem))
        .pipe(fs.createWriteStream(`${downloadDir}/new-audacity-label.txt`, encodingTable[fileEncoding]));

    } else {
      console.log("Conversion failed. Make sure you are in the Downloads folder and there is no more than one srt file present!");
    }
  }
});


function numberConverter(num) {
  num = num.toString();
  return Number(num.slice(0, num.length - 3) + "." + num.slice(num.length - 3));
}
