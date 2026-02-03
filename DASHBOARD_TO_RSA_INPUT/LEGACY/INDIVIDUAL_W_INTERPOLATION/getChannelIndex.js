module.exports = filename =>
    filename.includes('channel0') ? 0 :
    filename.includes('channel1') ? 1 :
    filename.includes('channel2') ? 2 :
    undefined;