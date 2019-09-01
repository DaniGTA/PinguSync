import ListProvider from '../list-provider';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import Series from '../../controller/objects/series';
import { KitsuUserData } from './kitsu-user-data';
import Kitsu from 'kitsu'
import { SearchResult } from './objects/searchResult';
import kitsuConverter from './kitsu-converter';
import { GetMediaResult } from './objects/getResult';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import { MediaType } from '../../controller/objects/meta/media-type';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import MultiProviderResult from '../multi-provider-result';
import timeHelper from '../../helpFunctions/time-helper';

export default class KitsuProvider implements ListProvider {
    removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    public version = 1;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SPECIAL];

    providerName: string = 'Kitsu';
    hasOAuthCode: boolean = true;
    hasUniqueIdForSeasons = true;
    userData: KitsuUserData;
    api: Kitsu;
    constructor() {
        this.api = new Kitsu()
        this.userData = new KitsuUserData();
    }

    async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        const endResults: MultiProviderResult[] = [];
        try {
            let searchResults = await this.search(seriesName);
            if (searchResults.data.length === 0) {
                timeHelper.delay(1000);
                searchResults = await this.search(seriesName);
            }
            for (const result of searchResults.data) {
                try {
                    const providerResult = await kitsuConverter.convertMediaToAnime(result);
                    providerResult.fullInfo = false;
                    endResults.push(new MultiProviderResult(providerResult));
                } catch (err) {
                    console.log(err);
                }
            }
        } catch (err) {
            console.log(err);
        }
        
        return endResults;
    }

    private async search(string: string): Promise<SearchResult> {
             return ((await this.api.get('anime', {
                filter: {
                    text: string
                }
            })) as unknown) as SearchResult;

      
    }

    async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult>{
        const getResult = ((await this.api.get('anime/' + provider.id)) as unknown) as GetMediaResult;
        return new MultiProviderResult(await (await kitsuConverter.convertMediaToAnime(getResult.data)));
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
