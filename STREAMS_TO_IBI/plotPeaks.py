import matplotlib.pyplot as plt
from numpy.core.function_base import linspace
import math

def plotSegment(ecgRaw, ecgClean, rPeaks, start, length, outputPath, subjectId, segmentIndex, samplingRate):
    t = linspace(0, len(ecgRaw), len(ecgRaw))
    t_crop = t[start:start+length]
    er = ecgRaw[start:start+length]
    ec = ecgClean[start:start+length]
    px = [val for val in rPeaks if val >= start and val < start+length]
    pt = t[px]
    py = ecgClean[px]

    plt.figure(figsize=(12, 6))
    plt.title("{sub} - R-Peaks (Segment {seg}, {sr}hz)".format(sub=subjectId, seg=segmentIndex, sr=samplingRate))
    plt.subplot(211)
    plt.title("Raw signal")
    plt.xlabel("sample index")
    plt.plot(t_crop, er, 'k')
    plt.subplot(212)
    plt.title("Cleaned signal and detected r-peaks")
    plt.xlabel("sample index")
    plt.plot(t_crop, ec, 'k', pt, py, 'bo')
    plt.tight_layout()

    outputPath = "{dir}/{subject}_peaks_segment_{index}.png".format(dir=outputPath, subject=subjectId, index=segmentIndex)
    plt.savefig(outputPath)
    plt.close()

def plotPeaks(ecgRaw, ecgClean, rPeaks, outputPath, subjectId, samplingRate):
    #split signal into segments
    recordingLength = len(ecgClean)
    segmentLength = 10000
    numSegments = math.ceil(recordingLength / segmentLength)

    for segmentIndex in range(numSegments):
        start = segmentIndex * segmentLength
        length = segmentLength
        if(start + length > recordingLength):
            length = recordingLength % segmentLength
        plotSegment(
            ecgRaw=ecgRaw,
            ecgClean=ecgClean,
            rPeaks=rPeaks,
            start=start,
            length=length,
            outputPath=outputPath,
            subjectId=subjectId,
            segmentIndex=segmentIndex,
            samplingRate=samplingRate
        )
