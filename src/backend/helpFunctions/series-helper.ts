import Series from "../controller/objects/series";
import ProviderComperator from './comperators/provider-comperator';
import SeasonComperator from './comperators/season-comperator';
import TitleComperator from './comperators/title-comperator';
import EpisodeComperator from './comperators/episode-comperator';
import { AbsoluteResult } from './comperators/comperator-results.ts/comperator-result';
import ReleaseYearComperator from './comperators/release-year-comperator';
import MediaTypeComperator from './comperators/media-type-comperator';
import RelationComperator from './comperators/relation-comperator';
class SeriesHelper {
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
}

export default new SeriesHelper();
