# ECG DATA PROCESSING 

Transform dual ecg data that's recorded to xdf files using LabRecorder to 1) input files for "Artiifact" (which is used to calculated IBIs from the data), 2) csv files for each channel for each recording and 3) graphics for visual data quality validation

## How to use:

0) Create the following directories (if they don't exist): ./JS/artiifact_data, ./graphics, ./recordings, ./recordings/xdf, ./recordings/csv, ./streams (this will be automated in  future version of the pipeline)
1) Move .xdf files to ./recordings/xdf
2) Run main.m using matlab
3) The artiifact data will be stored to ./JS/artiifact_data, the svg files are stored in ./graphics, the per-channel csv files are stored in ./streams


## Requirements:

This pipeline requires Node.js and Shell scripts.
It runs on macOS, it might run on Linux, it probably doesn't run on Windows.
