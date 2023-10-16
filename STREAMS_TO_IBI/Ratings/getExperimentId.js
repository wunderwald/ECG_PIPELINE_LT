const getExperimentId = (experimentTitle) => {
    if(experimentTitle === "WP3") return "wp3";
    if(experimentTitle === "EMPATHY") return "empathy";
    if(experimentTitle === "cardio-respiratory coupling") return "cardresp";
    throw `invalid experiment title: ${experimentTitle}`;
};

module.exports = getExperimentId;