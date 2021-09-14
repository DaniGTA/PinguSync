import ListProvider from '../../../api/provider/list-provider'
import ICommunication from '../../../communication/icommunication'
import IPCBackgroundController from '../../../communication/ipc-background-controller'
import ProviderList from '../../provider-controller/provider-manager/provider-list'
import FrontendProviderAuthController from './frontend-provider-auth-controller'
import { chOnce } from '../../../communication/channels'
import logger from '../../../logger/logger'
import FrontendProviderSyncController from './sync-status/frontend-provider-sync-controller'

export default class FrontendProviderController {
    private com: ICommunication

    constructor() {
        this.com = new IPCBackgroundController()
        this.init()
        // tslint:disable-next-line: no-unused-expression
        new FrontendProviderAuthController()
        new FrontendProviderSyncController()
    }

    private init(): void {
        IPCBackgroundController.on(chOnce.GetAllListProviders, () =>
            IPCBackgroundController.send(chOnce.GetAllListProviders, this.getAllListProviders())
        )
        IPCBackgroundController.on(chOnce.GetUserNameFromProvider, async providerName =>
            IPCBackgroundController.send(chOnce.GetUserNameFromProvider, await this.getUsername(providerName))
        )
        IPCBackgroundController.on(chOnce.GetAllListProvidersWithConnectedUser, async () =>
            IPCBackgroundController.send(
                chOnce.GetAllListProvidersWithConnectedUser,
                await this.getAllListProvidersWithLoggedInUser()
            )
        )
    }

    private getAllListProviders(): ListProvider[] {
        return ProviderList.getListProviderList()
    }

    private async getAllListProvidersWithLoggedInUser(): Promise<ListProvider[]> {
        const allLoggedInProviders = []
        try {
            for (const provider of ProviderList.getListProviderList()) {
                try {
                    if (await provider.isUserLoggedIn()) {
                        allLoggedInProviders.push(provider)
                    }
                } catch (err) {
                    logger.debug(err)
                }
            }
        } catch (err) {
            logger.error(err)
        }
        return allLoggedInProviders
    }

    private async getUsername(providerName: string): Promise<string> {
        const providerInstance = ProviderList.getProviderInstanceByProviderName(providerName)
        if (providerInstance instanceof ListProvider) {
            return await providerInstance.getUsername()
        }
        throw new Error('Cant get Username from provider')
    }
}
