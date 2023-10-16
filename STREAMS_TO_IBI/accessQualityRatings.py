import pandas as pd
from pathlib import Path
import re
import numpy as np

ratingsPath = Path("./Ratings/ratings_processed.tsv")

RATINGS = pd.read_csv(ratingsPath, delimiter='\t')

def getSubjectId(filename):
    try:
        subjectId = re.search("[0-9]{3}", filename).group(0)
        return subjectId
    except:
        print("! filename does not include subject id, rating can not be accessed ({f})".format(f=filename))
        return None


def getRating(filename):

    ratings = RATINGS
    filenameParts = filename.split("_")

    rating = None
    for entry in ratings.iterrows():
        ratingId = entry[1]['id']
        entryIdParts = ratingId.split("_")
        if(all([entryIdPart in filenameParts for entryIdPart in entryIdParts ])):
            rating = entry
            break

    if(rating is None):
        print("! No rating found for {f}".format(f=filename))
        return None
    
    return entry[1]['quality']


        
