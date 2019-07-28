import stringHelper from '../../../backend/helpFunctions/stringHelper';
import Names from './names';
import Overview from './overview';
import listHelper from '../../../backend/helpFunctions/listHelper';
import  WatchProgress  from './watchProgress';
import { ListProviderLocalData } from './listProviderLocalData';
import { InfoProviderLocalData } from './infoProviderLocalData';
import ProviderLocalData from '../interfaces/ProviderLocalData';

export default class Anime {
    public id: string = '';
    public lastUpdate: number = Date.now();
    public names: Names = new Names();
    public listProviderInfos: ListProviderLocalData[] = [];
    public infoProviderInfos: InfoProviderLocalData[] = [];
    public episodes?: number;
    public coverImage: string = '';
    public overviews: Overview[] = [];
    public releaseYear?: number;
    public seasonNumber?: number;
    public runTime?: number;
    constructor() {
        this.listProviderInfos = [];
        // Generates randome string.
        this.id = stringHelper.randomString(20);
    }

    public addOverview(newOverview: Overview) {
        this.overviews = [...this.overviews];
        if (this.overviews.findIndex(x => x == newOverview) == -1) {
            this.overviews.push(newOverview);
        }
    }

    public getMaxEpisode(): number {
        const array = (this.listProviderInfos.flatMap(x => x.episodes) as number[]);
        if (typeof this.episodes != 'undefined') {
            array.push(this.episodes);
        }
        const onlyNumbers = array.filter(v => Number.isInteger(v as number));
        if (onlyNumbers.length == 0) {
            throw 'no episode found';
        }
        return Math.max(...onlyNumbers);
    }

    public async getAllEpisodes(): Promise<number[]> {
        let result;
        try {
            result = await listHelper.cleanArray(this.listProviderInfos.flatMap(x => x.episodes))
        } catch (e) { }
        if (typeof result == 'undefined') {
            if (typeof this.episodes != 'undefined') {
                return [this.episodes];
            }
        } else {
            if (typeof this.episodes != 'undefined') {
                result.push(this.episodes);
            }
            return await listHelper.getUniqueList(result as number[]);
        }
        throw 'no episode found';
    }

    /**
     * Returns the Season of the Anime based on Season entry or name.
     * @hasTest
     */
    public async getSeason(): Promise<number | undefined> {
        if (typeof this.seasonNumber != 'undefined') {
            return this.seasonNumber;
        } else {
            return await this.names.getSeasonNumber();
        }
    }

    /**
     * Checks if providers can be synced.
     * The Provider need to have epidoes.
     * The Provider need to have a user loggedIn.
     * The Provider need to be out of sync.
     */
    public async getCanSyncStatus(): Promise<boolean> {
        if (this.listProviderInfos.length <= 1) {
            return false;
        }

        let latestUpdatedProvider: ListProviderLocalData | null = await this.getLastUpdatedProvider();

        if (!latestUpdatedProvider) {
            throw 'no provider with valid sync status'
        }
        latestUpdatedProvider = Object.assign(new ListProviderLocalData(), latestUpdatedProvider);
        if (!await latestUpdatedProvider.getListProviderInstance().isUserLoggedIn()) {
            latestUpdatedProvider.lastUpdate = new Date(0);
            for (let provider of this.listProviderInfos) {
                provider = Object.assign(new ListProviderLocalData(), provider);
                if (provider != latestUpdatedProvider) {
                    if (new Date(provider.lastUpdate) > latestUpdatedProvider.lastUpdate && provider.getListProviderInstance().isUserLoggedIn()) {
                        latestUpdatedProvider = provider;
                    }
                }
            }
        }

        for (let provider of this.listProviderInfos) {
            provider = Object.assign(new ListProviderLocalData(), provider);
            if (latestUpdatedProvider.provider != provider.provider && await provider.getListProviderInstance().isUserLoggedIn()) {
                const watchProgress = provider.getHighestWatchedEpisode();
                const latestWatchProgress = latestUpdatedProvider.getHighestWatchedEpisode();
                if (latestUpdatedProvider.watchProgress && latestWatchProgress && provider.episodes) {
                    if (!watchProgress) {
                        return true;
                    }
                    // If the watchprogress has a difference and if the provider has a max defined episode.
                    // Without the episodes we dont know if we can sync or not.
                    if (latestWatchProgress.episode != watchProgress.episode) {
                        if (typeof latestUpdatedProvider.episodes == 'undefined' || latestWatchProgress.episode < latestUpdatedProvider.episodes) {
                            if (typeof watchProgress === 'undefined') {
                                return true;
                            } else if (typeof this.episodes != 'undefined' && this.episodes < watchProgress.episode) {
                                return false;
                            } else {
                                provider.canUpdateWatchProgress = true;
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * @return the last updated provider with watchProgress !
     */
    private async getLastUpdatedProvider(exclude: ListProviderLocalData[] = []): Promise<ListProviderLocalData | null> {
        let latestUpdatedProvider: ListProviderLocalData | null = null;
        if (typeof this.listProviderInfos != 'undefined') {
            for (const provider of this.listProviderInfos) {
                if (typeof provider.watchProgress != 'undefined') {
                    if (exclude.findIndex(x => x == latestUpdatedProvider) === -1) {
                        if (latestUpdatedProvider === null) {
                            latestUpdatedProvider = provider;
                        } else {
                            const latestExternalStatus = typeof latestUpdatedProvider.lastExternalChange != 'undefined' && new Date(latestUpdatedProvider.lastExternalChange).getTime() != 0;
                            const providerExternalStatus = typeof provider.lastExternalChange != 'undefined' && new Date(provider.lastExternalChange).getTime() != 0;
                            if (latestExternalStatus && providerExternalStatus) {
                                if (new Date(latestUpdatedProvider.lastExternalChange).getTime() < new Date(provider.lastExternalChange).getTime()) {
                                    latestUpdatedProvider = provider;
                                }
                            } else if (new Date(latestUpdatedProvider.lastUpdate).getTime() < new Date(provider.lastUpdate).getTime()) {
                                latestUpdatedProvider = provider;
                            }
                        }
                    }
                }
            }
        }
        return latestUpdatedProvider;
    }

    public readdFunctions() {
        var overviewsCache: Overview[] = [];
        for (const overview of this.overviews) {
            overviewsCache.push(new Overview(overview.content, overview.lang));
        }
        var providersCache: ListProviderLocalData[] = [];
        for (const provider of this.listProviderInfos) {
            providersCache.push(Object.assign(new ListProviderLocalData(), provider));
        }
        this.listProviderInfos = providersCache;
        this.overviews = overviewsCache;
        this.names = Object.assign(new Names(), this.names);
    }

    public async merge(anime: Anime): Promise<Anime> {
        const newAnime: Anime = new Anime();

        newAnime.names.engName = await this.mergeString(this.names.engName, anime.names.engName, 'EngName');
        newAnime.names.romajiName = await this.mergeString(this.names.romajiName, anime.names.romajiName, 'RomajiName');
        newAnime.names.mainName = await this.mergeString(this.names.mainName, anime.names.mainName, 'MainName');
        newAnime.names.shortName = await this.mergeString(this.names.shortName, anime.names.shortName, 'ShortNmae');
        newAnime.names.otherNames.push(...this.names.otherNames, ...anime.names.otherNames);
        newAnime.names.otherNames = await listHelper.getUniqueList(newAnime.names.otherNames);

        newAnime.episodes = await listHelper.findMostFrequent(await listHelper.cleanArray(this.listProviderInfos.flatMap(x => x.episodes)));
        let seasonarr = await listHelper.cleanArray([this.seasonNumber, anime.seasonNumber]);
        if (typeof seasonarr !== 'undefined') {
            newAnime.seasonNumber = await listHelper.findMostFrequent(seasonarr);
        }

        newAnime.releaseYear = await this.mergeNumber(this.releaseYear, anime.releaseYear, newAnime.names.mainName, 'ReleaseYear');

        newAnime.runTime = await this.mergeNumber(this.runTime, anime.runTime, newAnime.names.mainName, 'RunTime');
        newAnime.coverImage = await this.mergeString(anime.coverImage, this.coverImage);
        newAnime.listProviderInfos = await this.mergeProviders(...[...this.listProviderInfos, ...anime.listProviderInfos]) as ListProviderLocalData[];
        newAnime.infoProviderInfos = await this.mergeProviders(...[...this.infoProviderInfos, ...anime.infoProviderInfos]) as InfoProviderLocalData[];
        newAnime.coverImage = await this.mergeString(this.names.shortName, anime.names.shortName, 'CoverImage');
        try {
            if (this.overviews != null && typeof this.overviews != 'undefined') {
                newAnime.overviews.push(...this.overviews);
            }
            if (anime.overviews != null && typeof anime.overviews != 'undefined') {
                newAnime.overviews.push(...anime.overviews);
            }
            newAnime.overviews = await listHelper.getUniqueOverviewList(await listHelper.cleanArray(newAnime.overviews));
        } catch (err) {
            console.log(err);
        }
        return newAnime;
    }

    private async mergeProviders(...providers: ProviderLocalData[]): Promise<ProviderLocalData[]> {
        let mergedProviderInfos: ProviderLocalData[] = []
        for (const provider of providers) {
            var check = mergedProviderInfos.find(x => provider.provider === x.provider);
            if (typeof check === 'undefined') {
                var collected: ProviderLocalData[] = [];
                for (const provider2 of providers) {
                    if (provider2.provider == provider.provider) {
                        collected.push(provider2);
                    }
                }
                if (collected.length >= 2) {
                    if (listHelper.checkType(collected, ListProviderLocalData)) {
                        mergedProviderInfos.push(await ListProviderLocalData.mergeProviderInfos(...collected as ListProviderLocalData[]));
                    } else if (listHelper.checkType(collected, InfoProviderLocalData)) {
                        mergedProviderInfos.push(await InfoProviderLocalData.mergeProviderInfos(...collected as InfoProviderLocalData[]));
                    }
                } else {
                    mergedProviderInfos.push(provider);
                }
            }
        }
        return mergedProviderInfos;
    }

    private async mergeNumber(a: number | undefined, b: number | undefined, name?: string, target?: string): Promise<number> {
        if (this.isDefined(b) && b === a) {
            return b;
        } else if ((b === 0 || !this.isDefined(b)) && (this.isDefined(a) || a !== 0)) {
            return a as number;
        } else if ((!this.isDefined(a) || a === 0) && (this.isDefined(b) || b !== 0)) {
            return b as number;
        } else {
            console.log('(' + target + ') Cant find a valid number: ' + a + ' vs ' + b + ' | ' + name);
            return a as number;
        }
    }
    private isDefined<T>(value: T | undefined | null): value is T {
        return <T>value !== undefined && <T>value !== null;
    }
    private async mergeString(a: string, b: string, topic?: string): Promise<string> {
        if (a === '' || a == null) {
            return b;
        } else if (b === '' || b == null) {
            return a;
        } else {
            if (a.toLocaleLowerCase() === b.toLocaleLowerCase() && a !== '' && b !== '' && a != null && b != null) {
                return a;
            } else {
                console.log(a + ' != ' + b + ' | How to handle that? (' + topic + ')');
                return a;
            }
        }
    }

    public async getLastWatchProgress(): Promise<WatchProgress> {

        let latestUpdatedProvider = Object.assign(new ListProviderLocalData(), await this.getLastUpdatedProvider())
        if (latestUpdatedProvider === null) {
            throw 'no provider with valid sync status'
        }
        const watchProgress = latestUpdatedProvider.getHighestWatchedEpisode();
        if (typeof watchProgress != 'undefined') {
            return watchProgress;
        } else {
            throw 'no watch progress';
        }
    }
}


export enum WatchStatus {
    // Currently watching/reading
    CURRENT,
    // Planning to watch / read
    PLANNING,
    // Finished watching / reading
    COMPLETED,
    // Stopped watching / reading before completing
    DROPPED,
    // Paused watching / reading
    PAUSED,
    // Re - watching / reading
    REPEATING,
}
