import { UserData } from '../user-data';

export class SimklUserData extends UserData {

    public username: string = '';
    public accessToken: string = '';


    public setAccessToken(accessToken: string) {
        this.accessToken = accessToken;
    }
    protected loadData(): void {
        throw new Error('Method not implemented.');
    }
}
