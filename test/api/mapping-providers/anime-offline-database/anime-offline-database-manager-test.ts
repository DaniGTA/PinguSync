import { readFileSync } from 'fs';
import AniDBProvider from '../../../../src/backend/api/information-providers/anidb/anidb-provider';
import AniListProvider from '../../../../src/backend/api/information-providers/anilist/anilist-provider';
import KitsuProvider from '../../../../src/backend/api/information-providers/kitsu/kitsu-provider';
import MalProvider from '../../../../src/backend/api/information-providers/mal/mal-provider';
import AnimeOfflineDatabaseManager from '../../../../src/backend/api/mapping-providers/anime-offline-database/anime-offline-database-manager';
import { AnimeOfflineDatabase } from '../../../../src/backend/api/mapping-providers/anime-offline-database/objects/database-entry';
import { InfoProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';

describe('AnimeOfflineDatabaseManager | basic test', () => {
    // tslint:disable: no-string-literal


    test('should not allow download', () => {
        AnimeOfflineDatabaseManager['LOCAL_DATA'].lastDatabaseDownloadTimestamp = Date.now();
        const result = AnimeOfflineDatabaseManager['canUpdateDatabase']();
        expect(result).toBeFalsy();
    });

    test('should allow download', () => {
        AnimeOfflineDatabaseManager['LOCAL_DATA'].lastDatabaseDownloadTimestamp = 0;
        const result = AnimeOfflineDatabaseManager['canUpdateDatabase']();
        expect(result).toBeTruthy();
    });
    describe('getMappingFromProviderLocalData tests', () => {
        const database: AnimeOfflineDatabase = JSON.parse(readFileSync('./test/api/mapping-providers/anime-offline-database/data/anime-offline-database.json', 'UTF-8')) as AnimeOfflineDatabase;
        beforeAll(() => {
            ProviderList['loadedInfoProvider'] = undefined;
            ProviderList['loadedListProvider'] = undefined;

        });
        test('should find IDatabaseEntry with aniDB id', async () => {
            const providerLocalData = new InfoProviderLocalData('4563', AniDBProvider);
            AnimeOfflineDatabaseManager['LOCAL_DATA'].database = database;
            const r = await AnimeOfflineDatabaseManager.getMappingFromProviderLocalData(providerLocalData);
            expect(r?.episodes).toEqual(37);
        });

        test('should find IDatabaseEntry with aniList id', async () => {
            const providerLocalData = new ListProviderLocalData(1535, AniListProvider);
            AnimeOfflineDatabaseManager['LOCAL_DATA'].database = database;
            const r = await AnimeOfflineDatabaseManager.getMappingFromProviderLocalData(providerLocalData);
            expect(r?.episodes).toEqual(37);
        });

        test('should find IDatabaseEntry with kitsu id', async () => {
            const providerLocalData = new ListProviderLocalData(1376, KitsuProvider);
            AnimeOfflineDatabaseManager['LOCAL_DATA'].database = database;
            const r = await AnimeOfflineDatabaseManager.getMappingFromProviderLocalData(providerLocalData);
            expect(r?.episodes).toEqual(37);
        });

        test('should find IDatabaseEntry with mal id', async () => {
            const providerLocalData = new ListProviderLocalData(1535, MalProvider);
            AnimeOfflineDatabaseManager['LOCAL_DATA'].database = database;
            const r = await AnimeOfflineDatabaseManager.getMappingFromProviderLocalData(providerLocalData);
            expect(r?.episodes).toEqual(37);
        });
    });
});
