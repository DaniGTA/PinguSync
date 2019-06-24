import { ProviderInfo } from './providerInfo';

export default class Anime {
    public id: string = '';
    public names: Names;
    public providerInfos: ProviderInfo[] = [];
    public episodes: number = 0;
    public coverImage: string = '';
    public releaseYear?: number;
    public seasonNumber?: number;
    constructor() {
        this.names = {
            mainName: '',
            romajiName: '',
            engName: '',
            shortName: '',
            otherNames: [],
        };
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

    private mergeNumber(a: number, b: number, name?: string, target?: string): number {
        if (b === a) {
            return b;
        } else if ((b == null || b === 0) && (a != null || a !== 0)) {
            return a;
        } else if ((a == null || a === 0) && (b != null || b !== 0)) {
            return b;
        } else {
            console.log('(' + target + ') Cant find a valid number: ' + a + ' vs ' + b + ' | ' + name);
            return a;
        }
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

interface Names {
    mainName: string;
    romajiName: string;
    engName: string;
    shortName: string;
    otherNames: string[];
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
