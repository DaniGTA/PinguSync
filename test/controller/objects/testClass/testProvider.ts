import ListProvider from "../../../../src/backend/api/ListProvider";
import { UserData } from "../../../../src/backend/api/userData";
import { ListProviderLocalData } from "../../../../src/backend/controller/objects/listProviderLocalData";
import Series from "../../../../src/backend/controller/objects/series";

export default class TestProvider implements ListProvider {
    updateEntry(anime: Series, watchProgress: any): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    removeEntry(anime: Series, watchProgress: any): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }


    providerName: string = "";
    hasOAuthCode: boolean = true;
    loggedIn: boolean;
    userData: UserData = {} as UserData;

    constructor(providerName: string, loggedIn: boolean = true) {
        this.providerName = providerName;
        this.loggedIn = loggedIn;
    }

    getMoreSeriesInfo(a: Series): Promise<Series> {
        throw new Error("Method not implemented.");
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
