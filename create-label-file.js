import fs from 'fs';
import { parse, map } from 'subtitle';

fs.createReadStream('./seul-sur-mars.srt', 'latin1')
  .pipe(parse())
  .pipe(map((node) => {
    if (node.type === 'cue') {
      const elem = node.data;
      const text = elem.text.replace(/\n/g, " ");

      return `${elem.start}\t\t${elem.end}\t\t${text}\n`;
    }
  }))
  .pipe(fs.createWriteStream('./my-subtitles.txt', 'latin1'));