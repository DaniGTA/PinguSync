import { UserData } from '../user-data';

export class SimklUserData implements UserData {
    public username: string = '';
    public accessToken: string = '';


    public setAccessToken(accessToken: string) {
        this.accessToken = accessToken;
    }
}
