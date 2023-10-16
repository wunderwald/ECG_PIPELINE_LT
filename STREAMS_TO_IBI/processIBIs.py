import neurokit2 as nk
import pandas as pd
from plotPeaks import plotPeaks
from plotIBIDistribution import plotIBIDistribution
import os
import shutil
import numpy as np

def processIBIs(ecgPath, samplingRate, dataOutputPath, graphicsOutputPath, filename, createFigures, flipSignal=False):
    # read and clean signals
    ecgRaw = pd.read_csv(ecgPath, names=['ecg'])['ecg']
    
    # possibly flip signal
    if(flipSignal):
        ecgRaw = np.array(ecgRaw) * -1

    if(len(ecgRaw) < 1):
        print("empty recording")
        return
    try:
        ecgClean = nk.ecg_clean(ecgRaw, sampling_rate=samplingRate, method="neurokit")
    except:
        print("Unexpected Error while cleaning the recording.")
        return
    if(np.isnan(ecgClean).any()):
        print("Recording could not be cleaned. most probably it is too short.")
        return

    # detect r-peaks (using samplingRate, results are in milliseconds)
    try:
        peaks = nk.ecg_findpeaks(ecgClean, sampling_rate=samplingRate, method="neurokit")
        rPeaks = peaks['ECG_R_Peaks']
    except:
        print("Peaks could not be detected.")
        return

    # calculate ibis
    try:
        ibis = []
        for i in range(1, len(rPeaks)):
            ibi = rPeaks[i] - rPeaks[i-1]
            ibis.append(ibi)
    except:
        print("Unexpected Error while calculating IBIs")
        return

    try:
        # write ibis to file
        dfIbis = pd.DataFrame(list(ibis), columns=['IBI'])
        ibisOutputPath = "{dir}/ibis_{file}_{sr}hz.csv".format(dir=dataOutputPath, file=filename, sr=samplingRate)
        dfIbis.to_csv(ibisOutputPath, index=False, header=False)

        # write peaks to file
        dfPeaks = pd.DataFrame(list(rPeaks), columns=['rPeak'])
        peaksOutputPath = "{dir}/peaks_{file}_{sr}hz.csv".format(dir=dataOutputPath, file=filename, sr=samplingRate)
        dfPeaks.to_csv(peaksOutputPath, index=False, header=False)

        
        if(createFigures):
            # make subdirectory in graphics dir
            graphicsSubPath = "{dir}/{subdir}".format(dir=graphicsOutputPath, subdir=filename)
            if(os.path.isdir(graphicsSubPath)):
                shutil.rmtree(graphicsSubPath)
            os.mkdir(graphicsSubPath)

            # qq plot and histogram of ibis
            plotIBIDistribution(ibis, graphicsSubPath, filename, samplingRate)

            # plot peak detection
            plotPeaks(ecgRaw, ecgClean, rPeaks, graphicsSubPath, filename, samplingRate)
    except:
        print("Unexpected error while writing data and graphics.")
        return
