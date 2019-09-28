import Series from '../../controller/objects/series';
import ComperatorResult from './comperator-results.ts/comperator-result';
import Episode from '../../controller/objects/meta/episode/episode';

export default class EpisodeComperator{
    static async compareEpisodes(a: Series, b: Series): Promise<ComperatorResult> {
        const result = new ComperatorResult();
        try {
            const allAEpisodes = await a.getAllEpisodes();
            const allBEpisodes = await b.getAllEpisodes();
            // Search if there is a match between the arrays.
            if (allAEpisodes.length != 0 && allBEpisodes.length != 0) {
                result.matchAble += 2;
                if (allAEpisodes.findIndex((valueA) => allBEpisodes.findIndex(valueB => valueB === valueA) != -1) != -1) {
                    result.matches += 2;
                }
            }
        } catch (err) { }
        const detailedEpisodesResults = await this.compareDetailedEpisodes(a, b);
        result.matchAble += detailedEpisodesResults.matchAble;
        result.matches += detailedEpisodesResults.matches;
        return result;
    }

    private static async compareDetailedEpisodes(a: Series, b: Series) {
        const result = new ComperatorResult();
        const aAllADetailedEpisodes = await a.getAllDetailedEpisodes();
        const bAllDetailedEpisodes = await b.getAllDetailedEpisodes();
        for (const aEpisode of aAllADetailedEpisodes) {
            result.matchAble += 0.15;
            for (const bEpsiode of bAllDetailedEpisodes) {
                if (aEpisode.season == bEpsiode.season && aEpisode.episodeNumber == bEpsiode.episodeNumber) {
                    result.matches += 0.15;

                    const episodeTitleResult = await this.compareEpisodeTitle(aEpisode, bEpsiode);
                    result.matchAble += episodeTitleResult.matchAble;
                    result.matches += episodeTitleResult.matches;
                }
            }
        }
        return result;
    }

    private static async compareEpisodeTitle(aEpisode: Episode, bEpsiode: Episode): Promise<ComperatorResult> {
        const result = new ComperatorResult();
        if (aEpisode.title && bEpsiode.title) {
            for (const aEpisodeTitle of aEpisode.title) {
                result.matchAble++;
                for (const bEpisodeTitle of bEpsiode.title) {
                    if (aEpisodeTitle == bEpisodeTitle) {
                       result.matches++;
                    }
                }
            }
        }
        return result;
    }

    /**
     * Checks if episode a is equal to episode b.
     * @param aEpisode episode a
     * @param bEpisode episode b
     */
    public static async isSameEpisode(aEpisode: Episode, bEpisode: Episode,season?: number): Promise<boolean> {
        if (await this.isEpisodeSameSeason(aEpisode,bEpisode,season)) {
            if (aEpisode.episodeNumber == bEpisode.episodeNumber) {
                return true;
            }
        }

        const titleResult = await this.compareEpisodeTitle(aEpisode, bEpisode);
        if (titleResult.matches != 0 && titleResult.matchAble != 0) {
            return true;
        }
        
        return false;
    }

    public static async isEpisodeSameSeason(aEpisode: Episode, bEpisode: Episode, season?: number): Promise<boolean> {
        if (aEpisode.season == bEpisode.season) {
            return true;
        } else if (aEpisode.season == season && bEpisode.season == season) {
            return true;
        }
        return false;
    }
}