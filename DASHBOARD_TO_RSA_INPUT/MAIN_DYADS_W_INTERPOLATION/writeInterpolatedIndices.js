const fs = require('fs');

module.exports = (interpolatedIndices, path) => {
    const header = 'index\n';
    const body = interpolatedIndices.join('\n');
    const csv = `${header}${body}`;
    fs.writeFileSync(path, csv);
}