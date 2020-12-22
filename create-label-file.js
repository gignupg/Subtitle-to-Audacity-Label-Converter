import fs from 'fs';
import os from 'os';
import path from 'path';
import { parse, map, filter } from 'subtitle';

const homedir = os.homedir();

const downloadDir = path.join(homedir, '/Downloads');

fs.readdir(downloadDir, function (err, files) {
  if (err) {
    console.log(err);

  } else {
    const srtFiles = files.filter(el => path.extname(el).toLowerCase() === ".srt");

    if (srtFiles && srtFiles.length === 1) {
      const fileName = path.join(downloadDir, srtFiles[0]);

      let previousEnd = 0;

      fs.createReadStream(fileName, 'latin1')
        .pipe(parse())
        .pipe(map(node => {
          if (node.type === 'cue') {
            const prevEnd = previousEnd;
            const elem = node.data;
    
            const end = numberConverter(elem.end);
            const start = numberConverter(elem.start);
    
            previousEnd = end;
    
            if (prevEnd || start > 2) {
              if (start - prevEnd > 2) {
                return `${prevEnd + 0.9}\t\t${start - 0.9}\t\tS\n`;
              }
            }
            return null;
          }
        }))
        .pipe(filter((elem) => {
          return elem;
        }))
        .pipe(fs.createWriteStream(`${downloadDir}/new-audacity-label.txt`, 'latin1'));
    
    } else {
      console.log("Conversion failed. Make sure you are in the Downloads folder and there is no more than one srt file present!")
    }
  }
});


function numberConverter(num) {
  num = num.toString();
  return Number(num.slice(0, num.length - 3) + "." + num.slice(num.length - 3));
}





