
import Kitsu from 'kitsu';
import { MediaType } from '../../controller/objects/meta/media-type';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import Series from '../../controller/objects/series';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import timeHelper from '../../helpFunctions/time-helper';
import logger from '../../logger/logger';
import AniDBProvider from '../anidb/anidb-provider';
import AniListProvider from '../anilist/anilist-provider';
import MalProvider from '../mal/mal-provider';
import ExternalProvider from '../provider/external-provider';
import ListProvider from '../provider/list-provider';
import MultiProviderResult from '../provider/multi-provider-result';
import TraktProvider from '../trakt/trakt-provider';
import kitsuConverter from './kitsu-converter';
import { KitsuUserData } from './kitsu-user-data';
import { GetMediaResult } from './objects/getResult';
import { ISearchResult } from './objects/searchResult';
import { ProviderInfoStatus } from '../../controller/provider-manager/local-data/interfaces/provider-info-status';
export default class KitsuProvider extends ListProvider {

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
    public supportedOtherProvider: Array<(new () => ExternalProvider)> = [];
    public potentialSubProviders: Array<(new () => ExternalProvider)> = [MalProvider, TraktProvider, AniDBProvider, AniListProvider];
    public providerName: string = 'Kitsu';
    public hasOAuthCode: boolean = true;
    public hasUniqueIdForSeasons = true;
    public userData: KitsuUserData;
    public api: Kitsu;
    constructor() {
        super();
        this.api = new Kitsu();
        if (KitsuProvider.instance) {
            this.userData = KitsuProvider.instance.userData;
        } else {
            this.userData = new KitsuUserData();
        }
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
                    endResults.push(await kitsuConverter.convertMediaToAnime(result, ProviderInfoStatus.BASIC_INFO));
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
        if (provider.provider === this.providerName) {
            const getResult = ((this.api.get('anime/' + provider.id + '?include=genres,episodes,streamingLinks')) as unknown) as GetMediaResult;
            return kitsuConverter.convertMediaToAnime(getResult.data);
        }
        throw new Error('[Kitsu] Cant handle this provider id');
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
