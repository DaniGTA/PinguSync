import ListProvider from '../listProvider';
import { ProviderInfo } from '../../controller/objects/providerInfo';
import Anime, { WatchStatus } from '../../controller/objects/anime';

import request from 'request';
import Name from '../../../backend/controller/objects/name';
import titleCheckHelper from '../../../backend/helpFunctions/titleCheckHelper';
import { KitsuUserData } from './kitsuUserData';
import Kitsu from 'kitsu'
import { SearchResult } from './objects/searchResult';
import kitsuConverter from './kitsuConverter';
import { GetMediaResult } from './objects/getResult';
import timeHelper from '../../../backend/helpFunctions/timeHelper';
export default class KitsuProvider implements ListProvider {
    updateEntry(anime: Anime, watchProgress: number): Promise<ProviderInfo> {
        throw new Error("Method not implemented.");
    }

    providerName: string = 'Kitsu';
    hasOAuthCode: boolean = true;
    userData: KitsuUserData;
    api: Kitsu;
    constructor() {
        this.api = new Kitsu()
        this.userData = new KitsuUserData();
    }

    async getMoreSeriesInfo(_anime: Anime): Promise<Anime> {
        var anime = Object.assign(new Anime(), _anime);
        anime.readdFunctions();
        var providerInfos = anime.providerInfos.find(x => x.provider === this.providerName);
        var id = null;
        if (typeof providerInfos != 'undefined') {
            id = providerInfos.id;
        } else {
            var text = await anime.names.getRomajiName();
            const searchResults: SearchResult = ((await this.api.get('anime', {
                filter: {
                    text: text
                }
            })) as unknown) as SearchResult;

            for (const result of searchResults.data) {
                try {
                    var b = await kitsuConverter.convertMediaToAnime(result);
                    var validSeason = (await anime.getSeason() === await b.getSeason() || (await anime.getSeason() === 1 && typeof await b.getSeason() === 'undefined'));
                    if (await titleCheckHelper.checkAnimeNames(anime, b) && validSeason) {
                        var providerInfos = b.providerInfos.find(x => x.provider === this.providerName);
                        if (typeof providerInfos != 'undefined') {
                            id = providerInfos.id;
                            break;
                        }
                    }
                } catch (err) { }
            }
        }
        if (id != null) {
            await timeHelper.delay(1500);
            const getResult = ((await this.api.get('anime/' + id)) as unknown) as GetMediaResult;
            return await (await kitsuConverter.convertMediaToAnime(getResult.data)).merge(anime);
        } else {
            throw 'NoMatch in Kitsu';
        }

    }
    getAllSeries(disableCache?: boolean | undefined): Promise<Anime[]> {
        throw new Error("Method not implemented.");
    }
    logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    isUserLoggedIn(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getTokenAuthUrl(): string {
        throw new Error("Method not implemented.");
    }

    public static getInstance() {
        if (!KitsuProvider.instance) {
            KitsuProvider.instance = new KitsuProvider();
            // ... any one time initialization goes here ...
        }
        return KitsuProvider.instance;
    }
    private static instance: KitsuProvider;
}