const fs = require('fs');

module.exports = (directory) => {
    //get ids of all files
    const files = fs
        .readdirSync(directory)
        .filter(file => fs.lstatSync(`${directory}/${file}`).isFile());
    const ids = files
        .filter(file => file.endsWith('_time.csv'))
        .map(file => file.replace('_time.csv', ''));
    
    //create table/csv
    const head = ['subject'];
    const body = ids.join('\n');
    const csv = `${head}\n${body}`;

    //write csv
    fs.writeFileSync(`${directory}/subjectList.csv`, csv);
}