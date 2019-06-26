
import { UserData } from "./userData";
import Anime from '../controller/objects/anime';

export default interface ListProvider {
    providerName: string;
    hasOAuthCode: boolean;

    userData: UserData;

    getAllSeries(disableCache?: boolean): Promise<Anime[]>;
    logInUser(pass: string, username?: string): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    getTokenAuthUrl(): string;
}