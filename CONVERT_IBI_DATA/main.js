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
const ecg1Files = inputFiles.filter(inputFile => inputFile.ecgLabel === 'ecg1');
const getEcg2File = ecg1File => inputFiles.find(f => f.ecgLabel === 'ecg2'
    && ecg1File.dyadId === f.dyadId
    && ecg1File.experiment === f.experiment
    && ecg1File.group === f.group
    && ecg1File.channel === f.channel
);
const dyads = ecg1Files.map(ecg1File => {
    const ecg2File = getEcg2File(ecg1File);
    if(!ecg2File){
        console.warn(`! no ecg 2 file found for ${ecg1File.file} [experiment, group, dyad AND channel IDs must match].`);
        return null;
    }
    return {
        ecg1: ecg1File,
        ecg2: ecg2File
    }
}).filter(o => o);

// extract IBI data for each dyad
let i=0;
dyads.forEach(dyad => {
    if(i++ > 0) return;

    // process dyad
    const dyadId = dyad.ecg1.dyadId;
    console.log(`# Processing dyad ${dyadId}...`);

    // read data
    const pathEcg1 = dyad.ecg1.path;
    const pathEcg2 = dyad.ecg2.path;
    const dataEcg1 = JSON.parse(fs.readFileSync(pathEcg1));
    const dataEcg2 = JSON.parse(fs.readFileSync(pathEcg2));

    // get IBIs in milliseconds
    const ibiEcg1 = dataEcg1.ibi.ms;
    const ibiEcg2 = dataEcg2.ibi.ms;

    // make time-series of ibis
    const makeIbiTimeSeries = ibiList => {
        let accTime = 0;
        const ts = [];
        ibiList.forEach(ibiSample => {
            ts.push({t: accTime, ibi: ibiSample});
            accTime += ibiSample;
        });
        return ts;
    };
    const tsIbiEcg1 = makeIbiTimeSeries(ibiEcg1).map(o => ({...o, ecg: 'ecg1'}));
    const tsIbiEcg2 = makeIbiTimeSeries(ibiEcg2).map(o => ({...o, ecg: 'ecg2'}));

    // make combined timeseries
    const tsIbiCombined = [...tsIbiEcg1, ...tsIbiEcg2].sort((a, b) => a.t - b.t);
    console.log(tsIbiCombined);

    // make csv
});