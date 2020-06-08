import ListProvider from '../../../api/provider/list-provider';
import ICommunication from '../../../communication/icommunication';
import IPCBackgroundController from '../../../communication/ipc-background-controller';
import ProviderList from '../../provider-controller/provider-manager/provider-list';
import FrontendProviderAuthController from './frontend-provider-auth-controller';
import { chOnce } from '../../../communication/channels';
import logger from '../../../logger/logger';
import FrontendProviderSyncController from './sync-status/frontend-provider-sync-controller';

export default class FrontendProviderController {
    private com: ICommunication;


    constructor(webcontents: Electron.WebContents) {
        this.com = new IPCBackgroundController(webcontents);
        this.init();
        // tslint:disable-next-line: no-unused-expression
        new FrontendProviderAuthController(webcontents);
        new FrontendProviderSyncController(webcontents);
    }


    private init(): void {
        this.com.on(chOnce.GetAllListProviders, () => this.com.send(chOnce.GetAllListProviders, this.getAllListProviders()));
        this.com.on(chOnce.GetUserNameFromProvider, async (providerName) => this.com.send(chOnce.GetUserNameFromProvider, await this.getUsername(providerName)));
        this.com.on(chOnce.GetAllListProvidersWithConnectedUser, async () => this.com.send(chOnce.GetAllListProvidersWithConnectedUser, await this.getAllListProvidersWithLoggedInUser()));
    }

    private getAllListProviders(): ListProvider[] {
        return ProviderList.getListProviderList();
    }

    private async getAllListProvidersWithLoggedInUser(): Promise<ListProvider[]> {
        const allLoggedInProviders = [];
        for (const provider of ProviderList.getListProviderList()) {
            try {
                if (await provider.isUserLoggedIn()) {
                    allLoggedInProviders.push(provider);
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return allLoggedInProviders;
    }

    private async getUsername(providerName: string): Promise<string> {
        const providerInstance = ProviderList.getProviderInstanceByProviderName(providerName);
        if (providerInstance instanceof ListProvider) {
            return await providerInstance.getUsername();
        }
        throw new Error('Cant get Username from provider');
    }
}
