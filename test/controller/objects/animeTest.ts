import * as assert from 'assert';
import Anime, { WatchStatus } from '../../../src/backend/controller/objects/anime';
import { ProviderInfo } from '../../../src/backend/controller/objects/providerInfo';
import ProviderList from '../../../src/backend/controller/providerList';
import TestProvider from './testClass/testProvider';

describe('animeTest', () => {
    it('should have a id', async () => {
        const anime = new Anime();
        assert.notEqual(anime.id.length, 0);
        return;
    });

    it('should return season (1/3)', async () => {
        const anime = new Anime();
        anime.seasonNumber = 1;
        assert.equal(await anime.getSeason(), 1);
        return;
    });

    it('should return season (2/3)', async () => {
        const anime = new Anime();
        anime.names.engName = 'Test 3';

        assert.equal(await anime.getSeason(), 3);
        return;
    });

    it('should return season (3/3)', async () => {
        const anime = new Anime();
        anime.names.engName = 'Test III';

        assert.equal(await anime.getSeason(), 3);
        return;
    });

    it('should return last provider', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.lastUpdate = new Date(100);
        providerA.watchProgress = [];
        const providerB = new ProviderInfo();
        providerB.watchProgress = [];
        providerB.lastUpdate = new Date(50);
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime['getLastUpdatedProvider'](), providerA);
        return;
    });

    it('should return last watchprogress', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.lastUpdate = new Date(2);
        providerA.addOneEpisode(5);
        const providerB = new ProviderInfo();
        providerB.lastUpdate = new Date(1);
        providerB.addOneEpisode(4);
        anime.providerInfos.push(providerA, providerB);
        const result = await anime.getLastWatchProgress()
        if (typeof result != 'undefined') {
            assert.equal(result.episode, 5);
        }
        assert.notEqual(typeof result, 'undefined');
        return;
    });

    it('should all episodes (1/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 10;
        const providerB = new ProviderInfo();
        providerB.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        const allEpisodes = await anime.getAllEpisodes();
        assert.deepStrictEqual(allEpisodes, [10, 11]);
        return;
    });

    it('should all episodes (2/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 10;
        const providerB = new ProviderInfo();
        anime.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        assert.deepStrictEqual(await anime.getAllEpisodes(), [10, 11]);
        return;
    });

    it('should all episodes (3/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();

        anime.providerInfos.push(providerA);
        assert.deepStrictEqual(await anime.getAllEpisodes(), []);
        return;
    });

    it('should max episode (1/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 12;
        const providerB = new ProviderInfo();
        anime.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        assert.equal(anime.getMaxEpisode(), 12);
        return;
    });

    it('should max episode (2/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 12;
        const providerB = new ProviderInfo();
        providerB.episodes = 24;
        anime.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        assert.strictEqual(anime.getMaxEpisode(), 24);
        return;
    });

    it('should max episode (3/3)', async () => {
        const anime = new Anime();
        const providerA = new ProviderInfo();
        providerA.episodes = 12;
        const providerB = new ProviderInfo();
        providerB.episodes = 24;
        anime.episodes = 11;
        anime.providerInfos.push(providerA, providerB);
        assert.throws(anime.getMaxEpisode);
        return;
    });

    it('can sync (1/3)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("CanSync121"));
        const providerA = new ProviderInfo("CanSync121");
        providerA.episodes = 12;
        for (let index = 0; index < 12; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.list.push(new TestProvider("CanSync122"));
        const providerB = new ProviderInfo("CanSync122");
        providerB.episodes = 24;
        for (let index = 0; index < 24; index++) {
            providerB.addOneEpisode(index);
        }
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime.episodes = 24;
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.getCanSyncStatus(), true);
    })
    it('can sync (2/3)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("CanSync21"));
        const providerA = new ProviderInfo("CanSync21");
        providerA.episodes = 24;
        for (let index = 1; index < 25; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.COMPLETED;
        ProviderList.list.push(new TestProvider("CanSync22"));
        const providerB = new ProviderInfo("CanSync22");
        providerB.episodes = 24;
        anime.episodes = 24;
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.getCanSyncStatus(), true);
    })
    it('can sync (3/3)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("CanSync31"));
        const providerA = new ProviderInfo("CanSync31");
        providerA.episodes = 24;
        for (let index = 1; index < 12; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.COMPLETED;
        ProviderList.list.push(new TestProvider("CanSync32"));
        const providerB = new ProviderInfo("CanSync32");
        providerB.episodes = 24;
        anime.episodes = 24;
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.getCanSyncStatus(), true);
    })
    it('cant sync (1/7)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("A"));
        const providerA = new ProviderInfo("A");
        providerA.episodes = 24;
        for (let index = 0; index < 25; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.list.push(new TestProvider("B"));
        const providerB = new ProviderInfo("B");
        providerB.episodes = 12;
        for (let index = 0; index < 13; index++) {
            providerB.addOneEpisode(index);
        }
        providerB.addOneEpisode(1);
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime.episodes = 24;
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.getCanSyncStatus(), false);
    })

    it('cant sync (2/7)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("G"));
        const providerA = new ProviderInfo("G");
        providerA.episodes = 12;
        for (let index = 0; index < 13; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.COMPLETED;
        ProviderList.list.push(new TestProvider("C"));
        const providerB = new ProviderInfo("C");
        providerB.episodes = 12;
        for (let index = 0; index < 13; index++) {
            providerB.addOneEpisode(index);
        }
        providerB.addOneEpisode(1);
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime.episodes = 24;
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.getCanSyncStatus(), false);
    })

    it('cant sync (3/7)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("E"));
        const providerA = new ProviderInfo("E");
        providerA.episodes = 12;
        for (let index = 0; index < 12; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.list.push(new TestProvider("F", false));
        const providerB = new ProviderInfo("F");
        providerB.episodes = 24;
        for (let index = 0; index < 24; index++) {
            providerB.addOneEpisode(index);
        }
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime.episodes = 24;
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.getCanSyncStatus(), false);
    })

    it('cant sync (4/7)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("A"));
        const providerA = new ProviderInfo("A");
        providerA.episodes = 12;
        for (let index = 0; index < 12; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        anime.episodes = 24;
        anime.providerInfos.push(providerA);
        assert.equal(await anime.getCanSyncStatus(), false);
    })

    it('cant sync (5/7)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("UU"));
        const providerA = new ProviderInfo("UU");
        providerA.episodes = 12;
        providerA.lastUpdate = new Date(100);
        for (let index = 1; index < 13; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.list.push(new TestProvider("JJ"));
        const providerB = new ProviderInfo("JJ");
        providerB.lastUpdate = new Date(50);
        for (let index = 1; index < 5; index++) {
            providerB.addOneEpisode(index);
        }
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime.episodes = 24;
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.getCanSyncStatus(), false);
    })

    it('cant sync (6/7)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("T"));
        const providerA = new ProviderInfo("T");
        providerA.lastUpdate = new Date(0);
        for (let index = 0; index < 12; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.list.push(new TestProvider("O"));
        const providerB = new ProviderInfo("O");
        providerB.episodes = 24;
        for (let index = 1; index < 25; index++) {
            providerB.addOneEpisode(index);
        }
        ProviderList.list.push(new TestProvider("M"));
        const providerC = new ProviderInfo("M");
        providerC.episodes = 24;
        for (let index = 1; index < 25; index++) {
            providerC.addOneEpisode(index);
        }
        providerC.watchStatus = WatchStatus.COMPLETED;
        anime.episodes = 24;
        anime.providerInfos.push(providerA, providerB, providerC);
        assert.equal(await anime.getCanSyncStatus(), false);
    })

    it('cant sync (7/7)', async () => {
        const anime = new Anime();
        ProviderList.list.push(new TestProvider("TestProvider1"));
        const providerA = new ProviderInfo("TestProvider1");
        providerA.lastUpdate = new Date("2019-07-24T19:09:37.373Z");
        providerA.episodes = 12;
        for (let index = 1; index < 13; index++) {
            providerA.addOneEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.list.push(new TestProvider("TestProvider2"));
        const providerB = new ProviderInfo("TestProvider2");
        providerB.lastUpdate = new Date("2019-07-24T19:09:37.759Z");
        for (let index = 1; index < 13; index++) {
            providerB.addOneEpisode(index);
        }
        anime.providerInfos.push(providerA, providerB);
        assert.equal(await anime.getCanSyncStatus(), false);
    })

});
