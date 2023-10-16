const fs = require('fs');
const parseCSV = require('csv-parse/lib/sync');

const initcChannelsObject = keys => keys.reduce((o, key) => {
    o[key] = [];
    return o;
}, ({}));

module.exports = path => {
    //read raw data
    const raw = fs.readFileSync(path);
    
    //parse tsv
    const numCols = (parseCSV(raw, { delimiter: '\t', toLine: 1 }))[0].length;
    const channelNames = numCols === 5
        ? ['time', 'ecg', 'resp', 'fro', 'markers']
        : numCols === 3 
            ? ['time', 'ecg', 'markers']
            : null;
    if(!channelNames){
        console.error(`Invalid number of columns (${numCols}). Script needs to be adapted.`);
        return null;
    }
    const rows = parseCSV(raw, {
        columns: channelNames,
        skipEmptyLines: true,
        delimiter: '\t'
    });
    
    //reuce rows to object of channels
    const channels = rows.reduce((channels, row) => {
        [...Object.keys(row)].forEach(channelName => {
            const d = row[channelName];
            const num = typeof d === 'number' ? d : +(d.replace(/,/g, '.'));
            channels[channelName].push(num);
        });
        return channels;
    }, initcChannelsObject(channelNames))
    

    return channels;
}