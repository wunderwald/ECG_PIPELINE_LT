import { CurveInterpolator } from 'curve-interpolator';
import { plot } from 'nodeplotlib';

const points = [
    [0, 4],
    [1, 2],
    [3, 6.5],
    [4, 8],
    [15.5, 4],
    [17, 3],
    [18, 0],
];

const interp = new CurveInterpolator(points, { tension: 0.2 });

// get single point
const position = .2; // [0 - 1]
const pt = interp.getPointAt(position);

// get points evently distributed along the curve
const segments = 1000;
const pts = interp.getPoints(segments);


// plot
const dataRaw = [{
    x: points.map(p => p[0]),
    y: points.map(p => p[1]),
    type: 'scatter',
}, ];

const dataInterpl = [{
    x: pts.map(p => p[0]),
    y: pts.map(p => p[1]),
    type: 'scatter',
}, ];

plot(dataRaw);
plot(dataInterpl);