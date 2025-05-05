from processIBIs import processIBIs
import os

CREATE_FIGURES = False

samplingRateDefault = 500
samplingRateLabchart = 1000
samplingRateSmarting = 500
samplingRateLabrecorder = 500

inputDir = '../RAW_TO_STREAMS/streams'
allFiles = os.listdir(inputDir)
ecgFiles = [ f for f in allFiles if 
    not "time" in f 
    and not "subjectList" in f 
    and not "_resp" in f 
    and not "markers" in f 
    and not "fro" in f 
    and "csv" in f 
]

dataOutputPath='./ibiData'
graphicsOutputPath='./figures'

i = 0
for f in ecgFiles:
    ecgPath = "{dir}/{file}".format(dir=inputDir, file=f)
    filename = f.split('.')[0]
    samplingRate = samplingRateDefault
    if("cardresp" in f):
        samplingRate=samplingRateLabchart
    elif("smarting" in f):
        samplingRate=samplingRateSmarting
    elif("labrecorder" in f):
        samplingRate=samplingRateLabrecorder
    
    print("#### Processing {f} ({sr}hz) [{i} of {l}]".format(f=f, sr=samplingRate, i=i+1, l=len(ecgFiles)))
    # increment counter for logging
    i = i + 1

    # ignore files that have already been processed
    alreadyProcessed = (os.path.isfile("{dir}/ibis_{sub}_{sr}hz.csv".format(dir=dataOutputPath, sub=filename, sr=samplingRate))
        and os.path.isdir("{dir}/{sub}".format(dir=graphicsOutputPath, sub=filename)))
    if(alreadyProcessed):
        print("Already processed.")
        continue
    
    # rating might include flip annotation
    flipSignal = False

    processIBIs(
        ecgPath=ecgPath,
        samplingRate=samplingRate,
        dataOutputPath=dataOutputPath,
        graphicsOutputPath=graphicsOutputPath,
        filename=filename,
        createFigures=CREATE_FIGURES,
        flipSignal=flipSignal
    )
    
