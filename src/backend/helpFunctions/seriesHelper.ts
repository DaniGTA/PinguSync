import Series from "../controller/objects/series";
import titleCheckHelper from './titleCheckHelper';
import providerHelper from './provider/providerHelper';

class SeriesHelper {
    public async isSameSeason(a: Series, b: Series): Promise<boolean> {
        return a.getSeason() === b.getSeason();
    }

        /**
     * Calculate the value
     * @param a 
     * @param b 
     */
    public async isSameSeries(a: Series, b: Series): Promise<boolean> {
        let matches: number = 0;
        let matchAbleScore: number = 0;
        a = Object.assign(new Series(), a);
        b = Object.assign(new Series(), b);
        // Check releaseYear
        if (a.releaseYear && b.releaseYear) {
            matchAbleScore++;
            if (a.releaseYear === b.releaseYear) {
                matches++;
            }
        }

        // Check season
        const aSeason = await a.getSeason();
        const bSeason = await b.getSeason();
        if (aSeason || bSeason) {
            matchAbleScore += 3;
            if (aSeason === bSeason) {
                matches += 3;
            } else if (!aSeason && bSeason === 1) {
                matches += 1;
            } else if (!bSeason && aSeason === 1) {
                matches += 1;
            }
        }

        if (await providerHelper.hasSameListProvider(a,b)) {
            for (const aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if(aProvider.provider == bProvider.provider){
                        matchAbleScore += 3;
                        if(aProvider.id == bProvider.id){
                            matches += 2;
                            if(aProvider.targetSeason === bProvider.targetSeason){
                                try{
                                    if(aProvider.getListProviderInstance().hasUniqueIdForSeasons){
                                        return true;
                                    }else{
                                        matches++;
                                    }
                                }catch(err){}
                            }
                        }
                    }
                }
            }
        }

        const allAEpisodes = await a.getAllEpisodes();
        const allBEpisodes = await b.getAllEpisodes();
        // Search if there is a match between the arrays.
        if (allAEpisodes.length != 0 && allBEpisodes.length != 0) {
            matchAbleScore++;
            if (allAEpisodes.findIndex((valueA) => allBEpisodes.findIndex(valueB => valueB === valueA) != -1) != -1) {
                matches++;
            }
        }
        matchAbleScore += 3;
        if (await titleCheckHelper.checkSeriesNames(a, b)) {
            matches += 3;
        }
        return matches >= matchAbleScore / 1.39;
    }
}

export default new SeriesHelper();
