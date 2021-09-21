import ListProvider from '../../../api/provider/list-provider'
import ICommunication from '../../../communication/icommunication'
import IPCBackgroundController from '../../../communication/ipc-background-controller'
import ProviderList from '../../provider-controller/provider-manager/provider-list'
import FrontendProviderAuthController from './frontend-provider-auth-controller'
import { chOnce } from '../../../communication/channels'
import logger from '../../../logger/logger'
import FrontendProviderSyncController from './sync-status/frontend-provider-sync-controller'

export default class FrontendProviderController {
    constructor() {
        this.init()
        // tslint:disable-next-line: no-unused-expression
        new FrontendProviderAuthController()
        new FrontendProviderSyncController()
    }

    private init(): void {
        IPCBackgroundController.on(chOnce.GetAllListProviders, (unused, trackingToken) =>
            IPCBackgroundController.send(chOnce.GetAllListProviders, this.getAllListProviders(), trackingToken)
        )
        IPCBackgroundController.on<string>(chOnce.GetUserNameFromProvider, async (providerName, trackingToken) =>
            IPCBackgroundController.send(
                chOnce.GetUserNameFromProvider,
                await this.getUsername(providerName),
                trackingToken
            )
        )
        IPCBackgroundController.on(chOnce.GetAllListProvidersWithConnectedUser, async (unused, trackingToken) =>
            IPCBackgroundController.send(
                chOnce.GetAllListProvidersWithConnectedUser,
                await this.getAllListProvidersWithLoggedInUser(),
                trackingToken
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
                    logger.debug(err as string)
                }
            }
        } catch (err) {
            logger.error(err as string)
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
