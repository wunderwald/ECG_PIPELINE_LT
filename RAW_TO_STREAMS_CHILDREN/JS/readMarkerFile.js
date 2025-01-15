const parseCSV = require('csv-parse/lib/sync');
const fs = require('fs');



module.exports = path => {
    //read raw data
    const raw = fs.readFileSync(path);
    
    //parse csv
    const keys = ['time', 'marker'];
    const rows = parseCSV(raw, {
        columns: keys,
        skipEmptyLines: true
    });
    
    return rows;
}