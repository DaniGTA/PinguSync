import ICommunication from '../../../communication/icommunication';
import IPCBackgroundController from '../../../communication/ipc-background-controller';
import OAuthController from '../../auth/o-auth-controller/o-auth-controller';
import ListProvider from '../../../api/provider/list-provider';
import ProviderList from '../../provider-controller/provider-manager/provider-list';
import { shell } from 'electron';
import FrontendDefaultLogin from './model/frontend-default-login';
import UpdateProviderLoginStatus from './model/update-provider-login-status';
import { chSend } from '../../../communication/send-only-channels';
import { chOnce } from '../../../communication/channels';
import { chListener } from '../../../communication/listener-channels';
import logger from '../../../logger/logger';

export default class FrontendProviderAuthController {
    /**
     * Communication instance to the frontend.
     * @private
     * @type {ICommunication}
     * @memberof FrontendProviderAuthController
     */
    private com: ICommunication;

    /**
     *Creates an instance of FrontendProviderAuthController.
     * @param {Electron.WebContents} webcontents  
     * @memberof FrontendProviderAuthController
     */
    constructor(webcontents: Electron.WebContents) {
        this.com = new IPCBackgroundController(webcontents);
        this.init();
    }

    private init(): void {
        this.com.on('oauth-login-provider', (providerName) => this.oAuthLogin(providerName));
        this.com.on('default-login-provider', (data) => this.defaultLogin(data));
        this.com.on(chSend.LogoutUser, (providerName) => this.logoutProvider(providerName));
        this.com.on(chOnce.IsAnyProviderLoggedIn, async () => this.com.send(chOnce.IsAnyProviderLoggedIn, await this.isAnyProviderLoggedIn()));
        this.com.on(chOnce.GetLoggedInStatus, async (providerName) => this.com.send(chOnce.GetLoggedInStatus, await this.isUserLoggedIn(providerName)));
    }

    private logoutProvider(providerName: string): void {
        const provider = ProviderList.getProviderInstanceByProviderName(providerName);
        if (provider instanceof ListProvider) {
            try {
                provider.logoutUser();
            } catch (err) {
                logger.error(err);
            }
            this.sendLoginStatus(provider);
        }
    }

    private async isAnyProviderLoggedIn(): Promise<boolean> {
        const allListProviders = ProviderList.getListProviderList();
        for (const listProvider of allListProviders) {
            try {
                if (await listProvider.isUserLoggedIn()) {
                    return true;
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return false;
    }

    private async isUserLoggedIn(providerName: string): Promise<boolean> {
        const provider = ProviderList.getProviderInstanceByProviderName(providerName);
        if (provider instanceof ListProvider) {
            try {
                return provider.isUserLoggedIn();
            } catch (err) {
                logger.error(err);
            }
        }
        return false;
    }

    private async oAuthLogin(providerName: string): Promise<void> {
        const provider = ProviderList.getProviderInstanceByProviderName(providerName);
        if (provider instanceof ListProvider && provider.hasOAuthLogin) {
            shell.openExternal(provider.getTokenAuthUrl());
            await new OAuthController(provider).isOAuthFlowSuccessfull();
            this.sendLoginStatus(provider);
        }
    }

    private async defaultLogin(defaultLoginData: FrontendDefaultLogin): Promise<void> {
        const provider = ProviderList.getProviderInstanceByProviderName(defaultLoginData.providerName);
        if (provider instanceof ListProvider) {
            await provider.logInUser(defaultLoginData.password, defaultLoginData.username);
            this.sendLoginStatus(provider);
        }
    }

    private async sendLoginStatus(provider: ListProvider): Promise<void> {
        const newStatus = await provider.isUserLoggedIn();
        const data: UpdateProviderLoginStatus = { providerName: provider.providerName, isLoggedIn: newStatus };
        this.com.send(chListener.OnLoggedInStatusChange, data);
    }
}
