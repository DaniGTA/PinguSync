import AnimeOfflineDatabaseConverter from '../../../../src/backend/api/mapping-providers/anime-offline-database/anime-offline-database-converter';
import { strictEqual } from 'assert';

describe('AnimeOfflineDatabaseManager | converter tests', () => {
    test('should convert source list to provider localdata', () => {
        const result = AnimeOfflineDatabaseConverter['convertSourceListToProviderLocalDatas'](['https://anidb.net/anime/13658', 'https://kitsu.io/anime/4550']);
        strictEqual(result.length, 2);
    });

    test('should ignore unkown source', () => {
        const result = AnimeOfflineDatabaseConverter['convertSourceListToProviderLocalDatas'](['https://unkown', 'https://source']);
        strictEqual(result.length, 0);
    });
});
