module.exports = (arr, value) => {
    const closestMatch = arr.reduce((best, current) => {
        const bestError = Math.abs(value - best);
        const currentError = Math.abs(value - current);
        return bestError < currentError ? best : current;
    }, Number.POSITIVE_INFINITY);
    return arr.indexOf(closestMatch);
};