import ProviderList from "../../../src/backend/controller/provider-manager/provider-list";
import TestProvider from "./testClass/testProvider";

import assert from "assert";
import Series, { WatchStatus } from "../../../src/backend/controller/objects/series";
import { ListProviderLocalData } from "../../../src/backend/controller/objects/list-provider-local-data";

describe('seriesTest | Sync', () => {
    it('can sync (1/3)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("CanSync121"));
        const providerA = new ListProviderLocalData("CanSync121");
        providerA.episodes = 12;
        for (let index = 0; index < 12; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;

        ProviderList.getListProviderList().push(new TestProvider("CanSync122"));
        const providerB = new ListProviderLocalData("CanSync122");
        providerB.episodes = 24;
        for (let index = 0; index < 24; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime['episodes'] = 24;
        anime.addListProvider(providerA, providerB);
        assert.equal(await anime.getCanSync(), true);
    })
    it('can sync (2/3)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("CanSync21"));
        const providerA = new ListProviderLocalData("CanSync21");
        providerA.episodes = 24;
        for (let index = 1; index < 25; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.COMPLETED;
        ProviderList.getListProviderList().push(new TestProvider("CanSync22"));
        const providerB = new ListProviderLocalData("CanSync22");
        providerB.episodes = 24;
        anime['episodes'] = 24;
        anime.addListProvider(providerA, providerB);
        assert.equal(await anime.getCanSync(), true);
    })
    it('can sync (3/3)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("CanSync31"));
        const providerA = new ListProviderLocalData("CanSync31");
        providerA.episodes = 24;
        for (let index = 1; index < 12; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.COMPLETED;
        ProviderList.getListProviderList().push(new TestProvider("CanSync32"));
        const providerB = new ListProviderLocalData("CanSync32");
        providerB.episodes = 24;
        anime['episodes'] = 24;
        anime.addListProvider(providerA, providerB);
        assert.equal(await anime.getCanSync(), true);
    })
    it('cant sync (1/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("A"));
        const providerA = new ListProviderLocalData("A");
        providerA.episodes = 24;
        for (let index = 0; index < 25; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider("B"));
        const providerB = new ListProviderLocalData("B");
        providerB.episodes = 12;
        for (let index = 0; index < 13; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.addOneWatchedEpisode(1);
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime['episodes'] = 24;
        anime.addListProvider(providerA, providerB);
        assert.equal(await anime.getCanSync(), false);
    })

    it('cant sync (2/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("G"));
        const providerA = new ListProviderLocalData("G");
        providerA.episodes = 12;
        for (let index = 0; index < 13; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.COMPLETED;
        ProviderList.getListProviderList().push(new TestProvider("C"));
        const providerB = new ListProviderLocalData("C");
        providerB.episodes = 12;
        for (let index = 0; index < 13; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.addOneWatchedEpisode(1);
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime['episodes'] = 24;
        anime.addListProvider(providerA, providerB);
        assert.equal(await anime.getCanSync(), false);
    })

    it('cant sync (3/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("E"));
        const providerA = new ListProviderLocalData("E");
        providerA.episodes = 12;
        for (let index = 0; index < 12; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider("F", false));
        const providerB = new ListProviderLocalData("F");
        providerB.episodes = 24;
        for (let index = 0; index < 24; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime['episodes'] = 24;
        anime.addListProvider(providerA, providerB);
        assert.equal(await anime.getCanSync(), false);
    })

    it('cant sync (4/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("A"));
        const providerA = new ListProviderLocalData("A");
        providerA.episodes = 12;
        for (let index = 0; index < 12; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        anime['episodes'] = 24;
        anime.addListProvider(providerA);
        assert.equal(await anime.getCanSync(), false);
    })

    it('cant sync (5/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("UU"));
        const providerA = new ListProviderLocalData("UU");
        providerA.episodes = 12;
        providerA.lastUpdate = new Date(100);
        for (let index = 1; index < 13; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider("JJ"));
        const providerB = new ListProviderLocalData("JJ");
        providerB.lastUpdate = new Date(50);
        for (let index = 1; index < 5; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.watchStatus = WatchStatus.COMPLETED;
        anime['episodes'] = 24;
        anime.addListProvider(providerA, providerB);
        assert.equal(await anime.getCanSync(), false);
    })

    it('cant sync (6/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("T"));
        const providerA = new ListProviderLocalData("T");
        providerA.lastUpdate = new Date(0);
        for (let index = 0; index < 12; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider("O"));
        const providerB = new ListProviderLocalData("O");
        providerB.episodes = 24;
        for (let index = 1; index < 25; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        ProviderList.getListProviderList().push(new TestProvider("M"));
        const providerC = new ListProviderLocalData("M");
        providerC.episodes = 24;
        for (let index = 1; index < 25; index++) {
            providerC.addOneWatchedEpisode(index);
        }
        providerC.watchStatus = WatchStatus.COMPLETED;
        anime['episodes'] = 24;
        anime.addListProvider(providerA, providerB, providerC);
        assert.equal(await anime.getCanSync(), false);
    })

    it('cant sync (7/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider("TestProvider1"));
        const providerA = new ListProviderLocalData("TestProvider1");
        providerA.lastUpdate = new Date("2019-07-24T19:09:37.373Z");
        providerA.episodes = 12;
        for (let index = 1; index < 13; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = WatchStatus.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider("TestProvider2"));
        const providerB = new ListProviderLocalData("TestProvider2");
        providerB.lastUpdate = new Date("2019-07-24T19:09:37.759Z");
        for (let index = 1; index < 13; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        anime.addListProvider(providerA, providerB);
        assert.equal(await anime.getCanSync(), false);
    })
});
