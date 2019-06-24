import { Anime } from "../controller/objects/anime";
import { UserData } from "./userData";

export interface ListProvider {
    providerName: string;
    hasOAuthCode: boolean;

    userData: UserData;

    getAllSeries(): Promise<Anime[]>;
    logInUser(pass: string, username?: string): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    getTokenAuthUrl(): string;
}