import Kitsu from 'kitsu';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { ListProviderLocalData } from '../../controller/objects/list-provider-local-data';
import { MediaType } from '../../controller/objects/meta/media-type';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import Series from '../../controller/objects/series';
import timeHelper from '../../helpFunctions/time-helper';
import logger from '../../logger/logger';
import IListProvider from '../list-provider';
import MultiProviderResult from '../multi-provider-result';
import kitsuConverter from './kitsu-converter';
import { KitsuUserData } from './kitsu-user-data';
import { GetMediaResult } from './objects/getResult';
import { ISearchResult } from './objects/searchResult';
export default class KitsuProvider implements IListProvider {

    public static getInstance() {
        if (!KitsuProvider.instance) {
            KitsuProvider.instance = new KitsuProvider();
            // ... any one time initialization goes here ...
        }
        return KitsuProvider.instance;
    }
    private static instance: KitsuProvider;
    public version = 1;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SPECIAL];

    public providerName: string = 'Kitsu';
    public hasOAuthCode: boolean = true;
    public hasUniqueIdForSeasons = true;
    public userData: KitsuUserData;
    public api: Kitsu;
    constructor() {
        this.api = new Kitsu();
        this.userData = new KitsuUserData();
    }
    public removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.');
    }
    public updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.');
    }

    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }

    public async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        const endResults: MultiProviderResult[] = [];
        try {
            let searchResults = await this.search(seriesName);
            if (searchResults.data.length === 0) {
                timeHelper.delay(1000);
                searchResults = await this.search(seriesName);
            }
            for (const result of searchResults.data) {
                try {
                    endResults.push(await kitsuConverter.convertMediaToAnime(result, false));
                } catch (err) {
                    logger.error(err);
                }
            }
        } catch (err) {
            logger.error(err);
        }

        return endResults;
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const getResult = ((this.api.get('anime/' + provider.id + '?include=genres,episodes,streamingLinks')) as unknown) as GetMediaResult;
        return kitsuConverter.convertMediaToAnime(getResult.data);
    }
    public getAllSeries(disableCache?: boolean | undefined): Promise<MultiProviderResult[]> {
        throw new Error('Method not implemented.');
    }
    public logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    public async isUserLoggedIn(): Promise<boolean> {
        return false;
    }
    public getTokenAuthUrl(): string {
        throw new Error('Method not implemented.');
    }

    private async search(s: string): Promise<ISearchResult> {
        return ((this.api.get('anime', {
            filter: {
                text: s,
            },
            include: 'mappings',

        })) as unknown) as ISearchResult;


    }
}
