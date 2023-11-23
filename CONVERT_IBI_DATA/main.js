import * as fs from 'fs';

const INPUT_DIR = './dashboardOutputData';

// filename components
const EXPERIMENTS = ['lt_free_interaction'];
const GROUPS = ['IL', 'IC'];
const ECG_LABELS = {
    ecg1: ['ECG1', 'EKG_1', 'ECG_1'],
    ecg2: ['ECG2', 'EKG_2', 'ECG_2']
};

// filename parsing helpers
const getExperiment = f => {
    for(const e of EXPERIMENTS){
        if(f.includes(`${e}`)) return e;
    }
    return null;
};

const getGroup = f => {
    for(const g of GROUPS){
        if(f.includes(`_${g}_`)) return g;
    }
    return null;
};

const getEcgLabel = f => !!ECG_LABELS.ecg1.find(label => f.includes(label)) 
    ? 'ecg1' 
    : (!!ECG_LABELS.ecg2.find(label => f.includes(label))
        ? 'ecg2'
        : null);

const getChannel = f => f.includes('channel0') 
    ? 'channel0' 
    : (f.includes('channel1')
        ? 'channel1' 
        : (f.includes('channel2') 
            ? 'channel2' 
            : null));

const getDyadId = f => {
    const match = f.match(/_(\d{2})_/);
    return match ? match[1].replaceAll('_', '') : null;
};

// read files & parse filenames
const _inputFiles = fs.readdirSync(INPUT_DIR)
    .filter(file => fs.lstatSync(`${INPUT_DIR}/${file}`).isFile())
    .filter(file => file.endsWith('.json'))
    .map(file => ({
        file: file,
        path: `${INPUT_DIR}/${file}`,
        experiment: getExperiment(file),
        ecgLabel: getEcgLabel(file),
        group: getGroup(file),
        channel: getChannel(file),
        dyadId: getDyadId(file)
    }))

// filter filenames (invalid syntax), throw warnings
const inputFiles = [];
_inputFiles.forEach(inputFile => {
    if(!inputFile.experiment) {
        console.warn(`! no valid experiment identifier found for ${inputFile.file}. Excluding file.`);
        return;
    }
    if(!inputFile.ecgLabel) {
        console.warn(`! no valid ECG identifier found for ${inputFile.file}. Excluding file.`);
        return;
    }
    if(!inputFile.group) {
        console.warn(`! no valid group identifier found for ${inputFile.file}. Excluding file.`);
        return;
    }
    if(!inputFile.channel) {
        console.warn(`! no valid channel identifier found for ${inputFile.file}. Excluding file.`);
        return;
    }
    if(!inputFile.dyadId) {
        console.warn(`! no valid dyad ID found for ${inputFile.file}. Excluding file.`);
        return;
    }
    inputFiles.push(inputFile);
})

// make dyads