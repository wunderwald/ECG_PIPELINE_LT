const fs = require('fs');
const processEcgData = require('./processEcgData');
const writeSubjectList = require('./writeSubjectList');

const main = () => {

    const inputDir = '../recordings_child/csv';
    const outputDirStreams = '../streams';

    const experiments = ['lt'];

    //clear stream data
    fs.readdirSync(outputDirStreams)
        .filter(file => file.endsWith('.csv') && !(file.includes("CRC") || file.includes("cardresp")))
        .forEach(file => fs.rmSync(`${outputDirStreams}/${file}`));

    //convert csv files to stream data (1 txt/csv file per stream / ecg channel)
    experiments.forEach(experiment => {
        const dir = `${inputDir}/${experiment}`;

        //discover input files
        const inputPaths = fs.readdirSync(dir)
            //ignore dot files
            .filter(subDir => !subDir.startsWith("."))
            //select subdirectories
            .map(subDir => `${dir}/${subDir}`)
            .filter(path => fs.lstatSync(path).isDirectory())
            //reduce files in all subdirs to a list of paths
            .reduce((files, path) => [ ...files, ...fs.readdirSync(path).map(el => `${path}/${el}`) ], [])
            //select only ecg and marker files
            .filter(path => {
                const isFile = fs.lstatSync(path).isFile();
                const isECGFile = (path.includes('ECG') || path.includes('EKG')) && !path.includes("Impedances");
                const isMarkerFile = path.includes('Matlab_Stream');
                return isFile && (isECGFile || isMarkerFile);
            });
        
        //split input files to marker files and ecg files
        const { ecgPaths, markerPaths } = inputPaths.reduce((o, path) => {
            (path.includes('ECG') || path.includes('EKG')) && o.ecgPaths.push(path);
            path.includes("Matlab_Stream") && o.markerPaths.push(path);
            return o;
        }, { ecgPaths: [], markerPaths: [] })

        //use marker data and experiment name to crop / split streams and then write data to ../streams
        console.log("\n# Processing ECG data: ");
        processEcgData(ecgPaths, markerPaths, experiment);

    });
    //create subject list stream data directory
    writeSubjectList(outputDirStreams);
}

main();