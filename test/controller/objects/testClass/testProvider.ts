
import Series from "../../../../src/backend/controller/objects/series";
import ListProvider from "../../../../src/backend/api/list-provider";
import { ListProviderLocalData } from "../../../../src/backend/controller/objects/list-provider-local-data";
import { UserData } from "../../../../src/backend/api/user-data";

export default class TestProvider implements ListProvider {
    getMoreSeriesInfoByName(series: Series, searchTitle: string): Promise<Series> {
        throw new Error("Method not implemented.");
    }
    updateEntry(anime: Series, watchProgress: any): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    removeEntry(anime: Series, watchProgress: any): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }

    hasUniqueIdForSeasons = false;
    providerName: string = "";
    hasOAuthCode: boolean = true;
    loggedIn: boolean;
    userData: UserData = {} as UserData;

    constructor(providerName: string, loggedIn: boolean = true) {
        this.providerName = providerName;
        this.loggedIn = loggedIn;
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
