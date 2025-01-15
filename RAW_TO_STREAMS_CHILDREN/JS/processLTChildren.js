const cutSegments = require('./cutSegments');
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
        start_ms_manual: promptNumber(`\nEnter start time for ${segment.label} in ms: `),
        end_ms_manual: promptNumber(`\nEnter end time for ${segment.label} in ms: `),
    }));
}

const getSegments = segments => {
    const response = prompt('\nDo you want to use the default segments? (y/n) ');
    const markersAreDefault = response !== 'n' && response !== 'N';
    return markersAreDefault ? segments : readManualSegments();
};


module.exports = (ecgPaths, markerPaths) => {
    ecgPaths.forEach(ecgPath => {
        console.log(`\n### processing ${ecgPath}`);
        // get list of segment data (either default or manual)
        const segments = getSegments(ltSegments_children);
        // use markers to cut and export ecg files into segments
        cutSegments(ecgPath, markerPaths, segments);
    });
};
