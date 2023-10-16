# Data processing pipeline for ECG data from the LT task

by Moritz Wunderwald, 2023

## About

This data processing pipeline converts ecg data recorded to xdf format using smarting software or labrecorder to verified ibi data in csv format by using a combination of automated and manual processing and validation steps.

## Prerequisites

Matlab, node.js and python3 must be installed on your machine.

## Processing steps

### RAW_TO_STREAMS - raw xdf data to csv streams

#### Step 1: Matlab

First, the xdf data is converted to csv files holding the exact same data using Matlab. The main script is /RAW_TO_STREAMS/main.m, it uses a xdf converter that is stored in /RAW_TO_STREAMS/xdf_converter.

##### How to execute:

- set up the following directories in /RAW_TO_STREAMS
    * /recordings
    * /recordings/xdf
    * /recordings/csv
- for each subset of the data, create an inner folder in /recordings/xdf (for example: /recordings/xdf/lt) and paste xdf data here
- run main.m using Matlab
- Note: there will be errors indicating that no sampling rate is set for the Matlab Stream / the trigger stream / marker stream. This behaviour is expected because markers don't follow regular intervals.
- the output data is written to inner folders in /recordings/csv/

#### Step 2: node.js

Now, the csv files from the previous step are converted to more specific files. The input csv files have columns for two ecg signals, their impedances, time and markers/triggers. This part of the pipeline exctracts the ecg information, merges it with time data and applies markers in order to create individual ecg files for each segment of the original recording. The output data are individual csv files (streams) for each recording segment for both of the escg channels.

##### How to execute

- switch to the directory /RAW_TO_STREAMS/JS in a terminal. Now run the main script main.js using node.js: ```node main```

### STREAMS_TO_IBI - detect peaks in stream data and calculate IBI

bla

### IBI_CORRECTION_UI - manual peak correction using [online dashboard](https://www.ibxx.at/ibi_v2/)

bla