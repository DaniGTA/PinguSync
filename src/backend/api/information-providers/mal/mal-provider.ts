
import Mal, { Jikan } from 'node-myanimelist';
import { MediaType } from '../../../controller/objects/meta/media-type';
import WatchProgress from '../../../controller/objects/meta/watch-progress';
import Series from '../../../controller/objects/series';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import logger from '../../../logger/logger';
import ExternalInformationProvider from '../../provider/external-information-provider';
import ListProvider from '../../provider/list-provider';
import MultiProviderResult from '../../provider/multi-provider-result';
import malConverter from './mal-converter';
import { MalUserData } from './mal-user-data';
import Episode from '../../../controller/objects/meta/episode/episode';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import MalConverter from './mal-converter';
export default class MalProvider extends ListProvider {
    public getAllLists(): Promise<import('../../../controller/objects/provider-user-list').default[]> {
        throw new Error('Method not implemented.');
    }
    public getUsername(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    public logoutUser(): void {
        throw new Error('Method not implemented.');
    }
    public async getUrlToSingleEpisode(provider: ProviderLocalData, episode: Episode): Promise<string> {
        return '';
    }
    public static getInstance(): MalProvider {
        if (!MalProvider.instance) {
            MalProvider.instance = new MalProvider();
            // ... any one time initialization goes here ...
        }
        return MalProvider.instance;
    }
    private static instance: MalProvider;
    public version = 1;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SPECIAL];
    public supportedOtherProvider: Array<(new () => ExternalInformationProvider)> = [];
    public potentialSubProviders: Array<(new () => ExternalInformationProvider)> = [];
    public providerName = 'Mal';
    public hasOAuthLogin = false;
    public hasUniqueIdForSeasons = true;
    public userData: MalUserData;
    public requestRateLimitInMs = 4500;

    constructor() {
        super();
        this.userData = new MalUserData();
    }

    public async markEpisodeAsUnwatched(episode: Episode[]): Promise<void> {

    }

    public async markEpisodeAsWatched(episode: Episode[]): Promise<void> {

    }

    public addOAuthCode(): Promise<boolean> {
        throw new Error('OAuth not support by ' + this.providerName);
    }

    public removeEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.');
    }
    public updateEntry(anime: Series, watchProgress: WatchProgress): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.');
    }

    public async isProviderAvailable(): Promise<boolean> {
        return false;
    }

    public async getMoreSeriesInfoByName(seriesName: string): Promise<MultiProviderResult[]> {
        const endResults: MultiProviderResult[] = [];
        try {
            // Only query at 3 or more letters.
            if (seriesName.length >= 3) {
                //const result = await Jikan.search().anime({ q: seriesName });
                //console.log(result);
            }
        } catch (err) {
            logger.error(err);
        }

        return endResults;
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const anime = Jikan.anime(Number(provider.id));
        return MalConverter.convertAnimeToProviderData(anime);
    }

    public async getAllSeries(disableCache?: boolean | undefined): Promise<MultiProviderResult[]> {
        if (this.userData.loginData) {
            const userInfo = await Mal.Scraper.notifications(this.userData.loginData);

        }
        throw new Error('Method not implemented.');
    }
    public async logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        try {
            if (username && pass) {
                const loginData = await Mal.Scraper.login(username, pass);
                this.userData.setLoginData(loginData);
                return this.isUserLoggedIn();
            }
        } catch (err) {
            logger.error(err);
        }
        return false;
    }
    public async isUserLoggedIn(): Promise<boolean> {
        if (this.userData.loginData) {
            return true;
        }
        return false;
    }

    /**
     * The MAL Api dont work with OAuth.
     */
    public getTokenAuthUrl(): string {
        throw new Error('Mal cant provider OAuth functions.');
    }
}
