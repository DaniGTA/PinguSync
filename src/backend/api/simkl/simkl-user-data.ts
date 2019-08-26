import { UserData } from '../user-data';

export class SimklUserData implements UserData {
    username: string = "";
    accessToken: string = "";


    setAccessToken(accessToken: string) {
        this.accessToken = accessToken;
    }
}
