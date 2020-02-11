import Episode from '../../controller/objects/meta/episode/episode';
import EpisodeMapping from '../../controller/objects/meta/episode/episode-mapping';
import { EpisodeType } from '../../controller/objects/meta/episode/episode-type';
import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import logger from '../../logger/logger';
import stringHelper from '../string-helper';
import ComperatorResult, { AbsoluteResult } from './comperator-results.ts/comperator-result';
import SeasonComperator from './season-comperator';

export default class EpisodeComperator {
    public static async compareEpisodes(a: Series, b: Series): Promise<ComperatorResult> {
        const result = new ComperatorResult();
        try {
            const allAEpisodePromise = a.getAllEpisodes();
            const allBEpisodePromise = b.getAllEpisodes();
            const allAEpisodes = await allAEpisodePromise;
            const allBEpisodes = await allBEpisodePromise;
            // Search if there is a match between the arrays.
            if (allAEpisodes.length !== 0 && allBEpisodes.length !== 0) {
                result.matchAble += 2;
                if (allAEpisodes.findIndex((valueA) => allBEpisodes.findIndex((valueB) => valueB === valueA) !== -1) !== -1) {
                    result.matches += 2;
                }
            }
        } catch (err) {
            logger.error('Error at EpisodeComperator.compareEpisodes');
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
            if (aEpisode.provider === bEpsiode.provider) {
                if (aEpisode.providerEpisodeId === bEpsiode.providerEpisodeId && aEpisode.providerEpisodeId !== undefined) {
                    result.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                    result.matches++;
                    return result;
                }
                if (aEpisode.id !== bEpsiode.id) {
                    result.isAbsolute = AbsoluteResult.ABSOLUTE_FALSE;
                    return result;
                }
            }
        }

        if (!isNaN(bEpsiode.episodeNumber as unknown as number) && (bEpsiode.episodeNumber as number) + upshift === aEpisode.episodeNumber) {
            result.matches++;
            result.matchAble++;
            if (this.isEpisodeSameSeason(aEpisode, bEpsiode, providerASeason, providerBSeason, season)) {
                result.matches++;
            }
        }

        const episodeTitleResult = this.compareEpisodeTitle(aEpisode, bEpsiode);
        result.matchAble += episodeTitleResult.matchAble * 4;
        result.matches += episodeTitleResult.matches * 4;
        result.isAbsolute = episodeTitleResult.isAbsolute;
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

    public static isEpisodeSameAsDetailedEpisode(aEpisode: number, bEpisode: Episode, season?: Season): boolean {
        if (this.isDetailedEpisodeSameSeason(bEpisode, season)) {
            if (this.compareEpNr(aEpisode, bEpisode.episodeNumber)) {
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
        if (aEpisode.season !== undefined && aEpisode.season.isSeasonNumberPresent()) {
            aSeason = aEpisode.season;
        } else if (providerASeason !== undefined && providerASeason.isSeasonNumberPresent()) {
            aSeason = providerASeason;
        } else if (season !== undefined && season.isSeasonNumberPresent()) {
            aSeason = season;
        }

        let bSeason: Season | undefined;
        if (bEpisode.season !== undefined && bEpisode.season.isSeasonNumberPresent()) {
            bSeason = bEpisode.season;
        } else if (providerBSeason !== undefined && providerBSeason.isSeasonNumberPresent()) {
            bSeason = providerBSeason;
        } else if (season !== undefined && season.isSeasonNumberPresent()) {
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

    public static isDetailedEpisodeSameSeason(episode: Episode, season?: Season): boolean {
        if (SeasonComperator.isSameSeason(episode.season, season)) {
            return true;
        } else if (!episode.season !== undefined && (!season !== undefined || season?.seasonNumber === 1)) {
            return true;
        } else if (!season !== undefined && episode.season?.seasonNumber === 1) {
            return true;
        }
        return false;
    }

    public static isSameEpisodeNumber(episodeNumberA: number | string, episodeNumberB: number | string, episodeDiff: number): boolean {
        // tslint:disable-next-line: triple-equals
        if (!isNaN(episodeNumberA as number) && (episodeNumberA as unknown as number) + episodeDiff == episodeNumberB) {
            return true;
            // tslint:disable-next-line: triple-equals
        } else if (isNaN(episodeNumberA as number) && isNaN(episodeNumberB as number) && episodeNumberA == episodeNumberB) {
            return true;
        }
        return false;
    }

    public static isEpisodeASeasonHigher(aEpisode: Episode, bEpisode: Episode, season?: Season): boolean {
        if (aEpisode.season !== undefined && bEpisode.season !== undefined && aEpisode.season.isSeasonNumberPresent() && bEpisode.season.isSeasonNumberPresent()) {
            return (aEpisode.season.seasonNumber as unknown as number) < (bEpisode.season.seasonNumber as unknown as number);
        } else if (aEpisode.season !== undefined && aEpisode.season.seasonNumber !== undefined) {
            if (season !== undefined && season.seasonNumber !== undefined) {
                return aEpisode.season.seasonNumber < season.seasonNumber;
            }
        } else if (bEpisode.season !== undefined && season !== undefined) {
            if (season?.seasonNumber !== undefined && bEpisode.season.seasonNumber !== undefined) {
                return bEpisode.season.seasonNumber > season.seasonNumber;
            } else {
                return false;
            }
        }
        return false;
    }

    public static compareEpisodeMapping(aEpisodeMapping: EpisodeMapping, bEpisodeMapping: EpisodeMapping): boolean {
        if (aEpisodeMapping.id === bEpisodeMapping.id) {
            return true;
        } else if (aEpisodeMapping.provider === bEpisodeMapping.provider) {
            // tslint:disable-next-line: triple-equals
            if (this.compareEpNr(aEpisodeMapping.episodeNumber, bEpisodeMapping.episodeNumber) && SeasonComperator.isSameSeason(aEpisodeMapping.season, bEpisodeMapping.season)) {
                return true;
            } else if (aEpisodeMapping.providerEpisodeId !== undefined && (aEpisodeMapping.providerEpisodeId === bEpisodeMapping.providerEpisodeId)) {
                return true;
            }
        }

        return false;
    }

    public static compareEpisodeMappingToEpisode(aEpisodeMapping: EpisodeMapping, aEpisode: Episode): boolean {
        if (aEpisodeMapping.id === aEpisode.id) {
            return true;
        } else if (aEpisodeMapping.provider === aEpisode.provider) {
            // tslint:disable-next-line: triple-equals
            if (aEpisodeMapping.episodeNumber == aEpisode.episodeNumber && SeasonComperator.isSameSeason(aEpisodeMapping.season, aEpisode.season)) {
                return true;
            } else if (aEpisodeMapping.providerEpisodeId !== undefined && (aEpisodeMapping.providerEpisodeId === aEpisode.providerEpisodeId)) {
                return true;
            }
        }

        return false;
    }

    public static compareEpisodeTitle(aEpisode: Episode, bEpsiode: Episode): ComperatorResult {
        const result = new ComperatorResult();
        if (aEpisode.title.length !== 0 || bEpsiode.title.length !== 0) {
            result.matchAble++;
            for (const aEpisodeTitle of aEpisode.title) {
                let found = false;
                for (const bEpisodeTitle of bEpsiode.title) {
                    let textA = { ...aEpisodeTitle }.text;
                    let textB = { ...bEpisodeTitle }.text;
                    if (textB !== '') {
                        // tslint:disable-next-line: triple-equals
                        if (textA == textB) {
                            found = true;
                            break;
                        }
                        textA = textA.toLowerCase();
                        textB = textB.toLowerCase();
                        textA = textA.replace(' the ', ' ');
                        textB = textB.replace(' the ', ' ');
                        if (textA === textB) {
                            found = true;
                            break;
                        }
                        textA = textA.replace(' & ', ' ');
                        textB = textB.replace(' & ', ' ');
                        textA = textA.replace(' and ', ' ');
                        textB = textB.replace(' and ', ' ');
                        textA = stringHelper.cleanString(textA);
                        textB = stringHelper.cleanString(textB);
                        if (textA === textB) {
                            found = true;
                            break;
                        }
                    }
                }
                if (found) {
                    result.matches++;
                    result.isAbsolute = AbsoluteResult.ABSOLUTE_TRUE;
                    return result;
                }
            }
        }
        return result;
    }
    /**
     * Compares two episode numbers
     * @param number1 episode number 1 will be compared with 2.
     * @param number2 episode number 2 will be compared with 1.
     */
    public static compareEpNr(number1: number | string, number2: number | string): boolean {
        // tslint:disable-next-line: triple-equals
        return number1 == number2;
    }
}
