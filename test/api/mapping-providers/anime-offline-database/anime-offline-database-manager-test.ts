import { strictEqual } from 'assert';
import { readFileSync } from 'fs';
import AniDBProvider from '../../../../src/backend/api/information-providers/anidb/anidb-provider';
import AniListProvider from '../../../../src/backend/api/information-providers/anilist/anilist-provider';
import KitsuProvider from '../../../../src/backend/api/information-providers/kitsu/kitsu-provider';
import MalProvider from '../../../../src/backend/api/information-providers/mal/mal-provider';
import AnimeOfflineDatabaseManager from '../../../../src/backend/api/mapping-providers/anime-offline-database/anime-offline-database-manager';
import { IAnimeOfflineDatabase } from '../../../../src/backend/api/mapping-providers/anime-offline-database/objects/database-entry';
import { InfoProviderLocalData } from '../../../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../../src/backend/controller/provider-manager/provider-list';

describe('AnimeOfflineDatabaseManager | basic test', () => {
    // tslint:disable: no-string-literal


    test('should not allow download', () => {
        AnimeOfflineDatabaseManager['LOCAL_DATA'].lastDatabaseDownloadTimestamp = Date.now();
        const result = AnimeOfflineDatabaseManager['canUpdateDatabase']();
        strictEqual(result, false);
    });

    test('should allow download', () => {
        AnimeOfflineDatabaseManager['LOCAL_DATA'].lastDatabaseDownloadTimestamp = 0;
        const result = AnimeOfflineDatabaseManager['canUpdateDatabase']();
        strictEqual(result, true);
    });
    describe('getMappingFromProviderLocalData tests', () => {
        const database: IAnimeOfflineDatabase = JSON.parse(readFileSync('./test/api/mapping-providers/anime-offline-database/data/anime-offline-database.json', 'UTF-8')) as IAnimeOfflineDatabase;;
        beforeAll(() => {
            ProviderList['loadedInfoProvider'] = undefined;
            ProviderList['loadedListProvider'] = undefined;

        });
        test('should find IDatabaseEntry with aniDB id', () => {
            const providerLocalData = new InfoProviderLocalData('4563', AniDBProvider);
            AnimeOfflineDatabaseManager['LOCAL_DATA'].database = database;
            const r = AnimeOfflineDatabaseManager.getMappingFromProviderLocalData(providerLocalData);
            strictEqual(r?.episodes, 37);
        });

        test('should find IDatabaseEntry with aniList id', () => {
            const providerLocalData = new ListProviderLocalData(1535, AniListProvider);
            AnimeOfflineDatabaseManager['LOCAL_DATA'].database = database;
            const r = AnimeOfflineDatabaseManager.getMappingFromProviderLocalData(providerLocalData);
            strictEqual(r?.episodes, 37);
        });

        test('should find IDatabaseEntry with kitsu id', () => {
            const providerLocalData = new ListProviderLocalData(1376, KitsuProvider);
            AnimeOfflineDatabaseManager['LOCAL_DATA'].database = database;
            const r = AnimeOfflineDatabaseManager.getMappingFromProviderLocalData(providerLocalData);
            strictEqual(r?.episodes, 37);
        });

        test('should find IDatabaseEntry with mal id', () => {
            const providerLocalData = new ListProviderLocalData(1535, MalProvider);
            AnimeOfflineDatabaseManager['LOCAL_DATA'].database = database;
            const r = AnimeOfflineDatabaseManager.getMappingFromProviderLocalData(providerLocalData);
            strictEqual(r?.episodes, 37);
        });
    });
});
