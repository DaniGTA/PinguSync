import { UserData } from '../user-data';

export class SimklUserData extends UserData {
    protected loadData(): void {
        throw new Error("Method not implemented.");
    }
    
    public username: string = '';
    public accessToken: string = '';


    public setAccessToken(accessToken: string) {
        this.accessToken = accessToken;
    }
}
