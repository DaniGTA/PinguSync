import ExternalInformationProvider from '../../../../src/backend/api/provider/external-information-provider';
import ExternalProvider from '../../../../src/backend/api/provider/external-provider';
import InfoProvider from '../../../../src/backend/api/provider/info-provider';
import MultiProviderResult from '../../../../src/backend/api/provider/multi-provider-result';
import { UserData } from '../../../../src/backend/api/user-data';
import { MediaType } from '../../../../src/backend/controller/objects/meta/media-type';
import Series from '../../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';


export default class TestInfoProvider extends InfoProvider {
    public isOffline: boolean = false;
    public potentialSubProviders: Array<new () => ExternalInformationProvider> = [];
    public supportedOtherProvider: Array<new () => ExternalInformationProvider> = [];

    public version = 1;
    public hasUniqueIdForSeasons = false;
    public providerName: string = '';
    public hasOAuthCode: boolean = true;
    public loggedIn: boolean;
    // tslint:disable-next-line: no-object-literal-type-assertion
    public userData: UserData = {} as UserData;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.SERIES, MediaType.MOVIE, MediaType.SPECIAL, MediaType.UNKOWN];

    constructor(providerName: string, loggedIn: boolean = true, hasUniqueIdForSeasons: boolean = false) {
        super();
        this.providerName = providerName;
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
