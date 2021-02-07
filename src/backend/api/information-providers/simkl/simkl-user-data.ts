import { UserData } from '../../user-data';

export class SimklUserData extends UserData {
    protected configFileName = 'simkl_config.json';

    public setAccessToken(accessToken: string): void {
        this.accessToken = accessToken;
    }
}
