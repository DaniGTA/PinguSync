import Series from '../objects/series';
import SyncEpisodes from './sync-episodes';
import ProviderList from '../provider-controller/provider-manager/provider-list';
import ListProvider from '../../api/provider/list-provider';

export default class SyncExternalEpisodes {
    private static currentlySyncing: string[] = []
    public static async sync(provider: string, series: Series): Promise<void> {
        this.canSync(provider);
        const providerInstance = ProviderList.getProviderInstanceByProviderName(provider);
        if (providerInstance instanceof ListProvider) {
            const allEpisodesThatNeedSync = new SyncEpisodes(series).getAllEpisodeThatAreOutOfSync(providerInstance);
            for (const iterator of allEpisodesThatNeedSync) {
                await providerInstance.markEpisodeAsWatched(iterator);
            }
        }
    }

    private static canSync(provider: string): boolean {
        return !this.currentlySyncing.find(x => x === provider);
    }
}