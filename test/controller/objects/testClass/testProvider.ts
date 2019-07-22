import ListProvider from "../../../../src/backend/api/ListProvider";
import { UserData } from "../../../../src/backend/api/userData";

export default class TestProvider implements ListProvider {

    providerName: string = "";
    hasOAuthCode: boolean = true;
    loggedIn: boolean;
    userData: import("../../../../src/backend/api/userData").UserData = {} as UserData;

    constructor(providerName: string, loggedIn: boolean = true) {
        this.providerName = providerName;
        this.loggedIn = loggedIn;
    }

    getMoreSeriesInfo(a: import("../../../../src/backend/controller/objects/anime").default): Promise<import("../../../../src/backend/controller/objects/anime").default> {
        throw new Error("Method not implemented.");
    }
    getAllSeries(disableCache?: boolean): Promise<import("../../../../src/backend/controller/objects/anime").default[]> {
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
    updateEntry(anime: import("../../../../src/backend/controller/objects/anime").default, watchProgress: import("../../../../src/backend/controller/objects/watchProgress").WatchProgress): Promise<import("../../../../src/backend/controller/objects/providerInfo").ProviderInfo> {
        throw new Error("Method not implemented.");
    }
    removeEntry(anime: import("../../../../src/backend/controller/objects/anime").default, watchProgress: import("../../../../src/backend/controller/objects/watchProgress").WatchProgress): Promise<import("../../../../src/backend/controller/objects/providerInfo").ProviderInfo> {
        throw new Error("Method not implemented.");
    }
}
