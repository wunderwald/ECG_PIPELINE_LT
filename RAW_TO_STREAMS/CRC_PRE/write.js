const fs = require('fs');

const channelToFile = (data, directory, fileName, fileExtension) => {
    const csv = data.join('\n');
    const outputPath = `${directory}/${fileName}.${fileExtension}`;
    fs.writeFileSync(outputPath, csv);
};

module.exports = (subjectId, channels, directory, fileExtension) => {
    [...Object.keys(channels)].forEach(channelName => {
        const fileName = `${subjectId}_${channelName}`;
        const data = channels[channelName];
        channelToFile(data, directory, fileName, fileExtension);
    });
}