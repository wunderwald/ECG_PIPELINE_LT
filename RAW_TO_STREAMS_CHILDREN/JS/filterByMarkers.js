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

module.exports = (ecgPaths, markerPaths, segments) => {

    ecgPaths.forEach(ecgPath => {
        console.log(`\n### processing ${ecgPath}`);

        // read ecg data
        const ecg = {
            streams: readEcgStreams(ecgPath),
            name: makeOutputFileName(ecgPath),
            subject: getSubject(ecgPath),
        };

        // get marker path
        const markerPath = markerPaths.find(p => getSubject(p) === ecg.subject);
        if (!markerPath) {
            console.warn(`ERROR: Missing marker file.`);
            return;
        }

        // read markers
        const markers = makeMarkersUnique
            ? markersToUniqueMarkers(readMarkerFile(markerPath))
            : readMarkerFile(markerPath);
        if (!markers) {
            console.warn(`ERROR: Missing marker data. Most probably the marker stream is empty or doesn't exist. ${ecg.subject} will be ignored.`);
            return;
        }

        // process each segment
        segments.forEach(segment => {

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
                console.warn(`ERROR: Missing start/end marker(s). ${ecg.subject} will be ignored.`);
                return;
            }

            // apply fixed duration
            if (testDurations && testDurations.fixedDuration_ms) {
                timeRange.end.time = timeRange.start.time + testDurations.fixedDuration_ms;
            }

            // test duration
            if (testDurations) {
                const duration_ms = +timeRange.end.time - +timeRange.start.time;
                if (duration_ms > testDurations.maxDuration_ms || duration_ms < testDurations.minDuration_ms) {
                    console.warn(`! segment duration out of range: ${label} is ${duration_ms}ms, should be between ${testDurations.minDuration_ms}ms and ${testDurations.maxDuration_ms}ms.`);
                }
            }

            //get index of markers in time stream
            const timeStream = ecg.streams.time.map(str => +str);
            const timeRangeIndices = {
                start: indexOfClosestMatch(timeStream, +timeRange.start.time),
                end: indexOfClosestMatch(timeStream, +timeRange.end.time)
            };
            if (timeRangeIndices.start === -1 || timeRangeIndices.end === -1) {
                console.warn(`ERROR: Matlab markers are out of range of ecg recording. ${ecg.subject} will be ignored.`);
                return;
            };

            //filter ecg streams using markers
            const processed = {
                streams: [...Object.keys(ecg.streams)].reduce((out, streamName) => {
                    const stream = ecg.streams[streamName];
                    out[streamName] = stream.filter((val, i) => i >= timeRangeIndices.start && i < timeRangeIndices.end);
                    return out;
                }, ({})),
                name: `${label}_${ecg.name}`,
                subject: ecg.subject,
            };

            // write processed data
            writeStreamData(processed.name, processed.streams);
        });
    });

};
