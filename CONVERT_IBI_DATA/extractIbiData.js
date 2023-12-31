/* 
Matches dyads from an input dataset that has been exported from ibxx.at/ibi_v2, reads their ibis and writes them to a combined csv dataset.

by Moritz Wunderwald, 2023
*/

import * as fs from 'fs';

const USE_MS_OFFSET = true;

// i/0
const INPUT_DIR = './dashboardOutputData';
const OUTPUT_DIR = './individualIbiData';

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

// make or clear output dir
const rmdirRecursive = dir => {
    fs.readdirSync(dir).forEach(o => {
        const path = `${dir}/${o}`;
        const isFile = fs.lstatSync(path).isFile();
        if(isFile){
            fs.rmSync(path);
            return;
        }
        rmdirRecursive(path);
    });
    fs.rmdirSync(dir);
};
if(fs.existsSync(OUTPUT_DIR)) rmdirRecursive(OUTPUT_DIR);
fs.mkdirSync(OUTPUT_DIR);

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

// extract IBI data for each input file
inputFiles.forEach(inputFile => {

    // process dyad
    const dyadId = inputFile.dyadId;
    const experimentId = inputFile.experiment;
    const groupId = inputFile.group;
    const channel = inputFile.channel;
    const ecgLabel = inputFile.ecgLabel;
    console.log(`# Processing ${ecgLabel} of dyad ${dyadId} of group ${groupId} [experiment ID: ${experimentId}, channel ID: ${channel}] ...`);

    // read data
    const data = JSON.parse(fs.readFileSync(inputFile.path));

    // get IBIs in milliseconds
    const ibi_ms = data.ibi.ms;

    // get timing of first ibi (time of first non-excluded peak)
    if(data.startIndex !== 0 || data.removedRegions.length > 0){
        console.warn("! unprecise timing: script assumes that start index is 0 and that no regions are excluded.");
    }
    if(data.endIndex < data.ecg[data.ecg.length-1].index){
        console.warn("! excess data: script assumes that no data is excluded at the end of the recording");
    }
    const secondPeakIndex = data.peaksCropped[1];
    const secondPeakTime = 1000 / data.samplingRate * secondPeakIndex;

    // make time-series of ibis
    const makeIbiTimeSeries = (ibiList, msOffset) => {
        let accTime = msOffset || 0;
        const ts = [];
        ibiList.forEach(ibiSample => {
            ts.push({t: accTime, ibi: ibiSample});
            accTime += ibiSample;
        });
        return ts;
    };
    const tsIbi = makeIbiTimeSeries(ibi_ms, USE_MS_OFFSET ? secondPeakTime : 0)
        .sort((a, b) => a.t - b.t);

    // make csv content
    const head = "t_ms, ibi_ms";
    const body = tsIbi.reduce((txt, sample) => `${txt}${sample.t}, ${sample.ibi}\n`, "");
    const csv = `${head}\n${body}`;

    // make filename
    const filename = `${experimentId}_${groupId}_${dyadId}_${channel}_${ecgLabel}.csv`;
    const outputPath = `${OUTPUT_DIR}/${filename}`;

    // write csv to file
    fs.writeFileSync(outputPath, csv);
});