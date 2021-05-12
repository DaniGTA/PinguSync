/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import ExternalInformationProvider from '../../../../src/backend/api/provider/external-information-provider';
import ListProvider from '../../../../src/backend/api/provider/list-provider';
import MultiProviderResult from '../../../../src/backend/api/provider/multi-provider-result';
import { UserData } from '../../../../src/backend/api/user-data';
import Episode from '../../../../src/backend/controller/objects/meta/episode/episode';
import { MediaType } from '../../../../src/backend/controller/objects/meta/media-type';
import Series from '../../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import logger from '../../../../src/backend/logger/logger';


export default class TestListProvider3 extends ListProvider {
    public hasOAuthLogin = false;

    public potentialSubProviders: Array<new () => ExternalInformationProvider> = [];
    public supportedOtherProvider: Array<new () => ExternalInformationProvider> = [];

    public version = 1;
    public hasUniqueIdForSeasons = false;
    public hasOAuthCode = true;
    public loggedIn: boolean;
    // tslint:disable-next-line: no-object-literal-type-assertion
    public userData: UserData = {} as UserData;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.SERIES, MediaType.MOVIE, MediaType.SPECIAL, MediaType.UNKOWN];

    constructor(loggedIn = true, hasUniqueIdForSeasons = false) {
        super();
        this.requestRateLimitInMs = 0;
        this.loggedIn = loggedIn;
        this.hasUniqueIdForSeasons = hasUniqueIdForSeasons;
    }
    public getMoreSeriesInfoByName(searchTitle: string, season?: number): Promise<MultiProviderResult[]> {
        throw new Error('Method not implemented.');
    }
    public getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        throw new Error('Method not implemented.');
    }

    public updateEntry(anime: Series, watchProgress: any): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.');
    }
    public removeEntry(anime: Series, watchProgress: any): Promise<ListProviderLocalData> {
        throw new Error('Method not implemented.');
    }
    public async getUrlToSingleEpisode(provider: ProviderLocalData, episode: Episode): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public async markEpisodeAsUnwatched(): Promise<void> {
        logger.debug('Called markEpisodeAsUnwatched');
    }
    public async markEpisodeAsWatched(): Promise<void> {
        logger.debug('Called markEpisodeAsWatched');
    }
    public addOAuthCode(code: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    public logoutUser(): void {
        throw new Error('Method not implemented.');
    }
    public getUsername(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    public getAllLists(): Promise<import('../../../../src/backend/controller/objects/provider-user-list').default[]> {
        throw new Error('Method not implemented.');
    }

    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }
    public getAllSeries(disableCache?: boolean): Promise<MultiProviderResult[]> {
        throw new Error('Method not implemented.');
    }
    public logInUser(pass: string, username?: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    public async isUserLoggedIn(): Promise<boolean> {
        return this.loggedIn;
    }
    public getTokenAuthUrl(): string {
        throw new Error('Method not implemented.');
    }
}
