const indexOfClosestMatch = require('./indexOfClosestMatch');
const readEcgStreams = require('./readEcgStreams');
const readMarkerFile = require('./readMarkerFile');
const writeStreamData = require('./writeStreamData');

const makeOutputFileName = path => {
    const parts = path.split("/");
    const subject = parts[parts.length - 2];
    const ecgNumber = parts[parts.length - 1];
    return `${subject}_${ecgNumber}`;
}

const getSubject = path => {
    const parts = path.split("/");
    const subject = parts[parts.length - 2];
    return subject;
}

const markersToUniqueMarkers = markers => {
    const counters = new Map();
    const uniqueMarkers = markers.map(marker => {
        counters.set(marker.marker, counters.has(marker.marker) ? counters.get(marker.marker) + 1 : 1);
        return ({
            marker: `${marker.marker}_${counters.get(marker.marker)}`,
            time: marker.time
        });
    });
    return uniqueMarkers;
};

module.exports = (ecgPath, markerPaths, segments) => {

    // read ecg data
    const ecg = {
        streams: readEcgStreams(ecgPath),
        name: makeOutputFileName(ecgPath),
        subject: getSubject(ecgPath),
    };

    // find matching marker path
    const markerPath = markerPaths.find(p => getSubject(p) === ecg.subject);
    if (!markerPath) {
        console.warn(`ERROR: Missing marker file.`);
        return;
    }

    // read markers
    const markers = markersToUniqueMarkers(readMarkerFile(markerPath));
    if (!markers) {
        console.warn(`ERROR: Missing marker data. Most probably the marker stream is empty or doesn't exist. ${ecg.subject} will be ignored.`);
        return;
    }

    // process each segment
    segments.forEach(segment => {

        console.log(`... ${segment.label}`);

        const useManualMarkers = segment.start_ms_manual && segment.end_ms_manual;

        // get time of start and end marker
        const timeRange = useManualMarkers
            ? {
                start: { time: segment.start_ms_manual },
                end: { time: segment.end_ms_manual }
            }
            : {
                start: markers.find(m => m.marker.toLowerCase() === segment.start.toLowerCase()),
                end: markers.find(m => m.marker.toLowerCase() === segment.end.toLowerCase())
            };

        if (!timeRange.start || !timeRange.end) {
            console.warn(`ERROR: Missing start/end marker(s). ${segment.label} will be skipped.`);
            return;
        }

        // apply fixed duration
        if (segment.fixedDuration_ms) {
            timeRange.end.time = timeRange.start.time + segment.fixedDuration_ms;
        }

        //get index of markers in time stream
        const timeStream = ecg.streams.time.map(str => +str);
        const timeRangeIndices = {
            start: indexOfClosestMatch(timeStream, +timeRange.start.time),
            end: indexOfClosestMatch(timeStream, +timeRange.end.time)
        };
        if (timeRangeIndices.start === -1 || timeRangeIndices.end === -1) {
            console.warn(`ERROR: Matlab markers are out of range of ecg recording. ${segment.label} will be skipped.`);
            return;
        };

        //filter ecg streams using markers
        const processed = {
            streams: [...Object.keys(ecg.streams)].reduce((out, streamName) => {
                const stream = ecg.streams[streamName];
                out[streamName] = stream.filter((val, i) => i >= timeRangeIndices.start && i < timeRangeIndices.end);
                return out;
            }, ({})),
            name: `${segment.label}_${ecg.name}, ${ecg.subject}`,
            subject: ecg.subject,
        };

        // write processed data
        writeStreamData(processed.name, processed.streams, ecg.subject);
    });
};
