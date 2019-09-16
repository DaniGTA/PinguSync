import Series from "../controller/objects/series";
import SearchSeasonValueResult from "../controller/objects/transfer/search-season-value-results";
import Name from "../controller/objects/meta/name";
import ListController from "../controller/list-controller";
import ProviderComperator from './comperators/provider-comperator';
import SeasonComperator from './comperators/season-comperator';
import TitleComperator from './comperators/title-comperator';
import EpisodeComperator from './comperators/episode-comperator';
import { AbsoluteResult } from './comperators/comperator-results.ts/comperator-result';
import ProviderLocalData from '../controller/interfaces/provider-local-data';
import { ListProviderLocalData } from '../controller/objects/list-provider-local-data';
import { InfoProviderLocalData } from '../controller/objects/info-provider-local-data';
import ReleaseYearComperator from './comperators/release-year-comperator';
import MediaTypeComperator from './comperators/media-type-comperator';
import RelationComperator from './comperators/relation-comperator';
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

        const listProviderResult = await ProviderComperator.compareAllProviders(a, b);
        if (listProviderResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return true;
        } else if (listProviderResult.isAbsolute === AbsoluteResult.ABSOLUTE_FALSE) {
            return false;
        }
        matchAbleScore += listProviderResult.matchAble;
        matches += listProviderResult.matches;

        const relationResult = await RelationComperator.isAlternativeSeries(a, b);
        if (relationResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return false;
        }

        const mediaTypeResult = await MediaTypeComperator.compareMediaType(a, b);
        matchAbleScore += mediaTypeResult.matchAble;
        matches += mediaTypeResult.matches;

        // Check releaseYear
        const releaseYearResult = await ReleaseYearComperator.compareReleaseYear(a, b);
        matchAbleScore += releaseYearResult.matchAble;
        matches += releaseYearResult.matches;

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

        if (matchAbleScore === 0 || matches === 0) {
            return false;
        }
        return matches >= matchAbleScore / 1.39;
    }

    async searchSeasonValue(series: Series, seriesList?: Series[] | readonly Series[]): Promise<SearchSeasonValueResult> {
        if (!seriesList && ListController.instance) {
            seriesList = await ListController.instance.getMainList();
        }

        const numberFromName = await Name.getSeasonNumber(await series.getAllNamesUnique());

        if (numberFromName) {
            return new SearchSeasonValueResult(numberFromName, "Name");
        }
        let prequel: Series | null = null;
        if (await series.isAnyPrequelPresent() && seriesList) {

            const searchResult = await series.getPrequel(seriesList);
            prequel = searchResult.foundedSeries;
            let searchCount = 0;
            if (searchResult.relationExistButNotFounded) {

                return new SearchSeasonValueResult(-2, "PrequelTraceNotAvaible", searchResult);
            } else {
                while (prequel) {
                    searchCount++;
                    if (await prequel.getMediaType() === await series.getMediaType()) {
                        const prequelSeason = await prequel.getSeason(seriesList);
                        if (prequelSeason === 1 || prequelSeason === 0) {
                            return new SearchSeasonValueResult(prequelSeason + searchCount, "PrequelTrace");
                        }
                    }
                    if (await prequel.isAnyPrequelPresent()) {

                        const searchResult = await prequel.getPrequel(seriesList);
                        if (searchResult.relationExistButNotFounded) {
                            return new SearchSeasonValueResult(-2, "PrequelTraceNotAvaible", searchResult);
                        }
                        prequel = searchResult.foundedSeries;
                    } else {
                        return new SearchSeasonValueResult(searchCount, "PrequelTrace");
                    }
                }
            }
            return new SearchSeasonValueResult(-2, "PrequelTraceNotAvaible");
        }

        try {
            if (!await series.isAnyPrequelPresent() && await series.isAnySequelPresent()) {
                return new SearchSeasonValueResult(1, "NoPrequelButSequel");
            }
        } catch (err) {
        }

        for (const provider of series.getListProvidersInfos()) {
            if (provider.targetSeason) {
                return new SearchSeasonValueResult(provider.targetSeason, "Provider: " + provider.provider);
            }
        }

        return new SearchSeasonValueResult(-1, "None");
    }

    async createTempSeriesFromPrequels(localDatas: ProviderLocalData[]): Promise<Series[]> {
        const result: Series[] = [];
        console.log('create temp series');
        for (const entry of localDatas) {
            for (const prequelId of entry.prequelIds) {
                if (prequelId) {
                    const series = new Series();
                    //TODO FIX THIS instanceof.
                    if (entry instanceof ListProviderLocalData) {
                        const newProvider = new ListProviderLocalData(entry.provider);
                        newProvider.id = prequelId;
                        newProvider.fullInfo = false;
                        series.addProviderDatas(newProvider);
                    } else if (entry instanceof InfoProviderLocalData) {
                        const newProvider = new InfoProviderLocalData(entry.provider);
                        newProvider.id = prequelId;
                        newProvider.fullInfo = false;
                        series.addProviderDatas(newProvider);
                    } else {
                        continue;

                    }
                    result.push(series);
                }
            }
        }
        console.log(result.length + ' created temp series');
        return result;
    }
}

export default new SeriesHelper();
