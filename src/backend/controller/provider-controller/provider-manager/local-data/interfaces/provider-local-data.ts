
import SeasonComperator from '../../../../../helpFunctions/comperators/season-comperator';
import EpisodeHelper from '../../../../../helpFunctions/episode-helper/episode-helper';
import listHelper from '../../../../../helpFunctions/list-helper';
import SeasonHelper from '../../../../../helpFunctions/season-helper/season-helper';
import logger from '../../../../../logger/logger';
import Banner from '../../../../objects/meta/banner';
import Cover from '../../../../objects/meta/cover';
import Episode from '../../../../objects/meta/episode/episode';
import EpisodeMapping from '../../../../objects/meta/episode/episode-mapping';
import { EpisodeType } from '../../../../objects/meta/episode/episode-type';
import Genre from '../../../../objects/meta/genre';
import { MediaType } from '../../../../objects/meta/media-type';
import Name from '../../../../objects/meta/name';
import Overview from '../../../../objects/meta/overview';
import Season from '../../../../objects/meta/season';
import { ProviderInfoStatus } from './provider-info-status';

export default abstract class ProviderLocalData {

    /**
     * b will be merged in to a. Includes all basic lists and ALL static values.
     *
     * All lists that are specific for other providers will merged but not be unique and doubled,
     * they needed too be filtered by the merged function of the provider.
     * @param a
     * @param b
     */
    protected static async mergeProviderLocalData(...providers: ProviderLocalData[]): Promise<ProviderLocalData> {
        providers.sort((a, b) => a.lastUpdate.getTime() - b.lastUpdate.getTime());
        let finalProvider: any = {};
        for (const provider of providers) {
            finalProvider = this.mergeBasicEntrys(finalProvider, provider);
        }

        finalProvider.genres = finalProvider.genres ? await listHelper.getUniqueObjectList(finalProvider.genres) : [];
        finalProvider.banners = finalProvider.banners ? await listHelper.getUniqueObjectList(finalProvider.banners) : [];
        finalProvider.covers = finalProvider.covers ? await listHelper.getUniqueObjectList(finalProvider.covers) : [];

        finalProvider.names = finalProvider.names ? await listHelper.getUniqueNameList(finalProvider.names) : [];
        finalProvider.overviews = finalProvider.overviews ? await listHelper.getUniqueOverviewList(finalProvider.overviews) : [];
        return finalProvider;
    }

    private static mergeBasicEntrys(newProvider: ProviderLocalData, oldProvider: ProviderLocalData): ProviderLocalData {
        const newP: any = newProvider;
        for (const key in oldProvider) {
            // eslint-disable-next-line no-prototype-builtins
            if (oldProvider.hasOwnProperty(key)) {
                const oldValue = (oldProvider as any)[key];
                if (Array.isArray(oldValue)) {
                    if (newP[key] !== undefined) {
                        if (key === 'sequelIds' || key === 'prequelIds' || key === 'alternativeIds') {
                            if (oldValue.length !== 0) {
                                newP[key] = oldValue;
                            }
                        } else if (key === 'detailEpisodeInfo') {
                            newP[key] = listHelper.getUniqueEpisodeList(newP[key], oldValue);
                        } else {
                            newP[key] = [...newP[key], ...oldValue];
                        }
                        continue;
                    }
                } else if (key === 'infoStatus') {
                    if (newP[key] !== undefined) {
                        if (newP[key] > oldValue) {
                            newP[key] = oldValue;
                        }
                        continue;
                    }
                } else if (key === 'isNSFW') {
                    if (oldValue) {
                        newP[key] = oldValue;
                    }
                    continue;
                }
                if (oldValue !== undefined) {
                    newP[key] = oldValue;
                }
            }
        }
        return newP;
    }

    private static mergeEpisodeList() { }
    // ------------------
    //  Provider metadata stuff
    // ------------------

    /**
     * The version number of the data object.
     * If this get raised the client knows it needs too update his own data.
     */
    public abstract version: number = 1;
    /**
     * Provider series id.
     */
    public readonly id: number | string;
    public readonly instanceName: string;
    /**
     * Cant get more info from this provider.
     */
    public infoStatus: ProviderInfoStatus = ProviderInfoStatus.ONLY_ID;
    /**
     * The provider name
     */
    public abstract readonly provider: string = '';
    /**
     * Saves the raw response from the provider
     *
     * This data can be very usefull in debug sessions.
     *
     * Info: This var has no logic its just data that sits here.
     */
    public rawEntry: any;
    /**
     * Saves the last update from the last refresh of the data.
     */
    public lastUpdate: Date = new Date();
    /**
     * Save the last update from the provider.
     */
    public lastExternalChange: Date = new Date(0);


    // ----------------------
    // Series metadata stuff
    // ----------------------

    public score?: number;
    public episodes?: number;
    public publicScore?: number;
    public covers: Cover[] = [];
    public banners: Banner[] = [];
    public mediaType: MediaType = MediaType.UNKOWN;
    public releaseYear?: number;
    public runTime?: number;
    public isNSFW = false;
    public country?: string;
    public genres: Genre[] = [];
    public detailEpisodeInfo: Episode[] = [];
    /**
     * Only fill this if provider give sequel ids and have different ids for every season.
     */
    public sequelIds: number[] = [];
    /**
     * Only fill this if provider give prequel ids and have different ids for every season.
     */
    public prequelIds: number[] = [];
    /**
     *
     * Alternative IDs from the same provider.
     * This prevents merging alternatives together.
     */
    public alternativeIds: number[] = [];

    /**
     * Protected
     */
    protected names: Name[] = [];
    protected overviews: Overview[] = [];

    constructor(id: string | number) {
        if (id) {
            this.id = id;
        } else {
            const errorMsg = '[LOCALDATA] ERROR: INVALID ID. UNABLE TO CREATE LOCALDATA INSTANCE ! ID: ' + id;
            logger.error(errorMsg);
            throw new Error(errorMsg);
        }
        this.instanceName = this.constructor.name;
    }

    public getDetailedEpisodeLength(): number {
        let length = 0;

        for (const episode of this.detailEpisodeInfo) {
            if (episode.type === EpisodeType.REGULAR_EPISODE || episode.type === EpisodeType.SPECIAL || episode.type === EpisodeType.UNKOWN) {
                length++;
            }
        }

        return length;
    }

    // ------------------
    //  Function section
    // ------------------

    /**
     * Prevents too have double entrys for same name.
     * @param infoProvider
     */
    public addSeriesName(...names: Name[]): void {
        for (const name of names) {
            if (name && name.name && name.name !== 'null') {
                if (this.names.findIndex((x) => x.name === name.name && x.lang === x.lang) === -1) {
                    this.names.push(name);
                }
            }
        }
    }

    /**
     * Adds an Overview too the Anime and prevents adding if overview is already present.
     * @param newOverview
     */
    public addOverview(...newOverviews: Overview[]): boolean {
        this.overviews = [...this.overviews];
        for (const newOverview of newOverviews) {


            if (this.overviews.findIndex((x) => x === newOverview) === -1) {
                this.overviews.push(newOverview);
                return true;
            }
        }
        return false;
    }

    /**
     * Returns all names that this provider have.
     *
     */
    public getAllNames(): readonly Name[] {
        return Object.freeze([...this.names]);
    }

    /**
     * Returns all overviews that this provider have.
     *
     */
    public getAllOverviews(): readonly Overview[] {
        return Object.freeze([...this.overviews]);
    }

    /**
     * Simple function that checks if the provider data is from media type movie.
     */
    public isMediaTypeMovie(): boolean {
        return this.mediaType === MediaType.MOVIE;
    }

    public getDetailEpisodeInfos(): Episode[] {
        return this.detailEpisodeInfo;
    }

    public getDetailEpisodeInfosByMapping(episdoeMapping: EpisodeMapping): Episode | undefined {
        return this.detailEpisodeInfo.find((x) => x.id === episdoeMapping.id);
    }

    public getAllRegularEpisodes(season?: Season): Episode[] {
        const detailsEpisode = this.getAllDetailedEpisodes(season);
        const result = [];
        for (const episode of detailsEpisode) {
            if (episode.type === EpisodeType.REGULAR_EPISODE || episode.type === EpisodeType.UNKOWN) {
                result.push(episode);
            }
        }
        return result;
    }

    public addDetailedEpisodeInfos(...episodes: Episode[]): void {
        for (const episode of episodes) {
            episode.provider = this.provider;
            episode.providerId = this.id;
            this.detailEpisodeInfo.push(episode);
            this.detailEpisodeInfo = EpisodeHelper.sortingEpisodeListByEpisodeNumber(this.detailEpisodeInfo);
        }
    }

    /**
     *
     */
    public getAllDetailedEpisodes(season?: Season): Episode[] {
        let array = this.detailEpisodeInfo;
        if (season !== undefined && season.isSeasonNumberPresent()) {
            array = array.filter((x) => SeasonComperator.isSameSeasonNumber(x.season, season) || SeasonHelper.isSeasonUndefined(x.season));
        }
        return array;
    }
}
