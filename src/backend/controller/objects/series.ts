import stringHelper from '../../helpFunctions/stringHelper';
import Overview from './meta/overview';
import listHelper from '../../helpFunctions/listHelper';
import WatchProgress from './meta/watchProgress';
import { ListProviderLocalData } from './listProviderLocalData';
import { InfoProviderLocalData } from './infoProviderLocalData';
import ProviderLocalData from '../interfaces/ProviderLocalData';
import { ImageSize } from './meta/ImageSize';
import Cover from './meta/Cover';
import { MediaType } from './meta/mediaType';
import ListController from '../listController';
import Name from './meta/name';

export default class Series {
    public static version = 1;

    public packageId: string = '';
    public id: string = '';
    public lastUpdate: number = Date.now();
    public lastInfoUpdate: number = 0;
    private names: Name[] = [];
    public mediaType: MediaType = MediaType.SERIES;
    private listProviderInfos: ListProviderLocalData[] = [];
    private infoProviderInfos: InfoProviderLocalData[] = [];
    public episodes?: number;
    public overviews: Overview[] = [];
    public releaseYear?: number;
    public runTime?: number;
    public isNSFW = false;


    private cachedSeason?: number | null = null;
    private seasonDetectionType: string = "";
    private canSync: boolean | null = null;
    constructor() {
        this.listProviderInfos = [];
        // Generates randome string.
        this.id = stringHelper.randomString(30);
    }


    async getAllNames(): Promise<Name[]> {
        const names = [...this.names];
        for (const provider of this.infoProviderInfos) {
            names.push(...provider.names);
        }
        return await listHelper.getUniqueNameList(names);
    }

    /**
     * Get a Cover image of a prefered size.
     * 
     * If the prefered size can not be found it will search of a lower size.
     * 
     * If the series have no covers then it will return [null].
     * 
     * @param preferedSize default: LARGE
     */
    getCoverImage(preferedSize: ImageSize = ImageSize.LARGE): Cover | null {
        let ressources: ProviderLocalData[] = [...this.listProviderInfos, ...this.infoProviderInfos];
        let result: Cover | null = null;
        for (const listProvider of ressources) {
            if (listProvider.covers && listProvider.covers.length != 0) {
                for (const cover of listProvider.covers) {
                    if (result == null) {
                        result = cover;
                    } else if (result.size < preferedSize) {
                        result = cover;
                    }
                }
            }
        }
        return result;
    }

    /**
     * Prevents too have double entrys of the same provider.
     * @param infoProvider 
     */
    public async addInfoProvider(infoProvider: InfoProviderLocalData) {
        const index = this.infoProviderInfos.findIndex(x => infoProvider.provider === x.provider);
        if (index === -1) {
            this.infoProviderInfos.push(infoProvider);
        } else {
            this.infoProviderInfos[index] = await InfoProviderLocalData.mergeProviderInfos(this.infoProviderInfos[index], infoProvider);;
        }
    }

    /**
     * Prevents too have double entrys of the same provider.
     * @param listProvider 
     */
    public async addListProvider(...listProviders: ListProviderLocalData[]) {
        for (const listProvider of listProviders) {
            const index = this.listProviderInfos.findIndex(x => listProvider.provider === x.provider);
            if (index === -1) {
                this.listProviderInfos.push(listProvider);
            } else {
                this.listProviderInfos[index] = await ListProviderLocalData.mergeProviderInfos(this.listProviderInfos[index], listProvider);
            }
        }
    }

    public getListProvidersInfos() {
        return this.listProviderInfos;
    }

    public getInfoProvidersInfos() {
        return this.infoProviderInfos;
    }

    /**
    * Prevents too have double entrys for same name.
    * @param infoProvider 
    */
    public addSeriesName(...names: Name[]) {
        for (const name of names) {
            if (name) {
                if (this.names.findIndex(x => x.name === name.name && x.lang === x.lang) === -1) {
                    this.names.push(name);
                }
            }
        }
    }

    /**
     * Adds an Overview too the Anime and prevents adding if overview is already present.
     * @param newOverview 
     */
    public addOverview(newOverview: Overview): boolean {
        this.overviews = [...this.overviews];
        if (this.overviews.findIndex(x => x == newOverview) == -1) {
            this.overviews.push(newOverview);
            return true;
        }
        return false;
    }

    /**
     * It get the max number of that anime.
     */
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

    /**
     * Give an array of all episodes in numbers.
     */
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
    public async getSeason(searchInList: Series[] = new ListController().getMainList()): Promise<number | undefined> {
        if (this.cachedSeason === null) {

            for (const provider of this.listProviderInfos) {
                if (provider.targetSeason) {
                    this.cachedSeason = provider.targetSeason;
                    this.seasonDetectionType = "Provider: " + provider.provider;
                    return provider.targetSeason;
                }
            }
            const numberFromName = await Name.getSeasonNumber(await this.getAllNames());

            if (numberFromName) {
                this.cachedSeason = numberFromName;
                this.seasonDetectionType = "Name";
                return numberFromName;
            }
            try {
                let prquel = await this.getPrequel();
                let searchCount = 0;
                while (prquel) {
                    if (prquel.mediaType === this.mediaType) {
                        searchCount++;
                        const prequelSeason = await prquel.getSeason(searchInList);
                        if (prequelSeason === 1 || prequelSeason === 0) {
                            this.cachedSeason = prequelSeason + searchCount;
                            this.seasonDetectionType = "PrequelTrace";
                            return prequelSeason + searchCount;
                        }
                    }
                    try {
                        prquel = await prquel.getPrequel(searchInList);
                    } catch (err) {
                        this.cachedSeason = searchCount;
                        return searchCount;
                    }
                }
            } catch (err) { }
            this.seasonDetectionType = "None";
            this.cachedSeason = undefined;
        }
        return this.cachedSeason;
    }

    public async getPrequel(searchInList = new ListController().getMainList()): Promise<Series> {
        for (const listProvider of this.listProviderInfos) {
            if (listProvider.prequelIds) {
                for (const entry of searchInList) {
                    for (const entryListProvider of entry.listProviderInfos) {
                        if (entryListProvider.provider === listProvider.provider && listProvider.prequelIds.findIndex(x => entryListProvider.id === x) !== -1) {
                            return entry;
                        }
                    }
                }
            }
        }
        throw 'no prequel found';
    }

    public async getCanSync(): Promise<boolean> {
        const that = this;
        if (that.canSync) {
            return that.canSync;
        }
        try {
            that.canSync = await that.getCanSyncStatus();
        } catch (err) {
            console.log(err);
            that.canSync = false;
        }
        return that.canSync;
    }

    /**
     * Checks if providers can be synced.
     * The Provider need to have episode.
     * The Provider need to have a user loggedIn.
     * The Provider need to be out of sync.
     */
    private async getCanSyncStatus(): Promise<boolean> {
        if (this.listProviderInfos.length <= 1) {
            return false;
        }
        let latestUpdatedProvider: ListProviderLocalData | null = null;
        try {
            latestUpdatedProvider = await this.getLastUpdatedProvider();
        } catch (err) {
            console.log(err);
        }
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

    /**
     * With this function we can restore to childs there functions.
     * When the anime got loaded from a json or web there are no functions avaible with this we can restore it.
     */
    public readdFunctions() {
        var overviewsCache: Overview[] = [];
        for (const overview of this.overviews) {
            overviewsCache.push(new Overview(overview.content, overview.lang));
        }
        var providersCache: ListProviderLocalData[] = [];
        for (const provider of this.listProviderInfos) {
            providersCache.push(Object.assign(new ListProviderLocalData(), provider));
        }
        var infoPovidersCache: InfoProviderLocalData[] = [];
        for (const provider of this.infoProviderInfos) {
            infoPovidersCache.push(Object.assign(new InfoProviderLocalData(), provider));
        }
        this.infoProviderInfos = infoPovidersCache;
        this.listProviderInfos = providersCache;
        this.overviews = overviewsCache;
    }

    /**
     * Merge two animes to one object.
     * Will be often used too update watchprogress.
     * @param anime 
     */
    public async merge(anime: Series): Promise<Series> {
        const newAnime: Series = new Series();

        newAnime.names.push(...this.names, ...anime.names);
        newAnime.names = await listHelper.getUniqueNameList(newAnime.names);

        newAnime.episodes = await listHelper.findMostFrequent(await listHelper.cleanArray(this.listProviderInfos.flatMap(x => x.episodes)));
        newAnime.releaseYear = await this.mergeNumber(this.releaseYear, anime.releaseYear, newAnime.names[0].name, 'ReleaseYear');

        newAnime.runTime = await this.mergeNumber(this.runTime, anime.runTime, newAnime.names[0].name, 'RunTime');
        newAnime.listProviderInfos = await this.mergeProviders(...[...this.listProviderInfos, ...anime.listProviderInfos]) as ListProviderLocalData[];
        newAnime.infoProviderInfos = await this.mergeProviders(...[...this.infoProviderInfos, ...anime.infoProviderInfos]) as InfoProviderLocalData[];

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
        await newAnime.getSeason();

        await newAnime.getCanSync();

        if (this.lastInfoUpdate < anime.lastInfoUpdate) {
            newAnime.lastInfoUpdate = anime.lastInfoUpdate;
        } else {
            newAnime.lastInfoUpdate = this.lastInfoUpdate;
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
                        break;
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

    /**
     * Get all relations from a series based on prequel id or sequel id or same provider id.
     * And this item is in the return to!
     * @param list 
     */
    public async getAllRelations(list: Series[], retunWithThis = false): Promise<Series[]> {
        let relations = [this as Series];

        for (const entry2 of relations) {
            for (const entry of list) {
                if (!await listHelper.isSeriesInList(relations, entry)) {
                    try {
                        relations.push(await this.searchInProviderForRelations(entry, entry2));
                    } catch (err) { }
                }
            }
        }
        if (!retunWithThis) {
            relations = await listHelper.removeEntrys(relations, this);
        }

        return relations;
    }

    private async searchInProviderForRelations(a: Series, b: Series): Promise<Series> {
        if (a.mediaType === b.mediaType) {
            for (const providerA of a.listProviderInfos) {
                for (let providerB of b.listProviderInfos) {
                    if (providerA.provider === providerB.provider) {
                        providerB = Object.assign(new ListProviderLocalData(), providerB);
                        try {
                            if (providerA.id === providerB.id && providerB.getListProviderInstance().hasUniqueIdForSeasons) {
                                break;
                            } else if (providerA.id === providerB.id && providerA.targetSeason !== providerB.targetSeason) {
                                return a;

                            }
                        } catch (err) { }
                        for (const prequelIdB of providerB.prequelIds) {
                            if (prequelIdB === providerA.id) {
                                return a;
                            }
                        }
                        for (const preqielIdA of providerA.prequelIds) {
                            if (preqielIdA === providerB.id) {
                                return a;
                            }
                        }
                        for (const sequelIdB of providerB.sequelIds) {
                            if (sequelIdB === providerA.id) {
                                return a;
                            }
                        }
                        for (const sequelIdA of providerA.sequelIds) {
                            if (sequelIdA === providerB.id) {
                                return a;
                            }
                        }
                    }
                }
            }
        }
        throw "no relations found in the providers";
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
