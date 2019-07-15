import { ProviderInfo } from './providerInfo';
import stringHelper from '../../../backend/helpFunctions/stringHelper';
import Names from './names';
import Overview from './overview';
import listHelper from '../../../backend/helpFunctions/listHelper';

export default class Anime {
    public id: string = '';
    public lastUpdate: number = Date.now();
    public names: Names = new Names();
    public providerInfos: ProviderInfo[] = [];
    public episodes?: number = 0;
    public coverImage: string = '';
    public overviews: Overview[] = [];
    public releaseYear?: number;
    public seasonNumber?: number;
    public runTime?: number;
    public canSync: boolean = false;
    constructor() {
        //Generates randome string.
        this.id = stringHelper.randomString(20);
    }
    /**
     * For tests
     */
    internalTests() {
        return {
            getCanSyncStatus: this.getCanSyncStatus,
            getLastUpdatedProvider: this.getLastUpdatedProvider,
            mergeProviders: this.mergeProviders,
            mergeNumber: this.mergeNumber,
            isDefined: this.isDefined,
            mergeString: this.mergeString
        }
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
     */
    public async getCanSyncStatus(): Promise<boolean> {
        let latestUpdatedProvider: ProviderInfo | null = await this.getLastUpdatedProvider();

        if (latestUpdatedProvider === null) {
            throw 'no provider with valid sync status'
        }
        for (const provider of this.providerInfos) {
            if (latestUpdatedProvider.provider != provider.provider && provider.getProviderInstance().userData.username != '') {
                if (latestUpdatedProvider.watchProgress != provider.watchProgress) {
                    if (typeof provider.watchProgress === 'undefined') {
                        this.canSync = true;
                        return true;
                    } else if (typeof this.episodes != 'undefined' && this.episodes < provider.watchProgress) {
                        this.canSync = false;
                        return false;
                    } else {
                        provider.canUpdateWatchProgress = true;
                        this.canSync = true;
                        return true;
                    }
                }
            }
        }
        this.canSync = false;
        return false;
    }

    /**
     * @return the last updated provider with watchProgress !
     */
    private async getLastUpdatedProvider(): Promise<ProviderInfo | null> {
        let latestUpdatedProvider: ProviderInfo | null = null;
        for (const provider of this.providerInfos) {
            if (typeof provider.watchProgress != 'undefined') {
                if (latestUpdatedProvider === null) {
                    latestUpdatedProvider = provider;
                } else if (new Date(latestUpdatedProvider.lastExternalChange).getTime() < new Date(provider.lastExternalChange).getTime()) {
                    latestUpdatedProvider = provider;
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
        var providersCache: ProviderInfo[] = [];
        for (const provider of this.providerInfos) {
            providersCache.push(Object.assign(new ProviderInfo(), provider));
        }
        this.providerInfos = providersCache;
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

        newAnime.episodes = await listHelper.findMostFrequent(await listHelper.cleanArray(this.providerInfos.flatMap(x => x.episodes)));
        let seasonarr = await listHelper.cleanArray([this.seasonNumber, anime.seasonNumber]);
        if (typeof seasonarr !== 'undefined') {
            newAnime.seasonNumber = await listHelper.findMostFrequent(seasonarr);
        }

        newAnime.releaseYear = await this.mergeNumber(this.releaseYear, anime.releaseYear, newAnime.names.mainName, 'ReleaseYear');

        newAnime.runTime = await this.mergeNumber(this.runTime, anime.runTime, newAnime.names.mainName, 'RunTime');
        newAnime.coverImage = await this.mergeString(anime.coverImage, this.coverImage);
        newAnime.providerInfos = await this.mergeProviders(...[...this.providerInfos, ...anime.providerInfos]);
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
        try {
            newAnime.canSync = await this.getCanSyncStatus();
        } catch (err) {
            console.log(err);
        }
        return newAnime;
    }

    private async mergeProviders(...providers: ProviderInfo[]): Promise<ProviderInfo[]> {
        const mergedProviderInfos: ProviderInfo[] = []
        for (const provider of providers) {
            var check = mergedProviderInfos.find(x => provider.provider === x.provider);
            if (typeof check === 'undefined') {
                var collected: ProviderInfo[] = [];
                for (const provider2 of providers) {
                    if (provider2.provider == provider.provider) {
                        collected.push(provider2);
                    }
                }
                if (collected.length >= 2) {
                    mergedProviderInfos.push(await ProviderInfo.mergeProviderInfos(...collected));
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

    public async getLastWatchProgress(): Promise<number> {
        let latestUpdatedProvider = await this.getLastUpdatedProvider()
        if (latestUpdatedProvider === null) {
            throw 'no provider with valid sync status'
        }
        if (typeof latestUpdatedProvider.watchProgress != 'undefined') {
            return latestUpdatedProvider.watchProgress;
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
