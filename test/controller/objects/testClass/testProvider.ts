import ListProvider from "../../../../src/backend/api/ListProvider";
import { UserData } from "../../../../src/backend/api/userData";
import Anime from "../../../../src/backend/controller/objects/anime";
import { ListProviderLocalData } from "../../../../src/backend/controller/objects/listProviderLocalData";

export default class TestProvider implements ListProvider {
    updateEntry(anime: Anime, watchProgress: any): Promise<ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    removeEntry(anime: Anime, watchProgress: any): Promise<ListProviderLocalData> {
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

    getMoreSeriesInfo(a: Anime): Promise<Anime> {
        throw new Error("Method not implemented.");
    }
    getAllSeries(disableCache?: boolean): Promise<Anime[]> {
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
