/* 
Converts dashboardOutputData to dyad ibi files.
Uses cubic spline interpolation to replace excluded regions.
Exports metadata about sampling rates and length of interpolated regions.
*/

const fs = require('fs');
const getDyadName = require('./getDyadName');
const getChannelIndex = require('./getChannelIndex');
const calcIbiInterpolated = require('./calcIbiInterpolated');
const makeIsInterpolated = require('./makeIsInterpolated');
const writeIbi = require('./writeIbi');
const writeInterpolatedIndices = require('./writeInterpolatedIndices');
const writeKeyValue = require('./writeKeyValue');

const inputDir = '../dashboardOutput_brokenDyads';
const outputDir = './out';

// make or clear output directory
if (fs.existsSync(outputDir)) {
    fs.rmdirSync(outputDir, { recursive: true });
}
fs.mkdirSync(outputDir);

// read input dir
const inputFileNames = fs.readdirSync(inputDir)
    .filter(f => fs.lstatSync(`${inputDir}/${f}`).isFile())
    .filter(f => f.toLowerCase().includes('ecg1') || f.toLowerCase().includes('ecg2'));

// list dyad names
const dyadNames = inputFileNames.map(getDyadName);

// iterate over dyads
dyadNames.forEach(dyadName => {
    console.log(`# Processing ${dyadName}`);

    // find ecg 1 & 2 file names
    const fileNameEcg1 = inputFileNames.find(f => f.toLowerCase().includes('ecg1') && getDyadName(f) === dyadName);
    const fileNameEcg2 = inputFileNames.find(f => f.toLowerCase().includes('ecg2') && getDyadName(f) === dyadName);

    if (!fileNameEcg1) {
        console.error(`! No ECG 1 file found for dyad '${dyadName}'.`);
        return;
    }
    if (!fileNameEcg2) {
        console.error(`! No ECG 2 file found for dyad '${dyadName}'.`);
        return;
    }

    // read files
    const rawDataEcg1 = fs.readFileSync(`${inputDir}/${fileNameEcg1}`);
    const rawDataEcg2 = fs.readFileSync(`${inputDir}/${fileNameEcg2}`);
    const dataEcg1 = JSON.parse(rawDataEcg1);
    const dataEcg2 = JSON.parse(rawDataEcg2);

    // get sampling rate
    const samplingRate = dataEcg1.samplingRate;

    //calculate ibi
    const ibiDataEcg1 = calcIbiInterpolated(dataEcg1, samplingRate);
    const ibiDataEcg2 = calcIbiInterpolated(dataEcg2, samplingRate);

    // make isInterpolated time series
    const ibiIsInterpolatedEcg1 = makeIsInterpolated(ibiDataEcg1.ibi_samples, ibiDataEcg1.interpolated_indices);
    const ibiIsInterpolatedEcg2 = makeIsInterpolated(ibiDataEcg2.ibi_samples, ibiDataEcg2.interpolated_indices);

    // create dyad output name
    const channelIndexEcg1 = getChannelIndex(fileNameEcg1);
    const channelIndexEcg2 = getChannelIndex(fileNameEcg2);
    const dyadOutputName = `${dyadName}_channels_${channelIndexEcg1}_${channelIndexEcg2}`;

    // make output directory
    const outputDirDyad = `${outputDir}/${dyadOutputName}`;
    if (fs.existsSync(outputDirDyad)) {
        fs.rmdirSync(outputDirDyad, { recursive: true });
    }
    fs.mkdirSync(outputDirDyad);

    // make subdirectories for ecg1 and ecg2
    const outputDirEcg1 = `${outputDirDyad}/ECG1`;
    const outputDirEcg2 = `${outputDirDyad}/ECG2`;
    fs.mkdirSync(outputDirEcg1);
    fs.mkdirSync(outputDirEcg2);

    // write ibi data (ms and samples)
    const outputPathIbiSamplesEcg1 = `${outputDirEcg1}/ibi_samples.csv`;
    const outputPathIbiSamplesEcg2 = `${outputDirEcg2}/ibi_samples.csv`;
    const outputPathIbiMsEcg1 = `${outputDirEcg1}/ibi_ms.csv`;
    const outputPathIbiMsEcg2 = `${outputDirEcg2}/ibi_ms.csv`;
    writeIbi(ibiDataEcg1.ibi_samples, ibiIsInterpolatedEcg1, outputPathIbiSamplesEcg1, 'samples');
    writeIbi(ibiDataEcg2.ibi_samples, ibiIsInterpolatedEcg2, outputPathIbiSamplesEcg2, 'samples');
    writeIbi(ibiDataEcg1.ibi_ms, ibiIsInterpolatedEcg1, outputPathIbiMsEcg1, 'ms');
    writeIbi(ibiDataEcg2.ibi_ms, ibiIsInterpolatedEcg2, outputPathIbiMsEcg2, 'ms');

    // write data about interpolated indices
    const outputPathInterpolatedIndicesEcg1 = `${outputDirEcg1}/interpolated_indices.csv`;
    const outputPathInterpolatedIndicesEcg2 = `${outputDirEcg2}/interpolated_indices.csv`;
    writeInterpolatedIndices(ibiDataEcg1.interpolated_indices, outputPathInterpolatedIndicesEcg1);
    writeInterpolatedIndices(ibiDataEcg2.interpolated_indices, outputPathInterpolatedIndicesEcg2);

    // write metadata
    const outputPathMetadata = `${outputDirDyad}/metadata.csv`;
    const metadata = [
        { 'key': 'samplingRate', 'value': samplingRate },
        { 'key': 'inputFileECG1', 'value': fileNameEcg1 },
        { 'key': 'inputFileECG2', 'value': fileNameEcg2 },
        { 'key': 'channelEcg1', 'value': getChannelIndex(fileNameEcg1) },
        { 'key': 'channelEcg2', 'value': getChannelIndex(fileNameEcg2) },
        { 'key': 'totalIbisECG1', 'value': ibiDataEcg1.ibi_samples.length },
        { 'key': 'interpolatedIbisECG1', 'value': ibiDataEcg1.interpolated_indices.length },
        { 'key': 'totalIbisECG2', 'value': ibiDataEcg2.ibi_samples.length },
        { 'key': 'interpolatedIbisECG2', 'value': ibiDataEcg2.interpolated_indices.length },
    ];
    writeKeyValue(metadata, outputPathMetadata);
});