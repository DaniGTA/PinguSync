import ListProvider from '../../../api/provider/list-provider';
import ICommunication from '../../../communication/icommunication';
import IPCBackgroundController from '../../../communication/ipc-background-controller';
import ProviderList from '../../provider-controller/provider-manager/provider-list';
import FrontendProviderAuthController from './frontend-provider-auth-controller';
import { chOnce } from '../../../communication/channels';

export default class FrontendProviderController {
    private communcation: ICommunication;


    constructor(webcontents: Electron.WebContents) {
        this.communcation = new IPCBackgroundController(webcontents);
        this.init();
        // tslint:disable-next-line: no-unused-expression
        new FrontendProviderAuthController(webcontents);
    }


    private init(): void {
        this.communcation.on(chOnce.GetAllListProviders, () => this.communcation.send(chOnce.GetAllListProviders, this.getAllListProviders()));
        this.communcation.on(chOnce.GetUserNameFromProvider, async (providerName) => this.communcation.send(chOnce.GetUserNameFromProvider, await this.getUsername(providerName)));
    }

    private getAllListProviders(): ListProvider[] {
        return ProviderList.getListProviderList();
    }

    private async getUsername(providerName: string): Promise<string> {
        const providerInstance = ProviderList.getProviderInstanceByProviderName(providerName);
        if (providerInstance instanceof ListProvider) {
            return await providerInstance.getUsername();
        }
        throw new Error('Cant get Username from provider');
    }
}
