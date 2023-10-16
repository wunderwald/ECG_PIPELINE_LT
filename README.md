# Data processing pipeline for ECG data from the LT task

by [Moritz Wunderwald](mailto:code@moritzwunderwald.de), 2023

## About

This data processing pipeline converts ecg data recorded to xdf format using smarting software or labrecorder to verified ibi data in csv format by using a combination of automated and manual processing and validation steps.

## Prerequisites

Matlab, node.js and python3 must be installed on your machine.

## Processing steps

### RAW_TO_STREAMS - raw xdf data to csv streams

#### Step 1: Matlab

First, the xdf data is converted to csv files holding the exact same data using Matlab. The main script is ```/RAW_TO_STREAMS/main.m```, it uses a xdf converter that is stored in ```/RAW_TO_STREAMS/xdf_converter```.

##### How to execute:

- set up the following directories in ```/RAW_TO_STREAMS```
    * ```/recordings```
    * ```/recordings/xdf```
    * ```/recordings/csv```
- for each subset of the data, create an inner folder in ```/recordings/xdf``` (for example: ```/recordings/xdf/lt```) and paste xdf data here
- run ```main.m``` using Matlab
- Note: there will be errors indicating that no sampling rate is set for the Matlab Stream / the trigger stream / marker stream. This behaviour is expected because markers don't follow regular intervals.
- the output data is written to inner folders in ```/recordings/csv/```

#### Step 2: node.js

Now, the csv files from the previous step are converted to more specific files. The input csv files have columns for two ecg signals, their impedances, time and markers/triggers. This part of the pipeline exctracts the ecg information, merges it with time data and applies markers in order to create individual ecg files for each segment of the original recording. The output data are individual csv files (streams) for each recording segment for both of the escg channels.

##### How to execute

- switch to the directory ```/RAW_TO_STREAMS/JS``` in a terminal: ```cd RAW_TO_STREAMS/JS``` (assuming the terminal is opened in the base directory)
- install dependencies using ```npm install```
- Now run the main script main.js using node.js: ```node main```
- the output data is stored in ```/RAW_TO_STREAMS/streams```

### STREAMS_TO_IBI - detect peaks in stream data and calculate IBI

In this step, a peak detection algorithm from [neurokit2](https://neuropsychology.github.io/NeuroKit/) is applied to the stream data, resulting in csv files that hold inter-beat interval (IBI) data. Optionally, two types of plots can be generated: a distribution plot of IBI data as well as ecg plots with overlaid peaks.

##### How to execute

- switch to the directory ```/STREAMS_TO_IBI``` in a terminal: ```cd STREAMS_TO_IBI``` (assuming the terminal is opened in the base directory)
- install neurokit2 and potentially missing python libraries using pip: ```python3 -m pip install neurokit2``` or ```python3 -m pip install <library_name>```
- set the variable ```CREATE_FIGURES``` in the main script ```main.py``` to True or False. Creating graphics will require a significantly longer processing time.
- run the main script using python: ```python3 main.py```

### IBI_CORRECTION_UI - manual peak correction using [online dashboard](https://www.ibxx.at/ibi_v2/)

Now, the IBI data is manually corrected using a custom dashboard hosted at [https://www.ibxx.at/ibi_v2/](https://www.ibxx.at/ibi_v2/). First, the ibi data needs to be reformatted from csv to json data.

#### Step 1: preprocessing

This is done using the script ```/IBI_CORRECTION_UI/ibiDataToInputData.js```.

##### How to execute

- switch to the directory ```/IBI_CORRECTION_UI``` in a terminal: ```cd IBI_CORRECTION_UI``` (assuming the terminal is opened in the base directory)
- run the script using node.js: ```node ibiDataToInputData```
- the output data is stored in ```/IBI_CORRECTION_UI/dashboardInputData```

#### Step 2: manual correction and validation

Now the data is ready to be corrected and validated by hand.

##### How to execute

- open the website [https://www.ibxx.at/ibi_v2/](https://www.ibxx.at/ibi_v2/) in a browser
- use the file picker to uplead data from ```/IBI_CORRECTION_UI/dashboardInputData```
- inspect and modify the data using the GUI elements on the website
- export the data when donw inspecting / making changes