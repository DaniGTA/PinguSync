import Episode from '../../controller/objects/meta/episode/episode';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import logger from '../../logger/logger';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';
import SeasonComperator from './season-comperator';

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
        return result;
    }


    /**
     *
     * @param aEpisode
     * @param bEpsiode
     * @param season
     * @param upshift add the number to the episode number from episode a. This make ep number 1 and ep number 2 match able when upshift set to 1
     */
    public static compareDetailedEpisode(aEpisode: Episode, bEpsiode: Episode, providerASeason?: Season, providerBSeason?: Season, season?: Season, upshift: number = 0): ComperatorResult {
        const result = new ComperatorResult();
        result.matchAble++;
        if (aEpisode.id === bEpsiode.id) {
            result.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
            result.matches++;
            return result;
        } else if (aEpisode.provider && bEpsiode.provider) {
            if (aEpisode.provider === bEpsiode.provider && aEpisode.providerEpisodeId === bEpsiode.providerEpisodeId && aEpisode.providerEpisodeId !== undefined) {
                result.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                result.matches++;
                return result;
            }
        }

        if (!isNaN(aEpisode.episodeNumber as unknown as number) && (aEpisode.episodeNumber as number) + upshift === bEpsiode.episodeNumber) {
            result.matches++;
            result.matchAble++;
            if (this.isEpisodeSameSeason(aEpisode, bEpsiode, providerASeason, providerBSeason, season)) {
                result.matches++;
            }
        }

        const episodeTitleResult = this.compareEpisodeTitle(aEpisode, bEpsiode);
        result.matchAble += episodeTitleResult.matchAble * 4;
        result.matches += episodeTitleResult.matches * 4;
        if (result.matches !== 0) {
            const episodeTypeResult = this.isEpisodeSameType(aEpisode, bEpsiode);
            result.matchAble += episodeTypeResult.matchAble;
            result.matches += episodeTypeResult.matches;
        }

        return result;
    }

    public static isEpisodeSameType(aEpsiode: Episode, bEpisode: Episode): ComperatorResult {
        const compareResult = new ComperatorResult();
        if (aEpsiode.type === EpisodeType.SPECIAL || bEpisode.type === EpisodeType.SPECIAL) {
            compareResult.matchAble = 1;
            if (aEpsiode.type === bEpisode.type) {
                compareResult.matches = 1;
            }
        } else if (aEpsiode.type !== EpisodeType.UNKOWN || bEpisode.type !== EpisodeType.UNKOWN) {
            compareResult.matchAble = 1;
            if (aEpsiode.type === bEpisode.type) {
                compareResult.matches = 1;
            }
        }
        return compareResult;
    }

    public static async isEpisodeSameAsDetailedEpisode(aEpisode: number, bEpisode: Episode, season?: Season): Promise<boolean> {
        if (await this.isDetailedEpisodeSameSeason(bEpisode, season)) {
            if (aEpisode === bEpisode.episodeNumber) {
                return true;
            }
        }
        return false;
    }
    /**
     * Compares season between two episodes.
     * Uses provider season as fallback if episode has no season number.
     * Uses series season as fallback if episode and provider has no season number.
     *
     * @param aEpisode episode a
     * @param bEpisode episode b
     * @param providerASeason provider a season number
     * @param providerBSeason provider b season number
     * @param season series season number.
     */
    public static isEpisodeSameSeason(aEpisode: Episode, bEpisode: Episode, providerASeason?: Season, providerBSeason?: Season, season?: Season): boolean {
        let aSeason: Season | undefined;
        if (aEpisode.season !== undefined) {
            aSeason = aEpisode.season;
        } else if (providerASeason !== undefined) {
            aSeason = providerASeason;
        } else if (season !== undefined) {
            aSeason = season;
        }

        let bSeason: Season | undefined;
        if (bEpisode.season !== undefined) {
            bSeason = bEpisode.season;
        } else if (providerBSeason !== undefined) {
            bSeason = providerBSeason;
        } else if (season !== undefined) {
            bSeason = season;
        }

        if (SeasonComperator.isSameSeason(aSeason, bSeason)) {
            return true;
        } else if (!season && !aSeason && bSeason?.seasonNumber === 1) {
            return true;
        } else if (!season && !bSeason && aSeason?.seasonNumber === 1) {
            return true;
        }
        return false;
    }

    public static async isDetailedEpisodeSameSeason(episode: Episode, season?: Season) {
        if (SeasonComperator.isSameSeason(episode.season, season)) {
            return true;
        } else if (!episode.season !== undefined && (!season !== undefined || season?.seasonNumber === 1)) {
            return true;
        } else if (!season !== undefined && episode.season?.seasonNumber === 1) {
            return true;
        }
        return false;
    }

    public static async isEpisodeASeasonHigher(aEpisode: Episode, bEpisode: Episode, season?: Season): Promise<boolean> {
        if (aEpisode.season !== undefined && bEpisode.season !== undefined) {
            return aEpisode.season > bEpisode.season;
        } else if (aEpisode.season !== undefined && aEpisode.season.seasonNumber !== undefined) {
            if (season !== undefined && season.seasonNumber !== undefined) {
                return aEpisode.season.seasonNumber < season.seasonNumber;
            } else {
                if (aEpisode.season.seasonNumber === 1) {
                    return false;
                } else {
                    return true;
                }
            }
        } else if (bEpisode.season !== undefined) {
            if (season?.seasonNumber !== undefined && bEpisode.season.seasonNumber !== undefined) {
                return bEpisode.season.seasonNumber < season.seasonNumber;
            } else {
                return false;
            }
        }
        return false;
    }

    public static compareEpisodeTitle(aEpisode: Episode, bEpsiode: Episode): ComperatorResult {
        const result = new ComperatorResult();
        
        for (const aEpisodeTitle of aEpisode.title) {
            let found = false;
            let textA = aEpisodeTitle.text;
            result.matchAble++;
            for (const bEpisodeTitle of bEpsiode.title) {
                let textB = bEpisodeTitle.text;
                if (textB !== '') {
                    // tslint:disable-next-line: triple-equals
                    if (textA == textB) {
                        result.matches++;
                        found = true;
                        result.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                        break;
                    }
                    textA = textA.toLowerCase();
                    textB = textB.toLowerCase();
                    textA = textA.replace(' the ', ' ');
                    textB = textB.replace(' the ', ' ');
                    if (textA === textB) {
                        result.matches++;
                        found = true;
                        result.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                        break;
                    }
                    textA = textA.replace(' & ', ' ');
                    textB = textB.replace(' & ', ' ');
                    textA = textA.replace(' and ', ' ');
                    textB = textB.replace(' and ', ' ');
                    if (textA === textB) {
                        result.matches++;
                        found = true;
                        result.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                        break;
                    }
                }
            }
            if (found) {
                break;
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
            season = aSeriesSeason;
        }

        for (const aEpisode of aAllADetailedEpisodes) {
            result.matchAble += 0.15;
            for (const bEpsiode of bAllDetailedEpisodes) {
                if (this.isEpisodeSameSeason(aEpisode, bEpsiode, undefined, undefined, season) && aEpisode.episodeNumber === bEpsiode.episodeNumber) {
                    result.matches += 0.15;

                    const episodeTitleResult = this.compareEpisodeTitle(aEpisode, bEpsiode);
                    result.matchAble += episodeTitleResult.matchAble;
                    result.matches += episodeTitleResult.matches;
                }

            }
        }
        return result;
    }
}
