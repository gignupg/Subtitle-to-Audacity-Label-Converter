import fs from 'fs';
import { parse, map, filter } from 'subtitle';

let previousEnd = 0;

fs.createReadStream('./skam-s2-e09.srt', 'latin1')
  .pipe(parse())
  .pipe(map(node => {
    if (node.type === 'cue') {
      const prevEnd = previousEnd;
      const elem = node.data;

      const end = numberConverter(elem.end);
      const start = numberConverter(elem.start)

      previousEnd = end; 

      if (prevEnd || start > 1) {
        if (start - prevEnd > 1) {
          return `${prevEnd}\t\t${start}\t\tSilence\n`;
        }
      }
      return null;
    }
  }))
  .pipe(filter((elem) => {
    return elem;
  }))
  .pipe(fs.createWriteStream('./new-audacity-label.txt', 'latin1'));


  function numberConverter(num) {
    num = num.toString();
    return Number(num.slice(0, num.length - 3) + "." + num.slice(num.length - 3));
  }