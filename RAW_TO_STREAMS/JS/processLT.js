const filterByMarkers = require('./filterByMarkers');

// user input helper
const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

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

//TODO fix these
const ltSegments_children = [
    {
        label: 'lt_tangram_alone_1',
        start: '1_1',
        end: 'End_1',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
    },
    {
        label: 'lt_tangram_rest_1',
        start: '3_1',
        end: 'End_2',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
    },
    {
        label: 'lt_tangram_together_1',
        start: '2_1',
        end: 'End_3',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
    },
    {
        label: 'lt_tangram_rest_2',
        start: '3_2',
        end: 'End_4',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
    },

    {
        label: 'lt_tangram_alone_2',
        start: '1_2',
        end: 'End_5',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
    },
    {
        label: 'lt_tangram_rest_3',
        start: '3_3',
        end: 'End_6',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
    },
    {
        label: 'lt_tangram_together_2',
        start: '2_2',
        end: 'End_7',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
    },
    {
        label: 'lt_tangram_rest_4',
        start: '3_4',
        end: 'End_8',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
    },
    {
        label: 'lt_video_a',
        start: '4_1',
        end: '5_1',
        minDuration_ms: 300000, // 5min
        maxDuration_ms: 600000, // 10 min
    },
    {
        label: 'lt_video_b',
        start: '4_2',
        end: '5_2',
        minDuration_ms: 300000, // 5min
        maxDuration_ms: 600000, // 10 min
    },
    {
        label: 'lt_free_interaction',
        start: '6_1',
        end: '7_1',
        minDuration_ms: 600000, // 10min
        maxDuration_ms: 1200000, // 20 min
    },
    {
        label: 'lt_castle_knights',
        start: '8_1',
        end: '9_1',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY
    },
];

const checkChildSegments = segments => {
    let markersAreDefault = true;
    rl.question(`# Do you need to set markers manually [y/n]`, reply => {
        markersAreDefault = reply !== 'y';
        rl.close();
    });
    if(markersAreDefault) return segments;

};

module.exports = (ecgPaths, markerPaths, childData = false) => {
    const segments = childData ? checkChildSegments(ltSegments_children) : ltSegments_adults;

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
                maxDuration_ms: segment.maxDuration_ms
            }
        );
    });
};
