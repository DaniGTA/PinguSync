import { UserData } from '../../user-data';

export class SimklUserData extends UserData {

    public username = '';
    public accessToken = '';


    public setAccessToken(accessToken: string): void {
        this.accessToken = accessToken;
    }
    protected loadData(): void {
        throw new Error('Method not implemented.');
    }
}
