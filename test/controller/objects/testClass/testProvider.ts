
import Series from "../../../../src/backend/controller/objects/series";
import ListProvider from "../../../../src/backend/api/list-provider";
import { ListProviderLocalData } from "../../../../src/backend/controller/objects/list-provider-local-data";
import { UserData } from "../../../../src/backend/api/user-data";
import { MediaType } from '../../../../src/backend/controller/objects/meta/media-type';
import { InfoProviderLocalData } from '../../../../src/backend/controller/objects/info-provider-local-data';
import MultiProviderResult from '../../../../src/backend/api/multi-provider-result';

export default class TestProvider implements ListProvider {
    getMoreSeriesInfoByName(searchTitle: string, season?: number): Promise<MultiProviderResult[]> {
        throw new Error("Method not implemented.");
    }
    getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        throw new Error("Method not implemented.");
    }

    updateEntry(anime: Series, watchProgress: any): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    removeEntry(anime: Series, watchProgress: any): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    version = 1;
    hasUniqueIdForSeasons = false;
    providerName: string = "";
    hasOAuthCode: boolean = true;
    loggedIn: boolean;
    userData: UserData = {} as UserData;
    supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.SERIES, MediaType.MOVIE, MediaType.SPECIAL, MediaType.UNKOWN];

    constructor(providerName: string, loggedIn: boolean = true,hasUniqueIdForSeasons :boolean = false) {
        this.providerName = providerName;
        this.loggedIn = loggedIn;
        this.hasUniqueIdForSeasons = hasUniqueIdForSeasons;
    }
    getAllSeries(disableCache?: boolean): Promise<Series[]> {
        throw new Error("Method not implemented.");
    }
    logInUser(pass: string, username?: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async isUserLoggedIn(): Promise<boolean> {
        return this.loggedIn;
    }
    getTokenAuthUrl(): string {
        throw new Error("Method not implemented.");
    }
}
