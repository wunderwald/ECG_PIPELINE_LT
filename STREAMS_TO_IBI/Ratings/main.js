const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const makeRatingId = require('./makeRatingId');
const getExperimentId = require('./getExperimentId');
const write = require('./ratingsToFile');

const raw = fs.readFileSync('./ratings.csv');
const rows = parse(raw, {
    skip_empty_lines: true,
    delimiter: ';',
});

const [header0, header1, header2, header3, ...body] = rows;
if(header0.some(entry => entry === "")){
    console.log(header0);
    throw "No empty cells allowed in header. Please copy values manually.";
}
const ratingsWithMetadata = body.map(row => {
    const [comments, participant, ...ratings] = row;
    const ratingsWithMetadata = ratings.map(( val, i ) => ({
        participant,
        comments,
        quality: val,
        header0: header0[i+2],
        header1: header1[i+2],
        header2: header2[i+2],
        header3: header3[i+2],
    }));
    return ratingsWithMetadata;
}).reduce((all, row) => [...all, ...row], []);

//process ratings => array [ { id, experiment, quality }, ... ]
// -> id => similar to codes used in ./figures (includes, experiment, exp. params, channel, ecgid...)
// -> experiment => cardresp, wp3 or empathy
// -> quality => bad, ok, best OR "best, flipped", "best, flipped?"...
const ratings = ratingsWithMetadata.map(rating => {
    const participantId = `${rating.participant}`.padStart(3, "0");
    const experimentId = getExperimentId(rating.header0);
    const ratingId = makeRatingId(experimentId, participantId, rating);
    return !ratingId
        ? null
        : {
            id: ratingId,
            experiment: experimentId,
            quality: rating.quality
        };
}).filter(rating => rating !== null);

// write processed ratings to file
write(ratings, [ 'id', 'experiment', 'quality' ]);



