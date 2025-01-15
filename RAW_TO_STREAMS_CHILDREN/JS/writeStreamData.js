const fs = require('fs');
const writeStreamsToFile = require('./writeStreamsToFile');

module.exports = (filename, streams, subdir) => {
    const outputDir = `../streams/${subdir}`;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    writeStreamsToFile(filename, streams, outputDir, 'csv');
}