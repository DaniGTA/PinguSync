import ICommunication from '../../../communication/icommunication'
import IPCBackgroundController from '../../../communication/ipc-background-controller'
import OAuthController from '../../auth/o-auth-controller/o-auth-controller'
import ListProvider from '../../../api/provider/list-provider'
import ProviderList from '../../provider-controller/provider-manager/provider-list'
import { shell } from 'electron'
import FrontendDefaultLogin from './model/frontend-default-login'
import UpdateProviderLoginStatus from './model/update-provider-login-status'
import { chSend } from '../../../communication/send-only-channels'
import { chOnce } from '../../../communication/channels'
import { chListener } from '../../../communication/listener-channels'
import logger from '../../../logger/logger'
import { Token } from 'graphql'
import OAuthListProvider from '@/backend/api/provider/o-auth-list-provider'

export default class FrontendProviderAuthController {
    /**
     *Creates an instance of FrontendProviderAuthController.
     * @memberof FrontendProviderAuthController
     */
    constructor() {
        this.init()
    }

    private init(): void {
        IPCBackgroundController.on<string>('oauth-login-provider', (providerName, token) =>
            this.oAuthLogin(providerName, token)
        )
        IPCBackgroundController.on<FrontendDefaultLogin>(chSend.DefaultProviderLogin, (data, token) =>
            this.defaultLogin(data, token)
        )
        IPCBackgroundController.on<string>(chSend.LogoutUser, (providerName, token) =>
            this.logoutProvider(providerName, token)
        )
        IPCBackgroundController.on<string>(chOnce.IsAnyProviderLoggedIn, async (unused, token) =>
            IPCBackgroundController.send(chOnce.IsAnyProviderLoggedIn, await this.isAnyProviderLoggedIn(), token)
        )
        IPCBackgroundController.on<string>(chOnce.GetLoggedInStatus, async (providerName, token) =>
            IPCBackgroundController.send(chOnce.GetLoggedInStatus, await this.isUserLoggedIn(providerName), token)
        )
    }

    private logoutProvider(providerName: string, token?: string): void {
        const provider = ProviderList.getProviderInstanceByProviderName(providerName)
        if (provider instanceof ListProvider) {
            try {
                provider.logoutUser()
            } catch (err) {
                logger.error(err as string)
            }
            this.sendLoginStatus(provider, token)
        }
    }

    private async isAnyProviderLoggedIn(): Promise<boolean> {
        const allListProviders = ProviderList.getListProviderList()
        for (const listProvider of allListProviders) {
            try {
                if (await listProvider.isUserLoggedIn()) {
                    return true
                }
            } catch (err) {
                logger.error(err as string)
            }
        }
        return false
    }

    private async isUserLoggedIn(providerName: string): Promise<boolean> {
        const provider = ProviderList.getProviderInstanceByProviderName(providerName)
        if (provider instanceof ListProvider) {
            try {
                return await provider.isUserLoggedIn()
            } catch (err) {
                logger.error(err as string)
            }
        }
        return false
    }

    private async oAuthLogin(providerName: string, token?: string): Promise<void> {
        const provider = ProviderList.getProviderInstanceByProviderName(providerName)
        if (provider instanceof OAuthListProvider && provider.hasOAuthLogin) {
            shell.openExternal(provider.getTokenAuthUrl())
            await new OAuthController(provider).isOAuthFlowSuccessfull()
            this.sendLoginStatus(provider, token)
        }
    }

    private async defaultLogin(defaultLoginData: FrontendDefaultLogin, token?: string): Promise<void> {
        const provider = ProviderList.getProviderInstanceByProviderName(defaultLoginData.providerName)
        if (provider instanceof ListProvider) {
            await provider.logInUser(defaultLoginData.password, defaultLoginData.username)
            this.sendLoginStatus(provider, token)
        }
    }

    private async sendLoginStatus(provider: ListProvider, token?: string): Promise<void> {
        const newStatus = await provider.isUserLoggedIn()
        const data: UpdateProviderLoginStatus = {
            providerName: provider.providerName,
            isLoggedIn: newStatus,
        }
        IPCBackgroundController.send(chListener.OnLoggedInStatusChange, data, token)
    }
}
