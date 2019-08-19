import Series from "../controller/objects/series";
import titleCheckHelper from './title-check-helper';
import providerHelper from './provider/provider-helper';
import { ListProviderLocalData } from "../controller/objects/list-provider-local-data";
import SearchSeasonValueResult from "../controller/objects/transfer/search-season-value-results";
import Name from "../controller/objects/meta/name";
import ListController from "../controller/list-controller";

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

        if (await providerHelper.hasSameListProvider(a, b)) {
            for (let aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (aProvider.provider == bProvider.provider) {
                        matchAbleScore += 3;
                        if (aProvider.id == bProvider.id) {
                            aProvider = Object.assign(new ListProviderLocalData(), aProvider);
                            matches += 2;
                            try {
                                if (aProvider.getProviderInstance().hasUniqueIdForSeasons) {
                                    return true;
                                } else if (aProvider.targetSeason === bProvider.targetSeason) {
                                    return true;
                                }
                            } catch (err) {

                            }
                        }
                    }
                }
            }
        }

        // Check releaseYear
        if (a.releaseYear && b.releaseYear) {
            matchAbleScore++;
            if (a.releaseYear === b.releaseYear) {
                matches++;
            }
        }

        let aFirstSeason = null;
        let bFirstSeason = null;
        // Check season
        const aSeason = await a.getSeason();
        const bSeason = await b.getSeason();
        if (aSeason || bSeason) {
            matchAbleScore += 2.5;
            if (aSeason === bSeason) {
                matches += 2.5;
                if (bSeason != 1 && aSeason != 1) {
                    try {
                        if (await this.hasOnlyProviderWithSameIdForSeasons(a) && !await this.hasOnlyProviderWithSameIdForSeasons(b)) {
                            bFirstSeason = await b.getFirstSeason();
                        } else if (await this.hasOnlyProviderWithSameIdForSeasons(b) && !await this.hasOnlyProviderWithSameIdForSeasons(a)) {
                            aFirstSeason = await b.getFirstSeason();
                        }
                    } catch (err) { }
                    if (aFirstSeason) {
                        for (const listProviderInfos of aFirstSeason.getListProvidersInfos()) {
                            for (const lpi of b.getListProvidersInfos()) {
                                if (listProviderInfos.provider === lpi.provider && listProviderInfos.id === lpi.id && aSeason !== await aFirstSeason.getSeason()) {
                                    return true;
                                }
                            }
                        }

                    } else if (bFirstSeason) {
                        for (const listProviderInfos of bFirstSeason.getListProvidersInfos()) {
                            for (const lpi of a.getListProvidersInfos()) {
                                if (listProviderInfos.provider === lpi.provider && listProviderInfos.id === lpi.id && aSeason !== await bFirstSeason.getSeason()) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            } else if (!aSeason && bSeason === 1) {
                matches += 1;
            } else if (!bSeason && aSeason === 1) {
                matches += 1;
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
        } else if (aFirstSeason) {
            if (await titleCheckHelper.checkSeriesNames(aFirstSeason, b)) {
                matches += 4;
            }
        } else if (bFirstSeason) {
            if (await titleCheckHelper.checkSeriesNames(a, bFirstSeason)) {
                matches += 4;
            }
        }
        return matches >= matchAbleScore / 1.39;
    }

    async hasOnlyProviderWithSameIdForSeasons(series: Series): Promise<boolean> {
        let hasOnlyProviderWithSameId = true;
        for (const providerlistinfo of series.getListProvidersInfos()) {
            if (providerlistinfo.getProviderInstance().hasUniqueIdForSeasons) {
                hasOnlyProviderWithSameId = false;
            }
        }
        return hasOnlyProviderWithSameId;
    }


    async searchSeasonValue(series: Series, seriesList?: Series[]): Promise<SearchSeasonValueResult> {
        if (!seriesList) {
            seriesList = await new ListController().getMainList();
        }
        for (const provider of series.getListProvidersInfos()) {
            if (provider.targetSeason) {
                return new SearchSeasonValueResult(provider.targetSeason, "Provider: " + provider.provider);
            }
        }
        const numberFromName = await Name.getSeasonNumber(await series.getAllNames());

        if (numberFromName) {
            return new SearchSeasonValueResult(numberFromName, "Name");
        }
        let prquel = null;
        try {
            prquel = await series.getPrequel(seriesList);
            let searchCount = 0;
            while (prquel) {
                if (prquel.mediaType === series.mediaType) {
                    searchCount++;
                    const prequelSeason = await prquel.getSeason(seriesList);
                    if (prequelSeason === 1 || prequelSeason === 0) {
                        return new SearchSeasonValueResult(prequelSeason + searchCount, "PrequelTrace");
                    }
                }
                try {
                    prquel = await prquel.getPrequel(seriesList);
                } catch (err) {
                    return new SearchSeasonValueResult(searchCount, "PrequelTrace");
                }
            }
        } catch (err) {
            console.log(err);
        }
        try {
            if (!prquel && await series.getSequel(seriesList)) {
                return new SearchSeasonValueResult(1, "NoPrequelButSequel");
            }
        } catch (err) {
            console.log(err);
        }
        return new SearchSeasonValueResult(-1, "None");
    }
}

export default new SeriesHelper();
