import ICommunication from '../../../../communication/icommunication';
import IPCBackgroundController from '../../../../communication/ipc-background-controller';
import { chOnce } from '../../../../communication/channels';
import GetSyncStatus from './model/get-sync-status';
import GetSyncStatusRecieved from './model/get-sync-status-recieved';
import SyncEpisodes from '../../../sync-controller/sync-episodes';
import MainListSearcher from '../../../main-list-manager/main-list-searcher';
import ProviderList from '../../../provider-controller/provider-manager/provider-list';
import ListProvider from '../../../../api/provider/list-provider';
import { chListener } from '../../../../communication/listener-channels';
import SyncExternalEpisodes from '../../../sync-controller/sync-external-episodes';
import FrontendSyncEpisodes from './model/sync-episodes';


export default class FrontendProviderSyncController {
    private com: ICommunication;


    constructor(webcontents: Electron.WebContents) {
        this.com = new IPCBackgroundController(webcontents);
        this.init();
        // tslint:disable-next-line: no-unused-expression
    }


    private init(): void {
        this.com.on(chOnce.GetSyncStatusOfProviderFromASeries, (x: GetSyncStatus) => this.com.send(chOnce.GetSyncStatusOfProviderFromASeries + x.providerName, this.getSyncStatusOfProviderFromASeries(x)));
        this.com.on(chListener.OnSyncEpisodeOfSeriesRequest, (x: FrontendSyncEpisodes) => this.syncEpisodeOfProvider(x));
    }

    private getSyncStatusOfProviderFromASeries(data: GetSyncStatus): GetSyncStatusRecieved {
        const series = MainListSearcher.findSeriesById(data.seriesId);
        const provider = ProviderList.getProviderInstanceByProviderName(data.providerName);
        if (series && provider instanceof ListProvider) {
            const se = new SyncEpisodes(series);
            const result = se.getSyncStatus(provider);
            return result as GetSyncStatusRecieved;
        }
        return {} as GetSyncStatusRecieved;
    }

    private syncEpisodeOfProvider(x: FrontendSyncEpisodes): void {
        const series = MainListSearcher.findSeriesById(x.seriesId);
        if (series) {
            SyncExternalEpisodes.sync(x.providerName, series);
        }
    }
}  
