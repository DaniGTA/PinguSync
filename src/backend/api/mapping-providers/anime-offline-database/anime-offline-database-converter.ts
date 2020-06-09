import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import AniDBProvider from '../../information-providers/anidb/anidb-provider';
import AniListProvider from '../../information-providers/anilist/anilist-provider';
import KitsuProvider from '../../information-providers/kitsu/kitsu-provider';
import MalProvider from '../../information-providers/mal/mal-provider';
import ExternalProvider from '../../provider/external-provider';
import MultiProviderResult from '../../provider/multi-provider-result';
import { DatabaseEntry } from './objects/database-entry';

export default class AnimeOfflineDatabaseConverter {

    public static convertDatabaseEntryToMultiProviderResult(databaseEntry: DatabaseEntry, providerInstance: ExternalProvider): MultiProviderResult {
        const providerLocalDatas = this.convertSourceListToProviderLocalDatas(databaseEntry.sources);
        // tslint:disable-next-line: triple-equals
        const mainProvider = providerLocalDatas.find((x) => x.provider == providerInstance.providerName);
        let mpr: MultiProviderResult | undefined;
        if (mainProvider) {
            mpr = new MultiProviderResult(mainProvider, ...providerLocalDatas);
        } else {
            mpr = new MultiProviderResult(providerLocalDatas[0], ...providerLocalDatas);
        }
        return mpr;
    }

    private static convertSourceListToProviderLocalDatas(sources: string[]): ProviderLocalData[] {
        const providerLocalData = [];
        for (const source of sources) {
            if (source.includes('anidb')) {
                providerLocalData.push(new InfoProviderLocalData(this.extractIdFromUrl(source), AniDBProvider));
            } else if (source.includes('anilist')) {
                providerLocalData.push(new ListProviderLocalData(this.extractIdFromUrl(source), AniListProvider));
            } else if (source.includes('myanimelist')) {
                providerLocalData.push(new ListProviderLocalData(this.extractIdFromUrl(source), MalProvider));
            } else if (source.includes('kitsu')) {
                providerLocalData.push(new ListProviderLocalData(this.extractIdFromUrl(source), KitsuProvider));
            }
        }
        return providerLocalData;
    }

    private static extractIdFromUrl(url?: string): number {
        if (url) {
            return Number(url.replace(/[^0-9]/g, ''));
        }
        return Number.NaN;
    }
}
