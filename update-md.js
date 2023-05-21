// updates metadata with the image IPFS (once uploaded), and optionally change the token description!

import * as fs from "fs";
import "json";

for(let i = 1; i < 11; i++) {
    fs.readFile('output/json/' + i.toString() + '.json', 'utf8', function(err, data) {
        let rawMetadata = JSON.parse(data);
        rawMetadata['image'] = 'https://bafybeifozeeqpvvdxuwvq3rvafdm5q7xkmdr2qnxh4h6xkcybfva6zwlay.ipfs.w3s.link/img/'+i+'.png';
        rawMetadata['description'] = 'Ascii Radbros on chain. Just tell \'em to 99 104 101 99 107 32 116 104 101 32 99 104 97 105 110.'
        rawMetadata['name'] = `Ascii Radbro #${i}`
        console.log(rawMetadata)
        console.log( JSON.stringify(rawMetadata))
        // console.log('rawMetadata')
        fs.writeFile("output/finaljson/" + i.toString() + ".json", JSON.stringify(rawMetadata), (err) => {
            if (err) {
              console.error(err);
            }          
    });
});
}