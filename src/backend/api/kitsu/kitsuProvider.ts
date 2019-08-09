import ListProvider from '../listProvider';
import { ListProviderLocalData } from '../../controller/objects/listProviderLocalData';
import Series from '../../controller/objects/series';
import titleCheckHelper from '../../../backend/helpFunctions/titleCheckHelper';
import { KitsuUserData } from './kitsuUserData';
import Kitsu from 'kitsu'
import { SearchResult } from './objects/searchResult';
import kitsuConverter from './kitsuConverter';
import { GetMediaResult } from './objects/getResult';
import timeHelper from '../../../backend/helpFunctions/timeHelper';
import WatchProgress from '../../controller/objects/meta/watchProgress';
import Name from '../../controller/objects/meta/name';
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

    async getMoreSeriesInfo(_anime: Series): Promise<Series> {
        console.log('[Kitsu] Start API Request');
        var series = Object.assign(new Series(), _anime);
        series.readdFunctions();
        var providerInfos = series.listProviderInfos.find(x => x.provider === this.providerName);
        var id = null;
        if (typeof providerInfos != 'undefined') {
            id = providerInfos.id;
        } else {
            const names = await series.getAllNames();
            let name = names[0].name;
            try {
                name = await Name.getRomajiName(names);
            } catch (err) { }
            const searchResults: SearchResult = ((await this.api.get('anime', {
                filter: {
                    text: name
                }
            })) as unknown) as SearchResult;

            for (const result of searchResults.data) {
                try {
                    var b = await kitsuConverter.convertMediaToAnime(result);
                    var validSeason = (await series.getSeason() === await b.getSeason() || (await series.getSeason() === 1 && typeof await b.getSeason() === 'undefined'));
                    if (await titleCheckHelper.checkSeriesNames(series, b) && validSeason) {
                        var providerInfos = b.listProviderInfos.find(x => x.provider === this.providerName);
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
            console.log('[Kitsu] API Request SUCCESS');
            return await (await kitsuConverter.convertMediaToAnime(getResult.data)).merge(series);
        } else {
            console.log('[Kitsu] API Request SUCCESS but no results');
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
