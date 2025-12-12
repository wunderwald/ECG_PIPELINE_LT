import { CurveInterpolator } from 'curve-interpolator';
import { plot } from 'nodeplotlib';
import { createRequire } from "module";
const require = createRequire(
    import.meta.url);

// load data    
//const data = require("./wp3_010_wp3_wotoys_ECG2_channel2.json");
const data = require("../dashboardOutputData/wp3_009_wp3_wotoys_ECG1_channel1.json");
//const data = require("./testData_noRR.json");
//const data = require("./testData.json");

const peaks = [...data.peaks.sort((a, b) => a - b)];
const start_index = data.startIndex;
const end_index = data.endIndex;
const removed_regions = data.removedRegions.map(r => r.start < r.end ? r : { start: r.end, end: r.start });


// create located ibi list: [ {t, duration, type: 'ibi'} ]
const ibi_located = [];
for (let i = 1; i < peaks.length; ++i) {
    const peak0 = peaks[i - 1];
    const peak1 = peaks[i];
    if (peak0 <= start_index || peak0 >= end_index || peak1 <= start_index || peak1 >= end_index) continue;
    if (removed_regions.some(r =>
            (peak0 >= r.start && peak0 <= r.end) ||
            (peak1 >= r.start && peak1 <= r.end) ||
            (peak0 <= r.start && peak1 >= r.end)
        )) {
        continue;
    }
    ibi_located.push({ t: peak0, duration: peak1 - peak0, type: 'ibi' });
}

// calculate average ibi
const avg_ibi = ibi_located.reduce((sum, ibi) => sum + ibi.duration, 0) / ibi_located.length;

// create located rr list: [ {t, duration, type: 'rr'} ]
const rr_located = removed_regions.map(r => {
    //duration: interval btw last peak before and first peak after
    let intervalStart = undefined;
    let intervalEnd = undefined;
    for (const peak of peaks) {
        if (peak < r.start) intervalStart = peak;
        if (peak > r.end) {
            intervalEnd = peak;
            break;
        }
    }
    if (!intervalStart) intervalStart = r.start;
    if (!intervalEnd) intervalEnd = r.end;
    //const interval = r.end - r.start;
    const interval = intervalEnd - intervalStart;
    return { t: r.start, duration: interval, type: 'rr' };
});

// calc num of ibis for each removed region (how many ibis fit into removed region?)
const rr_located_processed = rr_located.map(r => {
    const numIbisFloor = Math.floor(r.duration / avg_ibi);
    const numIbisCeil = Math.ceil(r.duration / avg_ibi);
    const distFloor = Math.abs(avg_ibi - r.duration / numIbisFloor);
    const distCeil = Math.abs(avg_ibi - r.duration / numIbisCeil);
    return {
        ...r,
        numIbis: distFloor < distCeil ? numIbisFloor : numIbisCeil,
    };
});

// merge ibi and rr
const ibi_rr_located = [...[...ibi_located, ...rr_located_processed].sort((a, b) => a.t - b.t)];

// index structure
const interpolation_indices = [];
const ibi_indexed = [];
let index = 0;
ibi_rr_located.forEach(r => {
    //colloect real ibis as index/ibi pairs
    if (r.type === 'ibi') {
        ibi_indexed.push([index, r.duration]);
        ++index;
        return;
    }
    //created indices for values to be interpolated
    if (r.type === 'rr') {
        const indexGroup = [];
        for (let j = 0; j < r.numIbis; ++j) {
            indexGroup.push(index);
            ++index;
        }
        interpolation_indices.push(indexGroup);
        return;
    }
})

// Placeholders
// Interpolation only works if there are elements before AND after a region to be interpolated.
// if there are no real ibis before or after any interpolated region, placeholder ibis must be used.
let placeholder_start_index = undefined;
let placeholder_end_index = undefined;
if (interpolation_indices.length > 0) {
    const first_interpolation_index = Math.min(...interpolation_indices[0]);
    const last_interpolation_index = Math.max(...interpolation_indices[interpolation_indices.length - 1]);
    const first_real_ibi_index = Math.min(...ibi_indexed.map(el => el[0]));
    const last_real_ibi_index = Math.max(...ibi_indexed.map(el => el[0]));
    //create start placeholder
    if (first_interpolation_index < first_real_ibi_index) {
        placeholder_start_index = first_interpolation_index - 1;
        const placeholderValue = ibi_indexed.find(el => el[0] === first_real_ibi_index)[1];
        ibi_indexed.unshift([placeholder_start_index, placeholderValue]);
    }
    //create end placeholder
    if (last_interpolation_index > last_real_ibi_index) {
        placeholder_end_index = last_interpolation_index + 1;
        const placeholderValue = ibi_indexed.find(el => el[0] === last_real_ibi_index)[1];
        ibi_indexed.push([placeholder_end_index, placeholderValue]);
    }
}




// apply interpolation
const ibi_indexed_interpolated = new CurveInterpolator(ibi_indexed, { tension: 0.2 });


// get interpolated values for each interpolationIndex
const interpolated_values_grouped = interpolation_indices.map(indexGroup => {
    return indexGroup.map(i => [i, ibi_indexed_interpolated.lookup(i)[0][1]]);
});

// scale interpolated values (make sure their sum is close to removed region length the belong to)
// output: [ group: [ [index, interplIbi], [index, interplIbi], ... ], [ ... ], ... ]
const interpolated_values_scaled = interpolated_values_grouped.map((group, group_index) => {
    const interpolated_duration = group.reduce((sum, v) => sum + v[1], 0);
    const removed_region_duration = rr_located[group_index].duration;
    const scale = removed_region_duration / interpolated_duration;
    const scaled_group = group.map(v => [v[0], Math.round(v[1] * scale)]);
    return scaled_group;
});

// ungroup interpolated values: [ [index, ibi], [index, ibi]... ]
const ibi_interpolated = interpolated_values_scaled.reduce((arr, group) => [...arr, ...group], []);

// merge real and interpolated ibis
const ibi_merged = [
    ...ibi_indexed.filter(el => el[0] !== placeholder_start_index && el[0] !== placeholder_end_index),
    ...ibi_interpolated
].sort((a, b) => a[0] - b[0]);






const SHOW_IS_INTERPOLATED = false;
if (SHOW_IS_INTERPOLATED) {
    const ibiIsInterpolated = ibi_merged.map(el => [el[1], interpolation_indices.some(indexGroup => indexGroup.includes(el[0]))]);
    console.log(ibiIsInterpolated.join('\n'));
}




const PLOT = true;
if (PLOT) {
    //plot
    //raw data 
    const plt_raw = [{
        x: ibi_indexed.map(p => p[0]),
        y: ibi_indexed.map(p => p[1]),
        type: 'scatter',
    }, ];

    plot(plt_raw);

    //only interpolation
    const segments = 2000;
    const interpl_pts = ibi_indexed_interpolated.getPoints(segments);
    const plt_only_intpl = [{
        x: interpl_pts.map(p => p[0]),
        y: interpl_pts.map(p => p[1]),
        type: 'scatter',
    }, ];

    plot(plt_only_intpl);

    //merged
    const plt_intpl = [{
        x: ibi_merged.map(p => p[0]),
        y: ibi_merged.map(p => p[1]),
        type: 'scatter',
    }, ];

    plot(plt_intpl);

}