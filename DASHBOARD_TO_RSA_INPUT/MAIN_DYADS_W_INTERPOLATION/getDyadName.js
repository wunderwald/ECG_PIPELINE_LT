const removeEcgName = require('./removeEcgName');
const removeChannelName = require('./removeChannelName');
const removeJson = require('./removeJson');

module.exports = filename => removeEcgName(removeChannelName(removeJson(filename)));