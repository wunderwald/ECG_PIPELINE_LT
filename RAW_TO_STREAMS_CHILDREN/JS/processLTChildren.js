const filterByMarkers = require('./filterByMarkers');
const prompt = require('prompt-sync')();

const ltSegments_children = [
    {
        label: 'lt_tangram_alone_1',
        start: '1_1',
        end: 'End_1',
    },
    {
        label: 'lt_tangram_rest_1',
        start: '3_1',
        end: 'End_2',
    },
    {
        label: 'lt_tangram_together_1',
        start: '2_1',
        end: 'End_3',
    },
    {
        label: 'lt_tangram_rest_2',
        start: '3_2',
        end: 'End_4',
    },

    {
        label: 'lt_tangram_alone_2',
        start: '1_2',
        end: 'End_5',
    },
    {
        label: 'lt_tangram_rest_3',
        start: '3_3',
        end: 'End_6',
    },
    {
        label: 'lt_tangram_together_2',
        start: '2_2',
        end: 'End_7',
    },
    {
        label: 'lt_tangram_rest_4',
        start: '3_4',
        end: 'End_8',
    },
    {
        label: 'lt_video_a',
        start: '4_1',
        end: '5_1',
        fixedDuration_ms: 300000 // 5min    
    },
    {
        label: 'lt_video_b',
        start: '4_2',
        end: '5_2',
        fixedDuration_ms: 300000 // 5min    
    },
    {
        label: 'lt_free_interaction',
        start: '6_1',
        end: '7_1',
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

const promptNumber = question => {
    let response = -1;
    let valid = false;
    while(!valid) {
        response = +(prompt(question));
        valid = response && !isNaN(response) && response >= 0;
        if(!valid) console.log('Please enter a valid number. [number > 0]');
    }
    return response
}

const readManualSegments = () => {
    return ltSegments_children.map(segment => ({
        ...segment,
        start_ms_manual: promptNumber(`Enter start time for ${segment.label} in ms: `),
        start_ms_manual: promptNumber(`Enter end time for ${segment.label} in ms: `),
    }));
}

const getChildSegments = segments => {
    const response = prompt('Do you want to use the default segments for children? (y/n) ');
    const markersAreDefault = response !== 'n' && response !== 'N';
    return markersAreDefault ? segments : readManualSegments();
};


module.exports = (ecgPaths, markerPaths) => {
    const segments = getChildSegments(ltSegments_children);

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
            // test / fixed durations
            {
                minDuration_ms: segment?.minDuration_ms,
                maxDuration_ms: segment?.maxDuration_ms,
                fixedDuration_ms: segment?.fixedDuration_ms
            },
            // optional manual start end times
            {
                start: segment.start_ms_manual,
                end: segment.end_ms_manual
            }
        );
    });
};
