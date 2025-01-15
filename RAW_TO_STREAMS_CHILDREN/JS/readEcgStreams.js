const parseCSV = require('csv-parse/lib/sync');
const fs = require('fs');

const initStreamsObject = keys => keys.reduce((o, key) => {
    o[key] = [];
    return o;
}, ({}));

module.exports = path => {
    //read raw data
    const raw = fs.readFileSync(path);
    
    //parse csv
    const streamNames = ['time', ...[...Array(3)].map((d, i) => `channel${i}`)];
    const rows = parseCSV(raw, {
        columns: streamNames,
        skipEmptyLines: true
    });
    
    const streams = rows.reduce((streams, row) => {
        [...Object.keys(row)].forEach(streamName => streams[streamName].push(row[streamName]));
        return streams;
    }, initStreamsObject(streamNames))

    return streams;
}