const processLTChildren = require('./processLTChildren');

const process = {
    lt: processLTChildren
};

//returns [ { name, streams } ] 
//  => streams: processed ecg channels
//  => name: unique output name: <experiment>_<subject>_ECG<1|2>_<channel<i>|time>
module.exports = (ecgPaths, markerPaths, experiment) => {
    const processedEcgData = process[experiment](ecgPaths, markerPaths);
    return processedEcgData;
}