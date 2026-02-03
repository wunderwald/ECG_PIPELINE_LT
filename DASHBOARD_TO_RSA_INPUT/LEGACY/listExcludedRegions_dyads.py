from distutils.log import error
import os
import json
from pathlib import Path
import csv
from tracemalloc import start

# helpers
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

def removeChannelName(filename):
    parts = filename.split('_')
    out = ""
    for i in range(0, len(parts)):
        if(not "channel" in parts[i]):
            out = out + parts[i]
    return out


def sampleOutOfRange(sample, startIndex, endIndex):
    return sample['index'] < startIndex or sample['index'] > endIndex

def sampleInExcludedRegions(sample, excludedRegions):
    for region in excludedRegions: 
        startIndex = region['start']
        endIndex = region['end']
        if region['end'] < region['start']:
            startIndex = region['end']
            endIndex = region['start']
        if sample['index'] >= startIndex and sample['index'] <= endIndex:
            return True
    return False

def removeExcludedRegions(ecg, excludedRegions, startIndex, endIndex):
    return [sample for sample in ecg if (not sampleOutOfRange(sample, startIndex, endIndex) and not sampleInExcludedRegions(sample, excludedRegions))]


def excludedRegionDurations(ecgRaw, ecgFiltered, dyadName, samplingRate):
    indicesRaw = set([sample['index'] for sample in ecgRaw])
    indicesFiltered = set([sample['index'] for sample in ecgFiltered])
    excludedIndices = list(set(indicesRaw) - set(indicesFiltered))
    excludedIndices.sort()

    excludedIndicesGrouped = []
    currentIndexGroup = []
    for index in excludedIndices:
        # current group is empty
        if len(currentIndexGroup) == 0:
            currentIndexGroup.append(index)
            continue
        # index belongs to current group
        if index == currentIndexGroup[len(currentIndexGroup) - 1] + 1:
            currentIndexGroup.append(index)
            continue
        # index belongs into new group
        excludedIndicesGrouped.append(currentIndexGroup)
        currentIndexGroup = [ index ]
    
    return [ { "dyadName": dyadName, "excludedSamples": len(group), "samplingRate": samplingRate } for group in excludedIndicesGrouped ]
    




# discover json input files in input directory
inputDir = Path("./dashboardOutputData")
inputFileNames = [ f for f in os.listdir(inputDir) if f.endswith(".json") ]
inputFileNames_ECG1 = [ f for f in inputFileNames if "ecg1" in f.lower() ]
inputFileNames_ECG2 = [ f for f in inputFileNames if "ecg2" in f.lower() ]

# init output data
excludedPercentages = []
excludedDurations = []

for inputFileName_ECG1 in inputFileNames_ECG1:
    print("# Processing dyad that includes {f}".format(f=inputFileName_ECG1))

    # find ECG2 file
    matches = list(filter(lambda inputFileName_ECG2: nonMatchingChars(removeChannelName(inputFileName_ECG1), removeChannelName(inputFileName_ECG2)) == 1, inputFileNames_ECG2))
    if len(matches) != 1:
        print("Error: no ecg2 file found for " + inputFileName_ECG1)
        continue
    inputFileName_ECG2 = matches[0]

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

    # calculate removed percentage for dyad
    numSamplesUnfiltered = abs(endIndexDyad - startIndexDyad)
    filteredSamplesECG1 = removeExcludedRegions(data_ECG1['ecg'], removedRegionsDyad, startIndexDyad, endIndexDyad)
    numSamplesFiltered = len(filteredSamplesECG1)
    excludedPercentage = (float(abs(numSamplesUnfiltered - numSamplesFiltered)) / numSamplesUnfiltered) * 100

    excludedStats = {}
    excludedStats['dyadName'] = inputFileName_ECG1
    excludedStats['numSamplesUnfiltered'] = numSamplesUnfiltered
    excludedStats['numSamplesFiltered'] = numSamplesFiltered
    excludedStats['excludedPercentage'] = float("{:.2f}".format(excludedPercentage))

    excludedPercentages.append(excludedStats)

    # calculate lengths of merged removed regions
    excludedDurationsDyad = excludedRegionDurations(data_ECG1['ecg'], filteredSamplesECG1, inputFileName_ECG1, samplingRate)
    for el in excludedDurationsDyad:
        excludedDurations.append(el)
    

# sort output
def getPercentage(el):
    return el['excludedPercentage']
excludedPercentages.sort(key=getPercentage, reverse=True)

# write output a: summary
keys = ['dyadName', 'numSamplesUnfiltered', 'numSamplesFiltered', 'excludedPercentage']
with open('excludedRegionsSummary_dyads.csv', 'w') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames = keys)
    writer.writeheader()
    writer.writerows(excludedPercentages)

# write output b: list of durations
keys = ['dyadName', 'excludedSamples', 'samplingRate']
with open('excludedRegionsDurations_dyads.csv', 'w') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames = keys)
    writer.writeheader()
    writer.writerows(excludedDurations)
