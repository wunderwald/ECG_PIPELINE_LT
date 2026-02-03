const fs = require('fs');

module.exports = (arr, path) => {
    let header = '';
    let body = '';
    for (let i = 0; i < arr.length; ++i) {
        header = `${header}, ${arr[i].key}`;
        body = `${body}, ${arr[i].value}`;
    }
    const csv = `${header}\n${body}\n`;
    fs.writeFileSync(path, csv);
}