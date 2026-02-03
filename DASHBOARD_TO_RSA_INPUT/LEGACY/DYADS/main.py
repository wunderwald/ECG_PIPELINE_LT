import os
import json
from pathlib import Path
import shutil

# helpers
def arr1dToCsvStr(arr, colName):
    body = "\n".join([str(x) for x in arr])
    return "{h}\n{b}".format(h=colName, b=body)
def arr1dToCsvFile(arr, dir, colName, name):
    path = Path("./{d}/{f}.csv".format(d=dir, f=name))
    content = arr1dToCsvStr(arr, colName)
    with open(path, 'w') as file:
        file.write(content)

def dictArrToCsvStr(arr):
    keys = arr[0].keys()
    header = ", ".join(keys)
    body = "\n".join([", ".join([str(v) for v in row.values()]) for row in arr])
    return "{h}\n{b}".format(h=header, b=body)
def dictArrToCsvFile(arr, dir, name):
    path = Path("./{d}/{f}.csv".format(d=dir, f=name))
    content = dictArrToCsvStr(arr)
    with open(path, 'w') as file:
        file.write(content)

def fieldsToCsvFile(dct, fields, dir, name):
    header = ", ".join(fields)
    body = ", ".join([str(dct[field]) for field in fields])
    content = "{h}\n{b}".format(h=header, b=body)
    path = Path("./{d}/{f}.csv".format(d=dir, f=name))
    with open(path, 'w') as file:
        file.write(content)

def matchingChars(str1, str2):
    if len(str1) != len(str2):
        return 0
    numMatches = 0
    for i in range(0, len(str1)):
        if str1[i] == str2[i]:
            numMatches = numMatches + 1
    return numMatches
def nonMatchingChars(str1, str2):
    return abs(len(str1) - matchingChars(str1, str2))

def mergeStartEnd(ecg1, ecg2):
    startIndex_ECG1 = ecg1["startIndex"]
    startIndex_ECG2 = ecg2["startIndex"]
    endIndex_ECG1 = ecg1["endIndex"]
    endIndex_ECG2 = ecg2["endIndex"]

    startIndex = startIndex_ECG1
    if startIndex_ECG2 > startIndex:
        startIndex = startIndex_ECG2
    
    endIndex = endIndex_ECG1
    if endIndex_ECG2 < endIndex:
        endIndex = endIndex_ECG2

    return [startIndex, endIndex]

def cropPeaks(peakIndices, startIndex, endIndex):
    return [i for i in peakIndices if i > startIndex and i < endIndex]

def makePeakGroups(peakIndices, removedRegions):
    # remove peaks in removed regions
    peakIndicesFiltered = []
    for peakIndex in peakIndices:
        for region in removedRegions:
            if peakIndex >= region["start"] and peakIndex <= region["end"]:
                continue
        peakIndicesFiltered.append(peakIndex)

    # initialize groups
    numGroups = len(removedRegions) + 1
    groups = [ [] for i in range(0, numGroups) ]
    
    # fill groups
    for peakIndex in peakIndices:
        groupIndex = 0
        groupFound = False
        for region in removedRegions:
            if peakIndex < region["start"]:
                groups[groupIndex].append(peakIndex)
                groupFound = True
                break
            groupIndex = groupIndex + 1
        if not groupFound:
            groups[groupIndex].append(peakIndex)

    return groups
        
def removeChannelName(filename):
    parts = filename.split('_')
    out = ""
    for i in range(0, len(parts)):
        if(not "channel" in parts[i]):
            out = out + parts[i]
    return out


# discover json input files in input directory
inputDir = Path("../dashboardOutputData")
inputFileNames = [ f for f in os.listdir(inputDir) if f.endswith(".json") ]
inputFileNames_ECG1 = [ f for f in inputFileNames if "ecg1" in f.lower() ]
inputFileNames_ECG2 = [ f for f in inputFileNames if "ecg2" in f.lower() ]

for inputFileName_ECG1 in inputFileNames_ECG1:
    print("# Processing dyad that includes {f}".format(f=inputFileName_ECG1))

    # find ECG2 file
    matches = list(filter(lambda inputFileName_ECG2: nonMatchingChars(removeChannelName(inputFileName_ECG1), removeChannelName(inputFileName_ECG2)) == 1, inputFileNames_ECG2))
    if len(matches) != 1:
        print("Error: no ecg2 file found for " + inputFileName_ECG1)
        continue
    inputFileName_ECG2 = matches[0]

    # create output directory
    outputDirDyad = inputFileName_ECG1[0:len(inputFileName_ECG1)-len(".json")].replace("_ECG1", "").replace("_ecg1", "")
    outputPathDyad = Path("./out/{d}".format(d=outputDirDyad))
    if os.path.exists(outputPathDyad):
        shutil.rmtree(outputPathDyad)
    os.makedirs(outputPathDyad)

    # create output subdirectories
    outputPath_ECG1 = outputPathDyad.joinpath(Path("ECG1"))
    outputPath_ECG2 = outputPathDyad.joinpath(Path("ECG2"))
    os.makedirs(outputPath_ECG1)
    os.makedirs(outputPath_ECG2)

    # parse json files
    jsonPath_ECG1 = inputDir.joinpath(Path(inputFileName_ECG1))
    jsonFile_ECG1 = open(jsonPath_ECG1)
    data_ECG1 = json.load(jsonFile_ECG1)
    jsonFile_ECG1.close()

    jsonPath_ECG2 = inputDir.joinpath(Path(inputFileName_ECG2))
    jsonFile_ECG2 = open(jsonPath_ECG2)
    data_ECG2 = json.load(jsonFile_ECG2)
    jsonFile_ECG2.close()

    # read sampling rate
    samplingRate_ECG1 = data_ECG1["samplingRate"]
    samplingRate_ECG2 = data_ECG2["samplingRate"]
    if samplingRate_ECG1 != samplingRate_ECG2:
        print("Error: sampling rates of recordings are not equal (ECG1: {ecg1}, ECG2: {ecg2})".format(ecg1=samplingRate_ECG1, ecg2=samplingRate_ECG2)) 
        continue
    samplingRate = samplingRate_ECG1

    # merge start/end markers
    [startIndexDyad, endIndexDyad] = mergeStartEnd(data_ECG1, data_ECG2)

    # merge removed regions
    removedRegionsDyad = data_ECG1["removedRegions"] + data_ECG2["removedRegions"]
    
    # calculate ibis for both recordings
    for [data, outputPath] in [[data_ECG1, outputPath_ECG1], [data_ECG2, outputPath_ECG2]]:
        # filter peaks using start/end
        peaksCropped = cropPeaks(data["peaks"], startIndexDyad, endIndexDyad)

        # split peaks into N+1 groups for N=numRemovedRegions
        peakGroups = makePeakGroups(peaksCropped, removedRegionsDyad)


        # calculate ibis in groups (samples)
        ibiSamples = []
        for peakGroup in peakGroups:
            if len(peakGroup) < 2:
                continue

            # sort peaks in group
            peakGroup.sort()

            # calculate ibis in peak group
            for i in range(1, len(peakGroup)):
                ibiSamples.append(peakGroup[i] - peakGroup[i-1])
        
        # convert to milliseconds
        ibiMs = list(map(lambda ibi: ibi/samplingRate * 1000, ibiSamples))

        # write data to files
        arr1dToCsvFile(ibiSamples, outputPath, "samples", "ibi_samples")
        arr1dToCsvFile(ibiMs, outputPath, "ms", "ibi_ms")


    # write metadata to file
    metadata = {
        "samplingRate": samplingRate,
        "inputFileECG1": inputFileName_ECG1,
        "inputFileECG2": inputFileName_ECG2,
    }
    fieldsToCsvFile(metadata, ["samplingRate", "inputFileECG1", "inputFileECG2"], outputPathDyad, "metadata")