//for ONLINE version of dashboard (data on server) (ibi_dashboard_online)

// Copy ecg, time and peak data from directories in ECG_TO_IBI and create registry


const fs = require('fs');

const ibiDir = `../STREAMS_TO_IBI/ibiData`;
const streamsDir = `../RAW_TO_STREAMS/streams`;
const outputDir = "./ibi_dashboard_online/public/data";

const existsAndIsFile = path => fs.existsSync(path) && fs.lstatSync(path).isFile();

// STEP 1: for each ibi file, find ecg and time recording in streamsDir, 
//         ... then create a registry json: [ id, ibiPath, ecgPath, timePath ]
const isPeakFile = file => fs.lstatSync(`${ibiDir}/${file}`).isFile() && file.startsWith('peaks') && file.endsWith(".csv");
const peakFiles = fs.readdirSync(ibiDir).filter(isPeakFile);

const registryInput = peakFiles.map(peakFile => {
    //make and check ibi path
    const peakPath = `${ibiDir}/${peakFile}`;
    if( !existsAndIsFile(peakPath) ){
        throw `IBI file ${peakPath} does not exist at path.`;
    }

    //make ibi id
    const peakFileParts = peakFile.split('_');
    const peakId = peakFileParts.slice(1, peakFileParts.length - 1).join("_");

    //make & check ecg path
    const ecgFile = `${peakId}.csv`;
    const ecgPath = `${streamsDir}/${ecgFile}`;
    if( !existsAndIsFile(ecgPath) ){
        throw `Ecg file for ${peakFile} does not exist at path ${ecgPath}.`;
    }

    //make and check time path
    const timeFile = `${peakFileParts.slice(1, peakFileParts.length - 2).join("_")}_time.csv`;
    const timePath = `${streamsDir}/${timeFile}`;
    if( !existsAndIsFile(timePath) ){
        throw `Time file for ${peakFile} does not exist at path ${timePath}.`;
    }

    //return registry entry
    return {
        id: peakId,
        peakPath: peakPath,
        ecgPath: ecgPath,
        timePath: timePath,
        peakFile, timeFile, ecgFile
    }
});

// STEP 2: copy all files to data directory
// first clear directory
fs.readdirSync(outputDir)
    .filter(file => file.includes(".csv") || file.includes(".json"))
    .forEach(file => fs.rmSync(`${outputDir}/${file}`));
// then copy & register files
const registryOutput = registryInput.map(entry => {
    const ibiOutputPath = `${outputDir}/${entry.peakFile}`;
    const ecgOutputPath = `${outputDir}/${entry.ecgFile}`;
    const timeOutputPath = `${outputDir}/${entry.timeFile}`;
    fs.copyFileSync(entry.peakPath, ibiOutputPath);
    fs.copyFileSync(entry.ecgPath, ecgOutputPath);
    fs.copyFileSync(entry.timePath, timeOutputPath);
    return {
        id: entry.id,
        peakFile: entry.peakFile,
        ecgFile: entry.ecgFile,
        timeFile: entry.timeFile
    };
})

// STEP 3: write output registry to data directory
const registryOutputPath = `${outputDir}/registry.json`;
fs.writeFileSync(registryOutputPath, JSON.stringify(registryOutput));