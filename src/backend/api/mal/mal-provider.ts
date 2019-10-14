
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../controller/provider-manager/local-data/list-provider-local-data';
import { MediaType } from '../../controller/objects/meta/media-type';
import WatchProgress from '../../controller/objects/meta/watch-progress';
import Series from '../../controller/objects/series';
import logger from '../../logger/logger';
import IListProvider from '../provider/list-provider';
import MultiProviderResult from '../provider/multi-provider-result';
import { MalUserData } from './mal-user-data';
import Mal, { ScraperClient } from 'node-myanimelist';
import malConverter from './mal-converter';
export default class MalProvider implements IListProvider {

    public static getInstance() {
        if (!MalProvider.instance) {
            MalProvider.instance = new MalProvider();
            // ... any one time initialization goes here ...
        }
        return MalProvider.instance;
    }
    private static instance: MalProvider;
    public version = 1;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SPECIAL];

    public providerName: string = 'Mal';
    public hasOAuthCode: boolean = false;
    public hasUniqueIdForSeasons = true;
    public userData: MalUserData;
    private api = new ScraperClient();

    constructor() {
        this.userData = new MalUserData();
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
            // Only query at 3 or more letters.
            const result = await Mal.search().anime({ q: seriesName });
            result.data;
        } catch (err) {
            logger.error(err);
        }

        return endResults;
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const anime = Mal.anime(Number(provider.id));
        const v = await anime.videos();
        const cs = await anime.charactersStaff();
        const e = await anime.episodes();
        const i = await anime.info();
        const mi = await anime.moreInfo();
        const p = await anime.pictures();
        const r = await anime.reviews();
        return malConverter.convertAnimeToProviderData(anime);

    }
    public async getAllSeries(disableCache?: boolean | undefined): Promise<MultiProviderResult[]> {
        if (this.userData.loginData) {
            const userInfo = await this.api.notifications(this.userData.loginData);

        }
        throw new Error('Method not implemented.');
    }
    public async logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        try {
            if (username && pass) {
                const loginData = await this.api.login(username, pass);
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
