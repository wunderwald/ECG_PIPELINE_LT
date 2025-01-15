const processLT = require('./processLT');

const process = {
    lt: processLT
};

//returns [ { name, streams } ] 
//  => streams: processed ecg channels
//  => name: unique output name: <experiment>_<subject>_ECG<1|2>_<channel<i>|time>
module.exports = (ecgPaths, markerPaths, experiment, childData=false) => {
    const processedEcgData = process[experiment](ecgPaths, markerPaths, childData);
    return processedEcgData;
}