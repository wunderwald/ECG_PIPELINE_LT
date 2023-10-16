import matplotlib.pyplot as plt
import scipy.stats as stats
import math

def plotIBIDistribution(ibis, directory, subjectId, samplingRate):
    plt.figure(figsize=(12,6))
    plt.subplot(121)
    plt.title("Distribution of IBIs")
    plt.xlabel("ibi (ms)")
    plt.hist(ibis, bins=math.floor(len(ibis)/4))
    plt.subplot(122)
    stats.probplot(ibis, dist="norm", plot=plt)
    plt.tight_layout()
    
    outputPath = "{dir}/{subject}_ibi_distribution.png".format(dir=directory, subject=subjectId)
    plt.savefig(outputPath)
    plt.close()