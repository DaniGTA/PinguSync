import { rejects, strictEqual, throws } from 'assert';
import MultiProviderResult from '../../../src/backend/api/provider/multi-provider-result';
import ListController from '../../../src/backend/controller/list-controller';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import MainListEntryUpdater from '../../../src/backend/controller/main-list-manager/main-list-updater';
import WatchProgress from '../../../src/backend/controller/objects/meta/watch-progress';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import TestHelper from '../../test-helper';
import TestProvider from '../objects/testClass/testProvider';


describe('MainList | Entry update tests', () => {
    const lc = new ListController(true);

    beforeEach(() => {
        TestHelper.mustHaveBefore();
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('Test2')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
    });

    it('should update provider', async () => {
        const seriesA = new Series();
        const providerA = new ListProviderLocalData('test', 'Test');
        await seriesA.addProviderDatas(providerA);

        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [seriesA];

        const providerB = new ListProviderLocalData('test', 'Test');
        providerB.episodes = 10;
        const mpr = new MultiProviderResult(providerB);

        // Testing
        await new MainListEntryUpdater().updateSeries(mpr);

        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 1);
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'][0].getMaxEpisode(), 10);
    });

    it('should update provider and replace old data', async () => {
        const seriesA = new Series();
        const providerA = new ListProviderLocalData('test', 'Test');
        providerA.lastUpdate = new Date(200);
        providerA.addOneWatchProgress(new WatchProgress(1));
        await seriesA.addProviderDatas(providerA);

        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [seriesA];

        const providerB = new ListProviderLocalData('test', 'Test');
        providerB.episodes = 10;
        providerB.addOneWatchProgress(new WatchProgress(1));
        providerB.addOneWatchProgress(new WatchProgress(2));
        const mpr = new MultiProviderResult(providerB);

        // Testing
        await new MainListEntryUpdater().updateSeries(mpr);

        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 1);
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'][0].getMaxEpisode(), 10);
        // tslint:disable-next-line: no-string-literal
        const watchporgress = await MainListManager['mainList'][0].getLastWatchProgress();
        strictEqual(watchporgress.episode, 2);
    });

    it('should not update provider', async () => {
        const seriesA = new Series();
        const providerA = new ListProviderLocalData('test', 'Test');
        providerA.addOneWatchProgress(new WatchProgress(1));
        await seriesA.addProviderDatas(providerA);

        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [seriesA];

        const providerB = new ListProviderLocalData('test2', 'Test');
        providerB.episodes = 10;
        providerB.addOneWatchProgress(new WatchProgress(1));
        providerB.addOneWatchProgress(new WatchProgress(2));
        const mpr = new MultiProviderResult(providerB);

        // Testing
        await new MainListEntryUpdater().updateSeries(mpr);

        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 2);
        // tslint:disable-next-line: no-string-literal
        throws(MainListManager['mainList'][0].getMaxEpisode);
        // tslint:disable-next-line: no-string-literal
        rejects(MainListManager['mainList'][0].getLastWatchProgress);
    });

    it('should not affect other provider', async () => {
        const seriesA = new Series();
        const providerA = new ListProviderLocalData(2093, 'Test');
        providerA.lastUpdate = new Date(200);
        providerA.addOneWatchProgress(new WatchProgress(1));
        const providerC = new ListProviderLocalData('0', 'Test2');
        providerC.addOneWatchProgress(new WatchProgress(1));
        await seriesA.addProviderDatas(providerA, providerC);

        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [seriesA];

        const providerB = new ListProviderLocalData('2093', 'Test');
        providerB.episodes = 10;
        providerB.addOneWatchProgress(new WatchProgress(1));
        providerB.addOneWatchProgress(new WatchProgress(2));
        const mpr = new MultiProviderResult(providerB);

        // Testing
        await new MainListEntryUpdater().updateSeries(mpr);

        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 1);
        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'][0].getMaxEpisode(), 10);
        // tslint:disable-next-line: no-string-literal
        const watchporgress = await MainListManager['mainList'][0].getLastWatchProgress();
        strictEqual(watchporgress.episode, 2);

        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'][0].getAllProviderLocalDatas().length, 2);
    });

});
