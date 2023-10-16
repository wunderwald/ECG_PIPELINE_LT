const writeStreamsToFile = require('./writeStreamsToFile');

module.exports = (filename, streams) => {
    const outputDir = '../streams';
    writeStreamsToFile(filename, streams, outputDir, 'csv');
}