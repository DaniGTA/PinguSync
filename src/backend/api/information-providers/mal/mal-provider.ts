
import Mal, { Jikan, Scraper } from 'node-myanimelist';
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
import pkceChallenge from "pkce-challenge";
import EpisodeHelper from '../../../helpFunctions/episode-helper/episode-helper';

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
    public pkce = pkceChallenge();
    public malAuth = Mal.Mal.auth();
    public currentAcount: Mal.Mal.MalAcount | null = null;
    constructor() {
        super();
        this.userData = new MalUserData();
        if (this.userData.token) {
            const token = Mal.Mal.MalToken.fromJsonString(this.userData.token);
            this.currentAcount = this.malAuth.loadToken(token);

        }
    }

    public async markEpisodeAsUnwatched(episode: Episode[]): Promise<void> {

    }

    public async markEpisodeAsWatched(episode: Episode[]): Promise<void> {
        if (this.currentAcount) {
            const groupedEpisodes = EpisodeHelper.groupBySeriesIds(episode);
            for (const groupedEpisode of groupedEpisodes) {
                const maxEpNumber = EpisodeHelper.getMaxEpisodeNumberFromArray(groupedEpisode);
                await this.currentAcount.anime.updateMyAnime(groupedEpisode[0].providerId as number, { num_watched_episodes: maxEpNumber, status: 'watching' }).call();
            }
        }

    }

    public async addOAuthCode(code: string): Promise<boolean> {
        try {
            const acount = await this.malAuth.authorizeWithCode(code, this.pkce.code_challenge);
            if (acount) {
                this.userData.setToken(acount.stringifyToken());
                return true;
            }
        } catch (err) {
            logger.warn(err);
            return false;
        }
        return false;
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
                const result = await Jikan.search().anime({ q: seriesName });
                console.log(result);
                for (const searchResult of result.results) {
                    const searchProviderData = MalConverter.convertSearchResultData(searchResult);
                    endResults.push(new MultiProviderResult(searchProviderData));
                }
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
        if (this.currentAcount) {
            const lists = await this.currentAcount.user.animelist().call();
            MalConverter.convertMalListToMultiProviderResult(lists);
        }
        throw new Error('Method not implemented.');
    }
    public async logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        try {
            if (username && pass) {

                const acount = await this.malAuth.Unstable.login(username, pass);
                this.currentAcount = acount;
                this.userData.setToken(acount.stringifyToken());
                return this.isUserLoggedIn();
            }
        } catch (err) {
            logger.error(err);
        }
        return false;
    }
    public async isUserLoggedIn(): Promise<boolean> {
        if (this.userData.token) {
            return true;
        }
        return false;
    }

    /**
     * The MAL Api dont work with OAuth.
     */
    public getTokenAuthUrl(): string {
        return this.malAuth.getOAuthUrl(this.pkce.code_challenge);
    }
}
