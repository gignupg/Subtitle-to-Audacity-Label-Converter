import fs from 'fs';
import { parse, map, filter } from 'subtitle';

let previousEnd = 0;

fs.createReadStream('./seul-sur-mars.srt', 'latin1')
  .pipe(parse())
  .pipe(map((node, index) => {
    if (node.type === 'cue') {
      const prevEnd = previousEnd;
      const elem = node.data;

      const end = numberConverter(elem.end);
      const start = numberConverter(elem.start)

      previousEnd = end; 

      if (prevEnd || start > 2) {
        if (start - prevEnd > 2) {
          return `${prevEnd}\t\t${start}\t\tSilence\n`;
        }
      }
      return null;
    }
  }))
  .pipe(filter((elem) => {
    return elem;
  }))
  .pipe(fs.createWriteStream('./my-subtitles.txt', 'latin1'));

  
  function numberConverter(num) {
    num = num.toString();
    return Number(num.slice(0, num.length - 3) + "." + num.slice(num.length - 3));
  }