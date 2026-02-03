module.exports = (ibi, interpolatedIndices) => {
    const _interpolatedIndices = interpolatedIndices.length > 0 ? interpolatedIndices.map(val => +val) : [];
    return ibi.map((x, i) => _interpolatedIndices.includes(i) ? 1 : 0);
}