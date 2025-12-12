const fs = require('fs');

module.exports = (ibi, isInterpolated, path, unit) => {
    const header = `${unit}, isInterpolated\n`
    let body = '';
    for (let i = 0; i < ibi.length; ++i) {
        body = `${body}${ibi[i]}, ${isInterpolated[i]}\n`;
    }
    const csv = `${header}${body}`;
    fs.writeFileSync(path, csv);
}