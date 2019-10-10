import Episode from '../../controller/objects/meta/episode/episode';
import Series from '../../controller/objects/series';
import logger from '../../logger/logger';
import ComperatorResult from './comperator-results.ts/comperator-result';

export default class EpisodeComperator {
    public static async compareEpisodes(a: Series, b: Series): Promise<ComperatorResult> {
        const result = new ComperatorResult();
        try {
            const allAEpisodes = await a.getAllEpisodes();
            const allBEpisodes = await b.getAllEpisodes();
            // Search if there is a match between the arrays.
            if (allAEpisodes.length !== 0 && allBEpisodes.length !== 0) {
                result.matchAble += 2;
                if (allAEpisodes.findIndex((valueA) => allBEpisodes.findIndex((valueB) => valueB === valueA) !== -1) !== -1) {
                    result.matches += 2;
                }
            }
        } catch (err) {
           logger.error(err);
        }
        const detailedEpisodesResults = await this.compareDetailedEpisodesList(a, b);
        result.matchAble += detailedEpisodesResults.matchAble;
        result.matches += detailedEpisodesResults.matches;
        return result;
    }


    /**
     *
     * @param aEpisode
     * @param bEpsiode
     * @param season
     * @param upshift add the number to the episode number from episode a. This make ep number 1 and ep number 2 match able when upshift set to 1
     */
    public static async compareDetailedEpisode(aEpisode: Episode, bEpsiode: Episode, season?: number, upshift: number = 0): Promise<ComperatorResult> {
        const result = new ComperatorResult();
        result.matchAble++;
        if (aEpisode.episodeNumber + upshift === bEpsiode.episodeNumber) {
            result.matches++;
            result.matchAble++;
            if (await this.isEpisodeSameSeason(aEpisode, bEpsiode, season)) {
                result.matches++;
            }
        }

        const episodeTitleResult = await this.compareEpisodeTitle(aEpisode, bEpsiode);
        result.matchAble += episodeTitleResult.matchAble * 4;
        result.matches += episodeTitleResult.matches * 4;

        return result;
    }

    /**
     * Checks if episode a is equal to episode b.
     * @param aEpisode episode a
     * @param bEpisode episode b
     */
    public static async isSameEpisode(aEpisode: Episode, bEpisode: Episode, season?: number): Promise<boolean> {
        if (await this.isEpisodeSameSeason(aEpisode, bEpisode, season)) {
            if (aEpisode.episodeNumber === bEpisode.episodeNumber) {
                return true;
            }
        }

        const titleResult = await this.compareEpisodeTitle(aEpisode, bEpisode);
        if (titleResult.matches !== 0 && titleResult.matchAble !== 0) {
            return true;
        }

        return false;
    }

    public static async isEpisodeSameAsDetailedEpisode(aEpisode: number, bEpisode: Episode, season?: number): Promise<boolean> {
        if (await this.isDetailedEpisodeSameSeason(bEpisode, season)) {
            if (aEpisode === bEpisode.episodeNumber) {
                return true;
            }
        }
        return false;
    }

    public static async isEpisodeSameSeason(aEpisode: Episode, bEpisode: Episode, season?: number): Promise<boolean> {
        if (aEpisode.season === bEpisode.season) {
            return true;
        } else if (aEpisode.season === season && bEpisode.season === season) {
            return true;
        } else if (!aEpisode.season && bEpisode.season === season) {
            return true;
        } else if (!bEpisode.season && aEpisode.season === season) {
            return true;
        } else if (!season && !aEpisode.season && bEpisode.season === 1) {
            return true;
        } else if (!season && !bEpisode.season && aEpisode.season === 1) {
            return true;
        }
        return false;
    }

    public static async isDetailedEpisodeSameSeason(episode: Episode, season?: number) {
        if (episode.season === season) {
            return true;
        } else if (!episode.season && (!season || season === 1)) {
            return true;
        } else if (!season && episode.season === 1) {
            return true;
        }
        return false;
    }

    public static async isEpisodeASeasonHigher(aEpisode: Episode, bEpisode: Episode, season?: number): Promise<boolean> {
        if (aEpisode.season && bEpisode.season) {
            return aEpisode.season > bEpisode.season;
        } else if (aEpisode.season) {
            if (season) {
                return aEpisode.season < season;
            } else {
                if (aEpisode.season === 1) {
                    return false;
                } else {
                    return true;
                }
            }
        } else if (bEpisode.season) {
            if (season) {
                return bEpisode.season < season;
            } else {
                return false;
            }
        }
        return false;
    }


    private static async compareEpisodeTitle(aEpisode: Episode, bEpsiode: Episode): Promise<ComperatorResult> {
        const result = new ComperatorResult();
        if (aEpisode.title && bEpsiode.title) {
            for (const aEpisodeTitle of aEpisode.title) {
                result.matchAble++;
                for (const bEpisodeTitle of bEpsiode.title) {
                    // tslint:disable-next-line: triple-equals
                    if (aEpisodeTitle.text == bEpisodeTitle.text) {
                        result.matches++;
                    }
                }
            }
        }
        return result;
    }

    private static async compareDetailedEpisodesList(a: Series, b: Series) {
        const result = new ComperatorResult();
        const aAllADetailedEpisodes = await a.getAllDetailedEpisodes();
        const aSeriesSeason = await a.getSeason();
        const bAllDetailedEpisodes = await b.getAllDetailedEpisodes();
        const bSeriesSeason = await b.getSeason();
        let season;
        if (aSeriesSeason.seasonNumber === bSeriesSeason.seasonNumber) {
            season = aSeriesSeason.seasonNumber;
        }

        for (const aEpisode of aAllADetailedEpisodes) {
            result.matchAble += 0.15;
            for (const bEpsiode of bAllDetailedEpisodes) {
                if (await this.isEpisodeSameSeason(aEpisode, bEpsiode, season) && aEpisode.episodeNumber === bEpsiode.episodeNumber) {
                    result.matches += 0.15;

                    const episodeTitleResult = await this.compareEpisodeTitle(aEpisode, bEpsiode);
                    result.matchAble += episodeTitleResult.matchAble;
                    result.matches += episodeTitleResult.matches;
                }

            }
        }
        return result;
    }
}
