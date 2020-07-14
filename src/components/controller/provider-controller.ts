import { chOnce } from '../../backend/communication/channels';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
import GetSyncStatusRecieved from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved';
import GetSyncStatus from '../../backend/controller/frontend/providers/sync-status/model/get-sync-status';
import { chListener } from '../../backend/communication/listener-channels';
import FrontendSyncEpisodes from '../../backend/controller/frontend/providers/sync-status/model/sync-episodes';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '../../store';
import { ListProviderInterface } from './model/list-provider-interface';

@Module({
    dynamic: true,
    name: 'providerController',
    store
})
export default class ProviderController extends VuexModule {
    private cachedProviderWithConnectedUser: ListProviderInterface[] | null = null;
    private lastProviderWithConnectUserRequest: number = new Date(0).getTime();


    @Mutation
    private SET_updateCachedProviderWithConnectedUser(listProvider: ListProviderInterface[]): void {
        this.cachedProviderWithConnectedUser = listProvider;
        this.lastProviderWithConnectUserRequest = new Date().getTime();
    }

    @Action({ commit: 'getAllAvaibleProviders' })
    public async getAllAvaibleProviders(): Promise<ListProviderInterface[]> {
        return await WorkerController.getOnce<ListProviderInterface[]>(chOnce.GetAllListProviders);
    }
    @Action({ commit: 'getAllProviderWithConnectedUser' })
    public async getAllProviderWithConnectedUser(): Promise<ListProviderInterface[]> {
        if (this.context.getters['cachedProviderWithConnectedUser']) {
            if (((this.context.getters['lastProviderWithConnectUserRequest'] - new Date().getTime()) / 1000) > 5) {
                WorkerController.getOnce<ListProviderInterface[]>(chOnce.GetAllListProvidersWithConnectedUser).then((updated) => {
                    this.context.commit('SET_updateCachedProviderWithConnectedUser', updated);
                });
            }
            return this.context.getters['cachedProviderWithConnectedUser'];
        }
        const result = await WorkerController.getOnce<ListProviderInterface[]>(chOnce.GetAllListProvidersWithConnectedUser);
        this.context.commit('SET_updateCachedProviderWithConnectedUser', result);
        return result;
    }

    @Action({ commit: 'isProviderSync' })
    public async isProviderSync(data: GetSyncStatus): Promise<GetSyncStatusRecieved> {
        WorkerController.send(chOnce.GetSyncStatusOfProviderFromASeries, data);
        return await WorkerController.once<GetSyncStatusRecieved>(chOnce.GetSyncStatusOfProviderFromASeries + data.providerName);
    }

    @Action({ commit: 'syncAllEpisodes' })
    public syncAllEpisodes(providerName: string, seriesId: string): void {
        WorkerController.send(chListener.OnSyncEpisodeOfSeriesRequest, { providerName, seriesId } as FrontendSyncEpisodes);
    }
}