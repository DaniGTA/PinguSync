import { ProviderInfo } from './providerInfo';
import stringHelper from '../../../backend/helpFunctions/stringHelper';
import Names from './names';
import Overview from './overview';
import { Provider } from 'electron';
import listHelper from '../../../backend/helpFunctions/listHelper';

export default class Anime {
    public id: string = '';
    public names: Names = new Names();
    public providerInfos: ProviderInfo[] = [];
    public episodes?: number = 0;
    public coverImage: string = '';
    public overviews: Overview[] = [];
    public releaseYear?: number;
    public seasonNumber?: number;
    public runTime?: number;
    constructor() {
        //Generates randome string.
        this.id = stringHelper.randomString(20);
    }

    public async getSeason(): Promise<number | undefined> {
        if (typeof this.seasonNumber != 'undefined') {
            return this.seasonNumber;
        } else {
            return await this.names.getSeasonNumber();
        }
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

    public merge(anime: Anime): Anime {
        const newAnime: Anime = new Anime();
        newAnime.names.engName = this.mergeString(this.names.engName, anime.names.engName, 'EngName');
        newAnime.names.romajiName = this.mergeString(this.names.romajiName, anime.names.romajiName, 'RomajiName');
        newAnime.names.mainName = this.mergeString(this.names.mainName, anime.names.mainName, 'MainName');
        newAnime.names.shortName = this.mergeString(this.names.shortName, anime.names.shortName, 'ShortNmae');
        newAnime.names.otherNames.push(...this.names.otherNames, ...anime.names.otherNames);

        newAnime.episodes = this.mergeNumber(this.episodes, anime.episodes, newAnime.names.mainName, 'Episodes');
        newAnime.releaseYear = this.mergeNumber(this.releaseYear, anime.releaseYear, newAnime.names.mainName, 'ReleaseYear');
        newAnime.seasonNumber = this.mergeNumber(this.seasonNumber, anime.seasonNumber, newAnime.names.mainName, 'SeasonNumber');
        newAnime.runTime = this.mergeNumber(this.runTime, anime.runTime, newAnime.names.mainName, 'RunTime');
        newAnime.coverImage = this.mergeString(anime.coverImage, this.coverImage);
        newAnime.providerInfos = this.mergeProviders(...[...this.providerInfos, ...anime.providerInfos]);
        newAnime.coverImage = this.mergeString(this.names.shortName, anime.names.shortName, 'CoverImage');
        newAnime.overviews.push(...[...this.overviews, ...anime.overviews]);

        return newAnime;
    }

    private mergeProviders(...providers: ProviderInfo[]): ProviderInfo[] {
        const mergedProviderInfos: ProviderInfo[] = []
        for (const provider of providers) {
            var collected: ProviderInfo[] = [];
            for (const provider2 of providers) {
                if (provider2.provider == provider.provider) {
                    collected.push(provider2);
                }
            }
            if (collected.length > 2) {
                var check = mergedProviderInfos.find(x => collected[0].provider === x.provider);
                if (typeof check === 'undefined') {
                    mergedProviderInfos.push(ProviderInfo.mergeProviderInfos(...collected));
                }
            } else {
                mergedProviderInfos.push(provider);
            }
        }
        return mergedProviderInfos;
    }

    private mergeNumber(a: number | undefined, b: number | undefined, name?: string, target?: string): number {
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
    private mergeString(a: string, b: string, topic?: string): string {

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
