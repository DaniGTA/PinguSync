import OAuthListProvider from '@/backend/api/provider/o-auth-list-provider'
import logger from '@/backend/logger/logger'
import OAuthListener from './o-auth-listener'

export default class OAuthController {
    constructor(private provider: OAuthListProvider) {}

    public async isOAuthFlowSuccessfull(): Promise<boolean> {
        const code = await this.getRedirectCode()
        try {
            await this.provider.addNewOAuthByCode(code)
            return true
        } catch (err) {
            logger.error(err)
            return false
        }
    }
    private async getRedirectCode(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                OAuthListener.listen()
                OAuthListener.onCallback(s => {
                    if (s) {
                        resolve(s)
                    } else {
                        reject()
                    }
                    OAuthListener.stopListen()
                })
            } catch (err) {
                OAuthListener.stopListen()
                reject(err as string)
            }
        })
    }
}
