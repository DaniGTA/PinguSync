
import TestProvider from './testClass/testProvider';

import assert from 'assert';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import { ListType } from '../../../src/backend/controller/settings/models/provider/list-types';

describe('Series | Sync', () => {
    test('can sync (1/3)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider('CanSync121'));
        const providerA = new ListProviderLocalData(1, 'CanSync121');
        providerA.episodes = 12;
        for (let index = 0; index < 12; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = ListType.CURRENT;

        ProviderList.getListProviderList().push(new TestProvider('CanSync122'));
        const providerB = new ListProviderLocalData(1, 'CanSync122');
        providerB.episodes = 24;
        for (let index = 0; index < 24; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.watchStatus = ListType.COMPLETED;
        // tslint:disable-next-line: no-string-literal
        providerB['episodes'] = 24;
        await anime.addProviderDatas(providerA, providerB);
        assert.equal(await anime.getCanSync(), true);
    });
    test('can sync (2/3)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider('CanSync21'));
        const providerA = new ListProviderLocalData(1, 'CanSync21');
        providerA.episodes = 24;
        for (let index = 1; index < 25; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = ListType.COMPLETED;
        ProviderList.getListProviderList().push(new TestProvider('CanSync22'));
        const providerB = new ListProviderLocalData(1, 'CanSync22');
        providerB.episodes = 24;
        // tslint:disable-next-line: no-string-literal
        providerB['episodes'] = 24;
        await anime.addProviderDatas(providerA, providerB);
        assert.equal(await anime.getCanSync(), true);
    });

    test('cant sync (1/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider('A'));
        const providerA = new ListProviderLocalData(1, 'A');
        providerA.episodes = 24;
        for (let index = 0; index < 25; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = ListType.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider('B'));
        const providerB = new ListProviderLocalData(1, 'B');
        providerB.episodes = 12;
        for (let index = 0; index < 13; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.addOneWatchedEpisode(1);
        providerB.watchStatus = ListType.COMPLETED;
        // tslint:disable-next-line: no-string-literal
        providerB['episodes'] = 24;
        await anime.addProviderDatas(providerA, providerB);
        assert.equal(await anime.getCanSync(), false);
    });

    test('cant sync (2/7)', async () => {
        const series = new Series();
        ProviderList.getListProviderList().push(new TestProvider('G'));
        const providerA = new ListProviderLocalData(1, 'G');
        providerA.episodes = 12;
        for (let index = 0; index < 13; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = ListType.COMPLETED;
        ProviderList.getListProviderList().push(new TestProvider('C'));

        const providerB = new ListProviderLocalData(1, 'C');
        providerB.episodes = 12;
        for (let index = 0; index < 13; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.addOneWatchedEpisode(1);
        providerB.watchStatus = ListType.COMPLETED;
        providerB.episodes = 24;
        await series.addProviderDatas(providerA, providerB);
        assert.equal(await series.getCanSync(), false);
    });

    test('cant sync (3/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider('E'));
        const providerA = new ListProviderLocalData(1, 'E');
        providerA.episodes = 12;
        for (let index = 0; index < 12; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = ListType.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider('F', false));
        const providerB = new ListProviderLocalData(1, 'F');
        providerB.episodes = 24;
        for (let index = 0; index < 24; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.watchStatus = ListType.COMPLETED;
        // tslint:disable-next-line: no-string-literal
        providerB['episodes'] = 24;
        await anime.addProviderDatas(providerA, providerB);
        assert.equal(await anime.getCanSync(), false);
    });

    test('cant sync (4/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider('A'));
        const providerA = new ListProviderLocalData(1, 'A');
        providerA.episodes = 12;
        for (let index = 0; index < 12; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = ListType.CURRENT;
        // tslint:disable-next-line: no-string-literal
        providerA['episodes'] = 24;
        await anime.addProviderDatas(providerA);
        assert.equal(await anime.getCanSync(), false);
    });

    test('cant sync (5/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider('UU'));
        const providerA = new ListProviderLocalData(1, 'UU');
        providerA.episodes = 12;
        providerA.lastUpdate = new Date(100);
        for (let index = 1; index < 13; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = ListType.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider('JJ'));
        const providerB = new ListProviderLocalData(1, 'JJ');
        providerB.lastUpdate = new Date(50);
        for (let index = 1; index < 5; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        providerB.watchStatus = ListType.COMPLETED;
        // tslint:disable-next-line: no-string-literal
        providerB['episodes'] = 24;
        await anime.addProviderDatas(providerA, providerB);
        assert.equal(await anime.getCanSync(), false);
    });

    test('cant sync (6/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider('T'));
        const providerA = new ListProviderLocalData(1, 'T');
        providerA.lastUpdate = new Date(0);
        for (let index = 0; index < 12; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = ListType.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider('O'));
        const providerB = new ListProviderLocalData(1, 'O');
        providerB.episodes = 24;
        for (let index = 1; index < 25; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        ProviderList.getListProviderList().push(new TestProvider('M'));
        const providerC = new ListProviderLocalData(1, 'M');
        providerC.episodes = 24;
        for (let index = 1; index < 25; index++) {
            providerC.addOneWatchedEpisode(index);
        }
        providerC.watchStatus = ListType.COMPLETED;
        // tslint:disable-next-line: no-string-literal
        providerB['episodes'] = 24;
        await anime.addProviderDatas(providerA, providerB, providerC);
        assert.equal(await anime.getCanSync(), false);
    });

    test('cant sync (7/7)', async () => {
        const anime = new Series();
        ProviderList.getListProviderList().push(new TestProvider('TestProvider1'));
        const providerA = new ListProviderLocalData(1, 'TestProvider1');
        providerA.lastUpdate = new Date('2019-07-24T19:09:37.373Z');
        providerA.episodes = 12;
        for (let index = 1; index < 13; index++) {
            providerA.addOneWatchedEpisode(index);
        }
        providerA.watchStatus = ListType.CURRENT;
        ProviderList.getListProviderList().push(new TestProvider('TestProvider2'));
        const providerB = new ListProviderLocalData(1, 'TestProvider2');
        providerB.lastUpdate = new Date('2019-07-24T19:09:37.759Z');
        for (let index = 1; index < 13; index++) {
            providerB.addOneWatchedEpisode(index);
        }
        await anime.addProviderDatas(providerA, providerB);
        assert.equal(await anime.getCanSync(), false);
    });
});
