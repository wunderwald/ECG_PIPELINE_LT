const getMarkerIndices = markerChannel => markerChannel.reduce((indices, val, i) => {
    if(val > 4.2){
        indices.push(i);
    }
    return indices;
}, []);

const cropByMarkers = (arr, markerIndices) => arr.filter((val, i) => i >= markerIndices[0] && i <= markerIndices[1]);

module.exports = channels => {
    const markerIndices = getMarkerIndices(channels.markers);
    if(markerIndices.length !== 2){
        console.warn(`### Invalid number of markers. Expected 2, found ${markerIndices.length}`);
        return null;
    }
    return [...Object.keys(channels)].reduce((croppedChannels, key) => {
        croppedChannels[key] = cropByMarkers(channels[key], markerIndices);
        return croppedChannels;
    }, ({}))
};