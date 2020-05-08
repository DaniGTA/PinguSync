import ListProvider from '../../../api/provider/list-provider';
import OAuthListener from './o-auth-listener';

export default class OAuthController {
    constructor(private provider: ListProvider) {
    }

    public async isOAuthFlowSuccessfull(): Promise<boolean> {
        const code = await this.getRedirectCode();
        return this.provider.addOAuthCode(code);
    }
    private async getRedirectCode(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                OAuthListener.listen();
                OAuthListener.onCallback((s) => {
                    if (s) {
                        resolve(s);
                    } else {
                        reject();
                    }
                    OAuthListener.stopListen();
                });
            } catch (err) {
                OAuthListener.stopListen();
                reject(err);
            }
        });
    }
}
