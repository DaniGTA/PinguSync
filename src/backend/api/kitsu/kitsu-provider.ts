import ListProvider from '../list-provider';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import Series from '../../controller/objects/series';
import { KitsuUserData } from './kitsu-user-data';
import Kitsu from 'kitsu'
import { SearchResult } from './objects/searchResult';
import kitsuConverter from './kitsu-converter';
import { GetMediaResult } from './objects/getResult';
import timeHelper from '../../helpFunctions/time-helper';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import seriesHelper from '../../helpFunctions/series-helper';
export default class KitsuProvider implements ListProvider {
    removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }

    providerName: string = 'Kitsu';
    hasOAuthCode: boolean = true;
    hasUniqueIdForSeasons = true;
    userData: KitsuUserData;
    api: Kitsu;
    constructor() {
        this.api = new Kitsu()
        this.userData = new KitsuUserData();
    }

    async getMoreSeriesInfoByName(_anime: Series, seriesName: string): Promise<Series> {
        var series = Object.assign(new Series(), _anime);
        series.readdFunctions();
        var providerInfos = series.getListProvidersInfos().find(x => x.provider === this.providerName);
        var id = null;
        if (typeof providerInfos != 'undefined') {
            id = providerInfos.id;
        } else {
            const searchResults: SearchResult = ((await this.api.get('anime', {
                filter: {
                    text: seriesName
                }
            })) as unknown) as SearchResult;

            for (const result of searchResults.data) {
                try {
                    var b = await kitsuConverter.convertMediaToAnime(result);
                    if (await seriesHelper.isSameSeries(series, b)) {
                        var providerInfos = b.getListProvidersInfos().find(x => x.provider === this.providerName);
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
            return await (await kitsuConverter.convertMediaToAnime(getResult.data)).merge(series);
        } else {
            throw 'NoMatch in Kitsu';
        }

    }
    getAllSeries(disableCache?: boolean | undefined): Promise<Series[]> {
        throw new Error("Method not implemented.");
    }
    logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async isUserLoggedIn(): Promise<boolean> {
        return false;
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
