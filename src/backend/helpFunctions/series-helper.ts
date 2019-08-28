import Series from "../controller/objects/series";
import SearchSeasonValueResult from "../controller/objects/transfer/search-season-value-results";
import Name from "../controller/objects/meta/name";
import ListController from "../controller/list-controller";
import ProviderComperator from './comperators/provider-comperator';
import SeasonComperator from './comperators/season-comperator';
import TitleComperator from './comperators/title-comperator';
import EpisodeComperator from './comperators/episode-comperator';
import { AbsoluteResult } from './comperators/comperator-results.ts/comperator-result';

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

        const listProviderResult = await ProviderComperator.compareListProviders(a, b);
        if (listProviderResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return true;
        } else if (listProviderResult.isAbsolute === AbsoluteResult.ABSOLUTE_FALSE) {
            return false;
        }
        matchAbleScore += listProviderResult.matchAble;
        matches += listProviderResult.matches;

        const infoProviderResult = await ProviderComperator.compareInfoProviders(a, b);
        if (infoProviderResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return true;
        } else if (infoProviderResult.isAbsolute === AbsoluteResult.ABSOLUTE_FALSE) {
            return false;
        }
        matchAbleScore += infoProviderResult.matchAble;
        matches += infoProviderResult.matches;

        // Check releaseYear
        if (await a.getReleaseYear() && await b.getReleaseYear()) {
            matchAbleScore++;
            if (await a.getReleaseYear() === await b.getReleaseYear()) {
                matches++;
            }
        }
        // Check season
        const seasonResult = await SeasonComperator.compareSeasons(a, b);
        if (seasonResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return true;
        }
        matchAbleScore += seasonResult.matchAble;
        matches += seasonResult.matches;
        let aFirstSeason = seasonResult.aFirstSeason;
        let bFirstSeason = seasonResult.bFirstSeason;

        const episodeResult = await EpisodeComperator.compareEpisodes(a, b);
        if (episodeResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return true;
        }
        matchAbleScore += episodeResult.matchAble;
        matches += episodeResult.matches;

        const titleResult = await TitleComperator.compareTitle(a, b, aFirstSeason, bFirstSeason);
        if (titleResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return true;
        }
        matchAbleScore += titleResult.matchAble;
        matches += titleResult.matches;

        if (matchAbleScore === 0) {
            return false;
        }
        return matches >= matchAbleScore / 1.39;
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
        let prequel = null;

        if (await series.isAnyPrequelPresent()) {
            try {
                prequel = await series.getPrequel(seriesList);
                let searchCount = 0;
                while (prequel) {
                    if (await prequel.getMediaType() === await series.getMediaType()) {
                        searchCount++;
                        const prequelSeason = await prequel.getSeason(seriesList);
                        if (prequelSeason === 1 || prequelSeason === 0) {
                            return new SearchSeasonValueResult(prequelSeason + searchCount, "PrequelTrace");
                        }
                    }
                    if (await prequel.isAnyPrequelPresent()) {
                        try {
                            prequel = await prequel.getPrequel(seriesList);

                        } catch (err) {
                            return new SearchSeasonValueResult(-2, "PrequelTraceNotAvaible");
                        }
                    } else {
                        return new SearchSeasonValueResult(searchCount, "PrequelTrace");
                    }
                }
            } catch (err) {
            }
            return new SearchSeasonValueResult(-2, "PrequelTraceNotAvaible");
        }

        try {
            if (!await series.isAnyPrequelPresent() && await series.isAnySequelPresent()) {
                return new SearchSeasonValueResult(1, "NoPrequelButSequel");
            }
        } catch (err) {
        }
        return new SearchSeasonValueResult(-1, "None");
    }
}

export default new SeriesHelper();
