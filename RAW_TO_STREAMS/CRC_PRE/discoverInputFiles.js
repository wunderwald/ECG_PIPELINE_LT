const fs = require('fs');

//input files have the neming convention <subjectId>_cardresp.txt
module.exports = directory => fs.readdirSync(directory)
    .filter(o => fs.lstatSync(`${directory}/${o}`).isFile())
    .filter(file => file.endsWith('.txt') && (file.includes('cardresp') || file.includes('CRC')));