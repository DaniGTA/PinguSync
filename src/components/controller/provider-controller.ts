import { chOnce } from '../../backend/communication/channels';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
import GetSyncStatusRecieved from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved';
import GetSyncStatus from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status';
import { chListener } from '../../backend/communication/listener-channels';
import FrontendSyncEpisodes from '../../backend/controller/frontend/providers/sync-status/model/sync-episodes';
import { Action, Module, VuexModule } from 'vuex-module-decorators';
import store from '../../store';
import { ListProviderInterface } from './model/list-provider-interface';

@Module({
    dynamic: true,
    name: 'providerController',
    store
})
export default class ProviderController extends VuexModule {
    @Action({ commit: 'getAllAvaibleProviders' })
    public async getAllAvaibleProviders(): Promise<ListProviderInterface[]> {
        return await WorkerController.getOnce<ListProviderInterface[]>(chOnce.GetAllListProviders);
    }
    @Action({ commit: 'getAllProviderWithConnectedUser' })
    public async getAllProviderWithConnectedUser(): Promise<ListProviderInterface[]> {
        return await WorkerController.getOnce<ListProviderInterface[]>(chOnce.GetAllListProvidersWithConnectedUser);
    }

    @Action({ commit: 'isProviderSync' })
    public async isProviderSync(data: GetSyncStatus): Promise<GetSyncStatusRecieved> {
        WorkerController.send(chOnce.GetSyncStatusOfProviderFromASeries, data);
        return await WorkerController.once<GetSyncStatusRecieved>(chOnce.GetSyncStatusOfProviderFromASeries + data.providerName);
    }

    @Action({ commit: 'syncAllEpisodes' })
    public syncAllEpisodes(frontendSyncEpisodes: FrontendSyncEpisodes): void {
        WorkerController.send(chListener.OnSyncEpisodeOfSeriesRequest, frontendSyncEpisodes);
    }
}
