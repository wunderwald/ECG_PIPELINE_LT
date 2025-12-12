
import os
import json
from pathlib import Path
import csv

# discover json input files in input directory
inputDir = Path("./dashboardOutputData")
inputFileNames = [ f for f in os.listdir(inputDir) if f.endswith(".json") ]

# dict of excluded regions
excludedRegionsData = []
allExcludedDurations = []

for inputFileName in inputFileNames:
    # log
    print("# Processing {f}".format(f=inputFileName))

    # parse json
    path = inputDir.joinpath(Path(inputFileName))
    file = open(path)
    data = json.load(file)

    excludedStats = {}
    excludedStats['filename'] = inputFileName   

    # read num of excluded regions
    excludedStats["numRemovedRegions"] = len(data["removedRegions"])

    # calculate excluded ratio
    lenTotal = data['endIndex'] - data['startIndex']
    lenExcluded = 0
    for el in data['removedRegions']:
        excludedDuration = abs(el['end'] - el['start'])
        lenExcluded = lenExcluded + excludedDuration
        allExcludedDurations.append(excludedDuration)

    excludedStats['excludedPercentage'] = "{:.2f}".format((lenExcluded / lenTotal) * 100)

    excludedRegionsData.append(excludedStats)

# to file
keys = ['filename', 'numRemovedRegions', 'excludedPercentage']
with open('excludedRegionsSummary.csv', 'w') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames = keys)
    writer.writeheader()
    writer.writerows(excludedRegionsData)

# stats
print("\n\n# Number of Files: {}".format(len(excludedRegionsData)))
numFilesWithExcludedRegions = len([el for el in excludedRegionsData if el['numRemovedRegions'] != 0])
print("# Number of files with excluded Regions: {}".format(numFilesWithExcludedRegions))
avgExcludedPercentage = sum([float(el['excludedPercentage']) for el in excludedRegionsData]) / len(excludedRegionsData)
print("# Average excluded percentage: {:.2f}".format(avgExcludedPercentage))
avgExcudedDuration = float(sum(allExcludedDurations)) / len(allExcludedDurations)
print("# Average excluded duration (in samples): {:.2f}".format(avgExcudedDuration))