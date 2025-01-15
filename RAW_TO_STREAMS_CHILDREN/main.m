clear();

% marker structuro for children or adults
CHILDREN = true;

% toggle processing steps
XDF_TO_CSV = true;
CSV_TO_STREAMS = false;
CREATE_GRAPHICS = false;

% Step 1: Convert XDF -> CSV
if XDF_TO_CSV
    addpath("./xdf_converter");
    xdfDirectory = "./recordings_child/xdf";
    csvDirectory = "./recordings_child/csv";
    subdirs = [ "lt" ];
    for subdir = subdirs
        xdfSubDirectory = xdfDirectory + "/" + subdir;
        csvSubDirectory = csvDirectory + "/" + subdir;
        xdfFiles = discoverXdfFiles(xdfSubDirectory);

        disp("# Found " + length(xdfFiles) + " xdf files in " + xdfSubDirectory);

        xdfPaths = toPaths(xdfSubDirectory, xdfFiles);
        xdfFilesToCsv(xdfPaths, csvSubDirectory);
    end
end

% Step 2: convert csv to stream txt and csv files using node.js
if CSV_TO_STREAMS
    if CHILDREN
        system("node ./csvToStreamsChildren.sh", '-echo');
    else
        system("node ./csvToStreams.sh", '-echo');
    end
end

% Step 3: create graphics for each recording
if CREATE_GRAPHICS
    streamsDirectory = "./streams";
    subjectListPath = streamsDirectory + "/subjectList.csv";
    graphicsDirectory = "./graphics";
    reinitDir(graphicsDirectory);
    subjectList = importSubjectList(subjectListPath);
    createGraphics(subjectList, streamsDirectory, graphicsDirectory);
end


clear();