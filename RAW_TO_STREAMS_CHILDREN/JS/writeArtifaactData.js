const writeStreamsToFile = require('./writeStreamsToFile');

module.exports = (filename, streams, outputDir) => {
    writeStreamsToFile(filename, streams, outputDir, 'txt');
}