/* 
Converts dashboardOutputData to dyad ibi files.
Uses cubic spline interpolation to replace excluded regions.
Exports metadata about sampling rates and length of interpolated regions.
*/

const fs = require('fs');
const getChannelIndex = require('./getChannelIndex');
const calcIbiInterpolated = require('./calcIbiInterpolated');
const makeIsInterpolated = require('./makeIsInterpolated');
const writeIbi = require('./writeIbi');
const writeInterpolatedIndices = require('./writeInterpolatedIndices');
const writeKeyValue = require('./writeKeyValue');

const inputDir = '../dashboardOutputData';
const outputDir = './out';

// make or clear output directory
if (fs.existsSync(outputDir)) {
    fs.rmdirSync(outputDir, { recursive: true });
}
fs.mkdirSync(outputDir);

// read input dir
const inputFileNames = fs.readdirSync(inputDir)
    .filter(f => fs.lstatSync(`${inputDir}/${f}`).isFile())
    .filter(f => f.toLowerCase().includes('ecg1') || f.toLowerCase().includes('ecg2'))
    .filter(f => f.includes('empathy'));

// iterate over dyads
inputFileNames.forEach(fileName => {

    // read file
    const rawData = fs.readFileSync(`${inputDir}/${fileName}`);
    const data = JSON.parse(rawData);

    // get sampling rate
    const samplingRate = data.samplingRate;

    //calculate ibi
    const ibiData = calcIbiInterpolated(data, samplingRate);

    // make isInterpolated time series
    const ibiIsInterpolated = makeIsInterpolated(ibiData.ibi_samples, ibiData.interpolated_indices);

    // make output directory
    const outputSubdir = `${outputDir}/${fileName.replace('.csv', '')}`;
    if (fs.existsSync(outputSubdir)) {
        fs.rmdirSync(outputSubdir, { recursive: true });
    }
    fs.mkdirSync(outputSubdir);

    // write ibi data (ms and samples)
    const outputPathIbiSamples = `${outputSubdir}/ibi_samples.csv`;
    const outputPathIbiMs = `${outputSubdir}/ibi_ms.csv`;
    writeIbi(ibiData.ibi_samples, ibiIsInterpolated, outputPathIbiSamples, 'samples');
    writeIbi(ibiData.ibi_ms, ibiIsInterpolated, outputPathIbiMs, 'ms');

    // write data about interpolated indices
    const outputPathInterpolatedIndices = `${outputSubdir}/interpolated_indices.csv`;
    writeInterpolatedIndices(ibiData.interpolated_indices, outputPathInterpolatedIndices);

    // write metadata
    const outputPathMetadata = `${outputSubdir}/metadata.csv`;
    const metadata = [
        { 'key': 'samplingRate', 'value': samplingRate },
        { 'key': 'inputFile', 'value': fileName },
        { 'key': 'channel', 'value': getChannelIndex(fileName) },
        { 'key': 'totalIbis', 'value': ibiData.ibi_samples.length },
        { 'key': 'interpolatedIbis', 'value': ibiData.interpolated_indices.length },
    ];
    writeKeyValue(metadata, outputPathMetadata);
});