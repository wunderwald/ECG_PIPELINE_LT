clear();


% Step 1: Convert XDF -> CSV
addpath("./xdf_converter");
xdfDirectory = "./recordings/xdf";
csvDirectory = "./recordings/csv";
subdirs = [ "lt" ];
for subdir = subdirs
    xdfSubDirectory = xdfDirectory + "/" + subdir;
    csvSubDirectory = csvDirectory + "/" + subdir;
    xdfFiles = discoverXdfFiles(xdfSubDirectory);

    disp("# Found " + length(xdfFiles) + " xdf files in " + xdfSubDirectory);

    xdfPaths = toPaths(xdfSubDirectory, xdfFiles);
    xdfFilesToCsv(xdfPaths, csvSubDirectory);
end


% Step 2: Convert CSV -> Streams using node.js: see readme.md for details

clear();