import { UserData } from '../../user-data'

export class SimklUserData extends UserData {
    public setAccessToken(accessToken: string): void {
        this.accessToken = accessToken
    }
}
