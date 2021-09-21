import OAuth from './auth/o-auth'
import ListProvider from './list-provider'

/**
 * List providers with o-auth functions.
 */
export default abstract class OAuthListProvider extends ListProvider {
    public hasOAuthLogin = true
    /**
     * Process Recieved OAUth token.
     */
    protected abstract addOAuthCode(code: string): Promise<OAuth>

    /**
     * Save o auth data
     */
    public abstract setOAuthData(oAuth: OAuth): void

    public abstract getOAuthData(): OAuth

    /**
     * Refresh access_token with the refresh_token
     */
    protected abstract refreshAccessToken(): Promise<OAuth>

    /**
     * OAuth 2.0 Token Auth URL.
     */
    public abstract getTokenAuthUrl(): string

    public async addNewOAuthByCode(code: string) {
        this.informAWebRequest()
        this.setOAuthData(await this.addOAuthCode(code))
    }

    /**
     * get the access_token it will call refreshOAuthToken() when the access token has expired
     * @returns
     */
    public async getAccessToken() {
        if (this.isAccessTokenExpired()) {
            await this.refreshOAuthToken()
        }
        return this.getOAuthData().accessToken
    }

    /**
     * checks if the access_token has expired
     * @returns
     */
    public isAccessTokenExpired(): boolean {
        const currentOAuthData = this.getOAuthData()
        if (currentOAuthData.accessToken) {
            if (currentOAuthData.expire) {
                return new Date(currentOAuthData.expire).getTime() >= Date.now()
            } else {
                return false
            }
        } else {
            throw new Error('[OAuthListProvider] no acces_token available for expired check')
        }
    }

    public async refreshOAuthToken() {
        try {
            this.informAWebRequest()
            this.setOAuthData(await this.refreshAccessToken())
        } catch (err) {
            this.logoutUser()
        }
    }
}
