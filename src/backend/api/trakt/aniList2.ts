import ListProvider from '../ListProvider';
import { AniListUserData } from '../anilist/aniListUserData';

export default class AniList2Provider implements ListProvider {
    getMoreSeriesInfo(a: import("../../controller/objects/series").default): Promise<import("../../controller/objects/series").default> {
        throw new Error("Method not implemented.");
    }
    getAllSeries(disableCache?: boolean | undefined): Promise<import("../../controller/objects/series").default[]> {
        throw new Error("Method not implemented.");
    }
    logInUser(pass: string, username?: string | undefined): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    isUserLoggedIn(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getTokenAuthUrl(): string {
        throw new Error("Method not implemented.");
    }
    updateEntry(anime: import("../../controller/objects/series").default, watchProgress: import("../../controller/objects/watchProgress").default): Promise<import("../../controller/objects/listProviderLocalData").ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    removeEntry(anime: import("../../controller/objects/series").default, watchProgress: import("../../controller/objects/watchProgress").default): Promise<import("../../controller/objects/listProviderLocalData").ListProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    providerName: string = "AniList";
    hasOAuthCode = true;
    private static instance: AniList2Provider;
    userData: AniListUserData;
    private clientSecret = '5cxBi0XuQvDJHlpM5FaQqwF80bTIELuqd9MtMdZm';
    private clientId = '389';
    private redirectUri = 'https://anilist.co/api/v2/oauth/pin';

    constructor() {
        this.userData = new AniListUserData();
        AniList2Provider.instance = this;
    }

    static getInstance() {
        if (!AniList2Provider.instance) {
            AniList2Provider.instance = new AniList2Provider();
            // ... any one time initialization goes here ...
        }
        return AniList2Provider.instance;
    }

}
