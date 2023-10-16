const getToyId = toyTitle => {
    if(toyTitle === "without toys") return "wotoys";
    if(toyTitle === "with toys") return "wtoys";
    throw `Invalid toy title: ${toyTitle}`;
};
const getEcgId = ecgTitle => {
    if(ecgTitle === "ECG 1") return "ECG1";
    if(ecgTitle === "ECG 2") return "ECG2";
    throw `Invalid Ecg title: ${ecgTitle}`;
}
const getEmpathyTypeId = empathyTypeTitle => {
    if(empathyTypeTitle === "hammer") return "empathyhammer";
    if(empathyTypeTitle === "neutral") return "empathyneutral";
    if(empathyTypeTitle === "knee/chair") return "empathychair";
    throw `Invalid empathy type title: ${empathyTypeTitle}`;
};
const getChannelId = channelTitle => {
    if(channelTitle === "ch 0") return "channel0";
    if(channelTitle === "ch 1") return "channel1";
    if(channelTitle === "ch 2") return "channel2";
    throw `invalid channel title: ${channelTitle}`;
}
const makeRatingIdWp3 = (participantId, rating) => {
    const toyId = getToyId(rating.header1);
    const ecgId = getEcgId(rating.header2);
    const channelId = getChannelId(rating.header3);
    return `wp3_${participantId}_wp3_${toyId}_${ecgId}_${channelId}`;
};
const makeRatingIdEmpathy = (participantId, rating) => {
    const empathyTypeId = getEmpathyTypeId(rating.header1);
    const ecgId = getEcgId(rating.header2);
    const channelId = getChannelId(rating.header3);
    return `empathy_${participantId}_${empathyTypeId}_${ecgId}_${channelId}`;
};
const makeRatingIdCardresp = (participantId, rating) => {
    //use only overall rating
    if(rating.header3 !== "overall") return null;
    return `${participantId}_cardresp_ecg`;
};

const makeRatingId = (experimentId, participantId, rating) => {
    if(experimentId === "wp3") return makeRatingIdWp3(participantId, rating);
    if(experimentId === "empathy") return makeRatingIdEmpathy(participantId, rating);
    if(experimentId === "cardresp") return makeRatingIdCardresp(participantId, rating);
    throw `invalid experiment id: ${experimentId}`;
}

module.exports = makeRatingId;