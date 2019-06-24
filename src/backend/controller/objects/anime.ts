import { ProviderInfo } from './providerInfo';
import stringHelper from '@/backend/helpFunctions/stringHelper';
import listHelper from '@/backend/helpFunctions/listHelper';

export default class Anime {
    public id: string = '';
    public names: Names = new Names();
    public providerInfos: ProviderInfo[] = [];
    public episodes: number = 0;
    public coverImage: string = '';
    public releaseYear?: number;
    public seasonNumber?: number;
    constructor() {
        //Generates randome string.
        const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        this.id = Array.from({ length: 20 }, _ => c[Math.floor(Math.random() * c.length)]).join('');
    }

    public merge(anime: Anime): Anime {
        const newAnime: Anime = new Anime();
        newAnime.names.engName = this.mergeString(this.names.engName, anime.names.engName, 'EngName');
        newAnime.names.romajiName = this.mergeString(this.names.romajiName, anime.names.romajiName, 'RomajiName');
        newAnime.names.mainName = this.mergeString(this.names.mainName, anime.names.mainName, 'MainName');
        newAnime.names.shortName = this.mergeString(this.names.shortName, anime.names.shortName, 'ShortNmae');
        newAnime.names.otherNames.push(...this.names.otherNames, ...anime.names.otherNames, 'OtherNames');

        newAnime.episodes = this.mergeNumber(this.episodes, anime.episodes, newAnime.names.mainName, 'Episodes');
        newAnime.releaseYear = this.mergeNumber(this.releaseYear, anime.releaseYear, newAnime.names.mainName, 'ReleaseYear');
        newAnime.seasonNumber = this.mergeNumber(this.releaseYear, anime.releaseYear, newAnime.names.mainName, 'SeasonNumber');
        newAnime.coverImage = this.mergeString(anime.coverImage, this.coverImage);
        newAnime.providerInfos.push(...anime.providerInfos, ...this.providerInfos);

        return newAnime;
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

export class Names {
    mainName: string = '';
    romajiName: string = '';
    engName: string = '';
    shortName: string = '';
    otherNames: string[] = [];

    getRomajiName(names: Names): string {
        if (names.mainName == null || names.mainName === '' || this.hasKanji(names.mainName)) {
            if (names.engName != null && names.engName !== '') {
                return names.engName;
            } else if (names.romajiName != null && names.romajiName !== '') {
                return names.romajiName;
            } else if (names.shortName != null && names.shortName !== '') {
                return names.shortName;
            }
            for (const otherName of names.otherNames) {
                if (otherName != null && otherName !== '') {
                    if (!otherName.match('[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]{1,}')) {
                        return otherName;
                    }
                }
            }
        } else {
            if (names.mainName != null && names.mainName !== '') {
                return names.mainName;
            }
        }
        console.log('[search] -> Names -> getRomaji -> ' + names.mainName + ' -> noResults');
        throw names.mainName + 'HasNoRomajiName';
    }
    public async getSeasonNumber(): Promise<number> {
        var highestSeasonDetected = 0;
        for (const name of await this.getAllNames()) {
            try {
                var nr = await this.getSeasonNumberFromTitle(name);
                if (nr < highestSeasonDetected) {
                    highestSeasonDetected = nr;
                }
            } catch (err) { }
        }
        return highestSeasonDetected;
    }

    public async getAllNames(): Promise<string[]> {
        return await listHelper.cleanArray([this.engName, this.mainName, this.romajiName, this.shortName, ...this.otherNames]);
    }

    private async getSeasonNumberFromTitle(title: string): Promise<number> {
        var reversedTitle = await stringHelper.reverseString(title);
        var lastChar = reversedTitle.charAt(0);
        var countLastChar = 0;
        if ('0123456789'.includes(reversedTitle)) {
            return parseInt(lastChar, 10);
        } else {
            while (lastChar === reversedTitle.charAt(countLastChar)) {
                countLastChar++;
                reversedTitle = reversedTitle.substr(1);
            }
        }
        if (countLastChar != 1) {
            return countLastChar;
        } else {
            throw 'That name dont have a Season';
        }
    }

    private hasKanji(s: string): boolean {
        return s.match('[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]{1,}') != null;
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
