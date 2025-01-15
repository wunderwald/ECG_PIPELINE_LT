const filterByMarkers = require('./filterByMarkers');

const ltSegments_adults = [
    {
        label: 'lt_madlibs',
        start: '1_1',
        end: '2_1',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
    },
    {
        label: 'lt_video_a',
        start: '3_1',
        end: '4_1',
        minDuration_ms: 300000, // 5min
        maxDuration_ms: 600000, // 10 min
    },
    {
        label: 'lt_video_b',
        start: '3_2',
        end: '4_2',
        minDuration_ms: 300000, // 5min
        maxDuration_ms: 600000, // 10 min
    },
    {
        label: 'lt_free_interaction',
        start: '5_1',
        end: '6_1',
        minDuration_ms: 600000, // 10min
        maxDuration_ms: 1200000, // 20 min
    },
    {
        label: 'lt_castle_knights',
        start: '7_1',
        end: '8_1',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY
    },
];

module.exports = (ecgPaths, markerPaths) => {
    const segments = ltSegments_adults;

    segments.forEach(segment => {
        console.log(`\n## Processing lt [${segment.label}]`);
        filterByMarkers(
            ecgPaths,
            markerPaths,
            {
                start: segment.start,
                end: segment.end
            },
            segment.label,
            true,
            {
                minDuration_ms: segment.minDuration_ms,
                maxDuration_ms: segment.maxDuration_ms,
            },
        );
    });
};
