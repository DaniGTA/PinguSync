import ListProvider from '../../../api/provider/list-provider';
import ICommunication from '../../../communication/icommunication';
import IPCBackgroundController from '../../../communication/ipc-background-controller';
import ProviderList from '../../provider-controller/provider-manager/provider-list';

export default class FrontendProviderController {
    private communcation: ICommunication;


    constructor(webcontents: Electron.WebContents) {
        this.communcation = new IPCBackgroundController(webcontents);
        this.init();
    }


    private init(): void {
        this.communcation.on('get-all-list-providers', () => this.communcation.send('get-all-list-providers', this.getAllListProviders()));
    }

    private getAllListProviders(): ListProvider[] {
        return ProviderList.getListProviderList();
    }
}
