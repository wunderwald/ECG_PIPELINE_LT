const fs = require('fs');

module.exports = (filename, streams, outputDir, fileExtension) => {
    const streamNames = [...Object.keys(streams)];
    streamNames.forEach(streamName => {
        const stream = streams[streamName];
        const data = stream.join('\n');
        const outputPath = `${outputDir}/${filename.split('.')[0]}_${streamName}.${fileExtension}`;
        fs.writeFileSync(outputPath, data);
    })
}