import Series from '../controller/objects/series';
import { AbsoluteResult } from './comperators/comperator-results.ts/comperator-result';
import EpisodeComperator from './comperators/episode-comperator';
import MediaTypeComperator from './comperators/media-type-comperator';
import ProviderComperator from './comperators/provider-comperator';
import RelationComperator from './comperators/relation-comperator';
import ReleaseYearComperator from './comperators/release-year-comperator';
import SeasonComperator from './comperators/season-comperator';
import TitleComperator from './comperators/title-comperator';
import NewProviderHelper from './provider/new-provider-helper';
import logger from '../logger/logger';
import { MergeTypes } from '../controller/objects/merge-types';
import { SeasonSearchMode } from './season-helper/season-search-mode';
import EpisodeMappingHelper from './episode-mapping-helper/episode-mapping-helper';
import EpisodeBindingPool from '../controller/objects/meta/episode/episode-binding-pool';
export default class SeriesHelper {
    /**
     * Calculate the value
     * @param a
     * @param b
     */
    public static async isSameSeries(a: Series, b: Series): Promise<boolean> {

        let matches = 0;
        let matchAbleScore = 0;
        a = Object.assign(new Series(), a);
        b = Object.assign(new Series(), b);
        const providerComperator = new ProviderComperator(a, b);
        const listProviderResult = await providerComperator.getCompareResult();
        if (listProviderResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return true;
        } else if (listProviderResult.isAbsolute === AbsoluteResult.ABSOLUTE_FALSE) {
            return false;
        }
        matchAbleScore += listProviderResult.matchAble;
        matches += listProviderResult.matches;

        const relationResult = RelationComperator.isAlternativeSeries(a, b);
        if (relationResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return false;
        }

        const mediaTypeResult = await MediaTypeComperator.compareMediaTypeWithSeries(a, b);
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
        const aFirstSeason = seasonResult.aFirstSeason;
        const bFirstSeason = seasonResult.bFirstSeason;

        const episodeResult = EpisodeComperator.compareEpisodes(a, b);
        if (episodeResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
            return true;
        }
        matchAbleScore += episodeResult.matchAble;
        matches += episodeResult.matches;

        const titleResult = await TitleComperator.compareTitleOfSeries(a, b, aFirstSeason, bFirstSeason);
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

    public static canUpdateSeries(newSeries: Series, oldSeries: Series): boolean {
        if (NewProviderHelper.canUpdateAnyProvider(oldSeries)) {
            return true;
        }

        return false;
    }

    public static async merge(seriesA: Series, seriesB: Series, allowAddNewEntry = true, mergeType = MergeTypes.UPGRADE): Promise<Series> {
        logger.debug('[Series ] Merging Series   | SeriesID: ' + seriesA.id);
        const newAnime: Series = new Series();

        newAnime.addAllBindings(...[...seriesA.getAllProviderBindings(), ...seriesB.getAllProviderBindings()]);
        logger.debug('[Series] Merged Providers  | SeriesID: ' + seriesA.id);
        if (mergeType === MergeTypes.UPGRADE) {
            const getSeason = newAnime.getSeason(SeasonSearchMode.ALL, undefined, allowAddNewEntry);
            newAnime.getMediaType();
            await getSeason;
            newAnime.episodeBindingPools = await EpisodeMappingHelper.getEpisodeMappings(newAnime);
        } else if (mergeType === MergeTypes.UPDATE) {
            newAnime.addEpisodeBindingPools(...this.mergeEpisodeBindingPool(seriesA, seriesB));
        }
        logger.debug('[Series] Calculated Season | SeriesID: ' + seriesA.id);
        if (seriesA.lastInfoUpdate < seriesB.lastInfoUpdate) {
            newAnime.lastInfoUpdate = seriesB.lastInfoUpdate;
        } else {
            newAnime.lastInfoUpdate = seriesA.lastInfoUpdate;
        }

        if (seriesA.lastUpdate < seriesB.lastUpdate) {
            newAnime.lastUpdate = seriesB.lastUpdate;
        } else {
            newAnime.lastUpdate = seriesA.lastUpdate;
        }

        return newAnime;
    }

    private static mergeEpisodeBindingPool(seriesA: Series, seriesB: Series): EpisodeBindingPool[] {
        if (seriesA.episodeBindingPoolGeneratedAt > seriesB.episodeBindingPoolGeneratedAt) {
            return seriesA.episodeBindingPools;
        } else {
            return seriesB.episodeBindingPools;
        }
    }
}
