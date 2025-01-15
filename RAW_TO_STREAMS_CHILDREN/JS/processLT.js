const filterByMarkers = require('./filterByMarkers');
const prompt = require('prompt-sync')();

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
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
        fixedDuration_ms: 300000 // 5min    
    },
    {
        label: 'lt_video_b',
        start: '4_2',
        end: '5_2',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
        fixedDuration_ms: 300000 // 5min    
    },
    {
        label: 'lt_free_interaction',
        start: '6_1',
        end: '7_1',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY,
        fixedDuration_ms: 300000 // 5min    
    },
    {
        label: 'lt_castle_knights',
        start: '8_1',
        end: '9_1',
        minDuration_ms: 0,
        maxDuration_ms: Number.POSITIVE_INFINITY
    },
];

const readManualSegments = () => {
    return ltSegments_children.map(segment => ({
        ...segment,
        start_ms_manual: prompt(`Enter start time for ${segment.label} in ms: `),
        start_ms_manual: prompt(`Enter start time for ${segment.label} in ms: `),
    }));
}

const getChildSegments = segments => {
    const response = prompt('Do you want to use the default segments for children? (y/n) ');
    const markersAreDefault = response === 'y' || response === 'Y';
    return markersAreDefault ? segments : readManualSegments();
};


module.exports = (ecgPaths, markerPaths, childData = false) => {
    const segments = childData ? getChildSegments(ltSegments_children) : ltSegments_adults;

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
                fixedDuration_ms: (segment.label === 'lt_free_interaction' && childData) ? 300000 : null // in child recordings, lt_free_interaction and videos are always 5min, independent of end marker
            },
            // optional manual start end times
            {
                start: segment.start_ms_manual,
                end: segment.end_ms_manual
            }
        );
    });
};
