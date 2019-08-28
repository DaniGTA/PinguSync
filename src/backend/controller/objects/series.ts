import listHelper from '../../helpFunctions/list-helper';
import seriesHelper from '../../helpFunctions/series-helper';
import stringHelper from '../../helpFunctions/string-helper';
import ProviderLocalData from '../interfaces/provider-local-data';
import Cover from './meta/cover';
import { ImageSize } from './meta/image-size';
import { MediaType } from './meta/media-type';
import Name from './meta/name';
import Overview from './meta/overview';
import WatchProgress from './meta/watch-progress';
import SeriesProviderExtension from './extension/series-provider-extension';
import { ListProviderLocalData } from './list-provider-local-data';
import { InfoProviderLocalData } from './info-provider-local-data';
import ListController from '../list-controller';

export default class Series extends SeriesProviderExtension {
    public static version = 1;

    public packageId: string = '';
    public id: string = '';
    public lastUpdate: number = Date.now();
    public lastInfoUpdate: number = 0;

    private cachedSeason?: number;
    private seasonDetectionType: string = "";
    private canSync: boolean | null = null;
    constructor() {
        super();
        // Generates randome string.
        this.id = stringHelper.randomString(30);
    }

    async resetCache() {
        this.cachedSeason = undefined;
        this.seasonDetectionType = "";
    }

    async getAllNames(): Promise<Name[]> {
        const names = [];
        for (const provider of await this.getAllProviderLocalDatas()) {
            names.push(...provider.getAllNames());
        }
        return await listHelper.getUniqueNameList(names);
    }

    async getAllOverviews(): Promise<Overview[]> {
        const overviews = [];
        for (const provider of await this.getAllProviderLocalDatas()) {
            overviews.push(...provider.getAllOverviews());
        }
        return await listHelper.getUniqueOverviewList(overviews);
    }

    addProviderDatas(...localdatas: ProviderLocalData[]) {
        for (const localdata of localdatas) {
            if (typeof localdata === typeof ListProviderLocalData) {
                this.addListProvider(localdata as ListProviderLocalData)
            } else if (typeof localdata === typeof InfoProviderLocalData) {
                this.addInfoProvider(localdata as InfoProviderLocalData);
            }
        }
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
        let ressources: ProviderLocalData[] = [...this.getListProvidersInfos(), ...this.getInfoProvidersInfos()];
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
     * It get the max number of that anime.
     */
    public getMaxEpisode(): number {
        const array = (this.getListProvidersInfos().flatMap(x => x.episodes) as number[]);
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
            result = await listHelper.cleanArray(this.getListProvidersInfos().flatMap(x => x.episodes))
        } catch (e) { }
        if (result){
            return await listHelper.getUniqueList(result as number[]);
        }
        throw 'no episode found';
    }

    /**
     * Returns the Season of the Anime based on Season entry or name.
     * @hasTest
     */
    public async getSeason(searchInList?: Series[]): Promise<number | undefined> {
        if (!this.cachedSeason) {
            const result = await seriesHelper.searchSeasonValue(this, searchInList);
            if (result.season === -2) {
                // UKNOWN SEASON
                return undefined;
            } else {
                this.cachedSeason = result.season;
                this.seasonDetectionType = result.foundType;
            }
        }
        if (this.cachedSeason == -1) {
            return undefined;
        }
        return this.cachedSeason;
    }

    public async getPrequel(searchInList: Series[]): Promise<Series> {
        try {
            for (const listProvider of this.getListProvidersInfos()) {
                if (listProvider.prequelIds) {
                    for (const entry of searchInList) {
                        for (const entryListProvider of entry.getListProvidersInfos()) {
                            if (entryListProvider.provider === listProvider.provider && listProvider.prequelIds.findIndex(x => entryListProvider.id == x) !== -1) {
                                return entry;
                            }
                        }
                    }
                }
            }
        } catch (err) {
        }
        throw 'no prequel found';
    }

    public async getSequel(searchInList: Series[]): Promise<Series> {
        try {
            for (const listProvider of this.getListProvidersInfos()) {
                if (listProvider.sequelIds) {
                    for (const entry of searchInList) {

                        for (const entryListProvider of entry.getListProvidersInfos()) {
                            if (entryListProvider.provider === listProvider.provider && listProvider.sequelIds.findIndex(x => entryListProvider.id === x) !== -1) {
                                return entry;
                            }
                        }

                    }
                }
            }
        } catch (err) {
        }
        throw 'no sequel found';
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
        if (!await latestUpdatedProvider.getProviderInstance().isUserLoggedIn()) {
            latestUpdatedProvider.lastUpdate = new Date(0);
            for (let provider of this.listProviderInfos) {
                provider = Object.assign(new ListProviderLocalData(), provider);
                if (provider != latestUpdatedProvider) {
                    if (new Date(provider.lastUpdate) > latestUpdatedProvider.lastUpdate && provider.getProviderInstance().isUserLoggedIn()) {
                        latestUpdatedProvider = provider;
                    }
                }
            }
        }

        for (let provider of this.listProviderInfos) {
            provider = Object.assign(new ListProviderLocalData(), provider);
            if (latestUpdatedProvider.provider != provider.provider && await provider.getProviderInstance().isUserLoggedIn()) {
                const watchProgress = provider.getHighestWatchedEpisode();
                const latestWatchProgress = latestUpdatedProvider.getHighestWatchedEpisode();
                if (latestUpdatedProvider.watchProgress && latestWatchProgress && provider.episodes) {
                    if (!watchProgress) {
                        return true;
                    }
                    // If the watchprogress has a difference and if the provider has a max defined episode.
                    // Without the episodes we dont know if we can sync or not.
                    if (latestWatchProgress.episode != watchProgress.episode) {
                        if (!latestUpdatedProvider.episodes|| latestWatchProgress.episode < latestUpdatedProvider.episodes) {
                            try {
                                if (!watchProgress) {
                                    return true;
                                } else if (this.getMaxEpisode() < watchProgress.episode) {
                                    return false;
                                } else {
                                    provider.canUpdateWatchProgress = true;
                                    return true;
                                }
                            } catch (err) {
                                return false;
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
        if (typeof this.getListProvidersInfos() != 'undefined') {
            for (const provider of this.getListProvidersInfos()) {
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
        var providersCache: ListProviderLocalData[] = [];
        for (const provider of this.getListProvidersInfos()) {
            providersCache.push(Object.assign(new ListProviderLocalData(), provider));
        }
        var infoPovidersCache: InfoProviderLocalData[] = [];
        for (const provider of this.getInfoProvidersInfos()) {
            infoPovidersCache.push(Object.assign(new InfoProviderLocalData(), provider));
        }
        this.infoProviderInfos = infoPovidersCache;
        this.listProviderInfos = providersCache;
    }

    /**
     * Merge two animes to one object.
     * Will be often used too update watchprogress.
     * @param anime 
     */
    public async merge(anime: Series): Promise<Series> {
        const newAnime: Series = new Series();

        newAnime.listProviderInfos = await this.mergeProviders(...[...this.listProviderInfos, ...anime.listProviderInfos]) as ListProviderLocalData[];
        newAnime.infoProviderInfos = await this.mergeProviders(...[...this.infoProviderInfos, ...anime.infoProviderInfos]) as InfoProviderLocalData[];

        await newAnime.getSeason();

        await newAnime.getCanSync();

        if (this.lastInfoUpdate < anime.lastInfoUpdate) {
            newAnime.lastInfoUpdate = anime.lastInfoUpdate;
        } else {
            newAnime.lastInfoUpdate = this.lastInfoUpdate;
        }

        if ((await newAnime.getAllNames()).length > 25) {
            console.log(".");
        }
        return newAnime;
    }

    private async mergeProviders(...providers: ProviderLocalData[]): Promise<ProviderLocalData[]> {
        let mergedProviderInfos: ProviderLocalData[] = []
        for (const provider of providers) {
            var check = mergedProviderInfos.find(x => provider.provider === x.provider);
            if (!check) {
                var collected: ProviderLocalData[] = [];
                for (const provider2 of providers) {
                    if (provider2.provider == provider.provider) {
                        collected.push(provider2);
                        continue;
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

    async getFirstSeason(list?: Series[]): Promise<Series> {
        if (await this.getSeason() === 1) {
            return this;
        }
        if (!list) {
            list = await new ListController().getMainList();
        }
        const allRelations = await this.getAllRelations(list);
        for (const relation of allRelations) {
            if (await relation.getSeason() === 1) {
                return relation;
            }
        }
        throw 'no first season found';
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

    async isAnySequelPresent(): Promise<boolean> {
        for (const listprovider of this.getListProvidersInfos()) {
            if (listprovider.sequelIds.length != 0) {
                return true;
            }
        }
        for (const infoprovider of this.getInfoProvidersInfos()) {
            if (infoprovider.sequelIds.length != 0) {
                return true;
            }
        }
        return false;
    }

    async isAnyPrequelPresent(): Promise<boolean> {
        for (const listprovider of this.getListProvidersInfos()) {
            if (listprovider.prequelIds.length != 0) {
                return true;
            }
        }
        for (const infoprovider of this.getInfoProvidersInfos()) {
            if (infoprovider.prequelIds.length != 0) {
                return true;
            }
        }
        return false;
    }

    private async searchInProviderForRelations(a: Series, b: Series): Promise<Series> {
        if (await a.getMediaType() === await b.getMediaType()) {
            for (const providerA of a.listProviderInfos) {
                for (let providerB of b.listProviderInfos) {
                    if (providerA.provider === providerB.provider) {
                        providerB = Object.assign(new ListProviderLocalData(), providerB);
                        try {
                            if (providerA.id === providerB.id && providerB.getProviderInstance().hasUniqueIdForSeasons) {
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

    async getAllProviderLocalDatas(): Promise<ProviderLocalData[]> {
        const localdata = [];
        localdata.push(...this.getInfoProvidersInfos());
        localdata.push(...this.getListProvidersInfos());
        return localdata;
    }

    async getMediaType(): Promise<MediaType> {
        const collectedMediaTypes: MediaType[] = [];
        for (const localdata of await this.getAllProviderLocalDatas()) {
            if (localdata.mediaType != MediaType.UNKOWN) {
                collectedMediaTypes.push(localdata.mediaType);
            }
        }
        if (collectedMediaTypes.length === 0) {
            return MediaType.UNKOWN;
        } else {
            const result = await listHelper.findMostFrequent(collectedMediaTypes);
            if (result) {
                return result;
            }
        }
        return MediaType.UNKOWN;
    }

    async getReleaseYear(): Promise<number|undefined> {
        const collectedMediaTypes: number[] = [];
        for (const localdata of await this.getAllProviderLocalDatas()) {
            if (localdata.releaseYear) {
                collectedMediaTypes.push(localdata.releaseYear);
            }
        }
        if (collectedMediaTypes.length === 0) {
            return;
        } else {
            const result = await listHelper.findMostFrequent(collectedMediaTypes);
            if (result) {
                return result;
            }
        }
        return;
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
