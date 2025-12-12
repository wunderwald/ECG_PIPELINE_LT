
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

# discover json input files in input directory
inputDir = Path("../dashboardOutputData")
inputFileNames = [ f for f in os.listdir(inputDir) if f.endswith(".json") ]

for inputFileName in inputFileNames:
    print("# Converting {f}".format(f = inputFileName))

    # parse json
    path = inputDir.joinpath(Path(inputFileName))
    file = open(path)
    data = json.load(file)

    # create output folder
    outputDirName = inputFileName[0:len(inputFileName)-len(".json")]
    outputDir = Path("./out/{d}".format(d=outputDirName))
    if os.path.exists(outputDir):
        shutil.rmtree(outputDir)
    os.makedirs(outputDir)

    # create csv files for each data point
    arr1dToCsvFile(data["peaks"], outputDir, "peakIndex", "peaks")
    arr1dToCsvFile(data["ibi"]["samples"], outputDir, "samples", "ibi_samples")
    arr1dToCsvFile(data["ibi"]["ms"], outputDir, "ms", "ibi_ms")
    dictArrToCsvFile(data["ecg"], outputDir, "ecg")
    if(len(data["removedRegions"]) > 0):
        dictArrToCsvFile(data["removedRegions"], outputDir, "removedRegions")

    fieldsToCsvFile(data, ["samplingRate", "startIndex", "endIndex"], outputDir, "metadata")
    

    