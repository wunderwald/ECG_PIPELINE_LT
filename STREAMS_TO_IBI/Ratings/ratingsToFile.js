const fs = require("fs");

module.exports = (ratings, keys) => {
    //test keys
    if(ratings.some(rating => keys.some(key => rating[key] === undefined))){
        throw `Some rating entries did not provide all keys (keys: ${keys.join(', ')}, rating: ${rating})`;
    }

    const header = keys.join("\t");
    const body = ratings.map(rating => `${keys.map(key => rating[key]).map(val => val === "" ? "unset" : val).join('\t')}`).join("\n");
    const tsv = `${header}\n${body}`;
    fs.writeFileSync('./ratings_processed.tsv', tsv);
}