module.exports = filename => filename
    .replace('_ecg1', '')
    .replace('_ECG1', '')
    .replace('_ecg2', '')
    .replace('_ECG2', '');