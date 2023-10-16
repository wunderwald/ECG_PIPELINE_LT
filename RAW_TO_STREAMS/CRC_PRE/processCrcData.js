const discoverInputFiiles = require('./discoverInputFiles');
const readInputFile = require('./readInputFile');
const crop = require('./crop');
const write = require('./write');

const LOG = true;
const log = txt => LOG && console.log(txt);


const directories = {
    raw: './recordings/raw',
    csvOut: '../streams'
};

module.exports = () => {
    //get a list of all *cardresp.txt files
    const inputFiles = discoverInputFiiles(directories.raw);
    log(`# Discovering input files:\n${inputFiles.join('\n')}`);

    inputFiles.forEach((file, i) => {
        log(`\n## Processing ${file}`);

        //read channels from file
        const inputPath = `${directories.raw}/${file}`;
        const channels = readInputFile(inputPath);
        if(!channels){
            return;
        }

        //crop channels: only data between the 2 markers
        const croppedChannels = crop(channels);
        if(!croppedChannels){
            return;
        }

        //write channels
        const subjectId = file.split('.')[0];
        write(subjectId, croppedChannels, directories.csvOut, 'csv');

    });
};