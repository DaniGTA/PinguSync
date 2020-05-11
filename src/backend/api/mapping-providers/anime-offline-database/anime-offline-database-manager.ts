import moment from 'moment';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list';
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager';
import AniDBProvider from '../../information-providers/anidb/anidb-provider';
import AniListProvider from '../../information-providers/anilist/anilist-provider';
import KitsuProvider from '../../information-providers/kitsu/kitsu-provider';
import MalProvider from '../../information-providers/mal/mal-provider';
import ExternalInformationProvider from '../../provider/external-information-provider';
import AnimeOfflineDatabaseProviderData from './anime-offline-database-provider-data';
import { IAnimeOfflineDatabase, IDatabaseEntry } from './objects/database-entry';

export default class AnimeOfflineDatabaseManager {
    public static async checkDatabaseStatus(): Promise<void> {
        if (this.canUpdateDatabase()) {
            const database = await this.downloadDatabase();
            this.LOCAL_DATA.updateDatabase(database);
        }
    }

    public static async getMappingFromProviderLocalData(providerLocalData: ProviderLocalData): Promise<IDatabaseEntry | undefined> {
        await this.checkDatabaseStatus();
        const providerInstance = ProviderList.getProviderInstanceByLocalData(providerLocalData);
        for (const databaseEntry of this.LOCAL_DATA.database.data) {
            if (this.databaseEntryHasSameIdAsProviderLocalData(databaseEntry, providerInstance, providerLocalData)) {
                return databaseEntry;
            }
        }
    }

    private static readonly LOCAL_DATA: AnimeOfflineDatabaseProviderData = new AnimeOfflineDatabaseProviderData();
    private static readonly UPDATE_INTERVAL_IN_DAYS: number = 7;
    private static readonly DATABASE_URL = 'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json';

    private static databaseEntryHasSameIdAsProviderLocalData(databaseEntry: IDatabaseEntry, providerInstance: ExternalInformationProvider, providerLocalData: ProviderLocalData): boolean {
        // tslint:disable: triple-equals
        if (providerInstance instanceof AniDBProvider) {
            const anidbString = databaseEntry.sources.find((x) => x.includes('anidb'));
            return providerLocalData.id == this.extractIdFromUrl(anidbString);
        } else if (providerInstance instanceof AniListProvider) {
            const aniListString = databaseEntry.sources.find((x) => x.includes('anilist'));
            return providerLocalData.id == this.extractIdFromUrl(aniListString);
        } else if (providerInstance instanceof MalProvider) {
            const malString = databaseEntry.sources.find((x) => x.includes('myanimelist'));
            return providerLocalData.id == this.extractIdFromUrl(malString);
        } else if (providerInstance instanceof KitsuProvider) {
            const kitsuString = databaseEntry.sources.find((x) => x.includes('kitsu'));
            return providerLocalData.id == this.extractIdFromUrl(kitsuString);
        }
        return false;
    }

    private static extractIdFromUrl(anidbUrl?: string): number {
        if (anidbUrl) {
            return Number(anidbUrl.replace(/[^0-9]/g, ''));
        }
        return Number.NaN;
    }

    private static canUpdateDatabase(): boolean {
        const currentDate = moment(new Date());
        const lastDownload = moment(this.LOCAL_DATA.lastDatabaseDownloadTimestamp);
        if (currentDate.diff(lastDownload, 'days') > this.UPDATE_INTERVAL_IN_DAYS) {
            return true;
        }
        return false;
    }

    private static async downloadDatabase(): Promise<IAnimeOfflineDatabase> {
        const res = await WebRequestManager.request({ uri: AnimeOfflineDatabaseManager.DATABASE_URL });
        if (res.statusCode === 200) {
            return JSON.parse(res.body) as IAnimeOfflineDatabase;
        } else {
            throw new Error('[AnimeOfflineDatabase] Database download failed status code: ' + res.statusCode);
        }
    }
}
