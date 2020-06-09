import * as assert from 'assert';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Name from '../../../src/backend/controller/objects/meta/name';
import { NameType } from '../../../src/backend/controller/objects/meta/name-type';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import { SeasonSearchMode } from '../../../src/backend/helpFunctions/season-helper/season-search-mode';

describe('Series | Basic', () => {
    beforeEach(() => {
        // tslint:disable: no-string-literal
        MainListManager['mainList'] = [];
        ProviderDataListManager['providerDataList'] = [];
    });
    test('should have a id', async () => {
        const series = new Series();
        assert.notEqual(series.id.length, 0);
        return;
    });

    test('should all episodes (1/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'TestA');
        providerA.episodes = 10;
        const providerB = new ListProviderLocalData(1, 'TestB');
        providerB.episodes = 11;
        await series.addProviderDatas(providerA, providerB);
        const allEpisodes = await series.getAllEpisodes();
        assert.equal(allEpisodes[0], 10);
        assert.equal(allEpisodes[1], 11);
        assert.equal(allEpisodes.length, 2);
        return;
    });

    test('should all episodes (2/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'A');
        providerA.episodes = 10;
        const providerB = new ListProviderLocalData(1, 'B');
        providerB.episodes = 11;
        await series.addProviderDatas(providerA, providerB);
        assert.deepEqual(await series.getAllEpisodes(), [10, 11]);
        return;
    });

    test('should all episodes (3/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1);

        await series.addListProvider(providerA);
        assert.deepStrictEqual(await series.getAllEpisodes(), []);
        return;
    });

    test('should max episode (1/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'TestA');
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData(1, 'TestB');
        providerB.episodes = 11;
        await series.addProviderDatas(providerA, providerB);
        assert.equal(series.getMaxEpisode(), 12);
        return;
    });

    test('should max episode (2/3)', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1, 'TestA');
        providerA.episodes = 12;
        const providerB = new ListProviderLocalData(1, 'TestB');
        providerB.episodes = 24;
        await series.addProviderDatas(providerA, providerB);
        assert.equal(series.getMaxEpisode(), 24);
        return;
    });



    test('should prevent duplicates in names', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1);
        providerA.addSeriesName(new Name('Test', 'eng'));
        providerA.addSeriesName(new Name('Test', 'eng'));
        await series.addListProvider(providerA);
        assert.strictEqual((series.getAllNames()).length, 1);
    });

    test('should prevent null entrys in names', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1);
        providerA.addSeriesName(null as unknown as Name);
        await series.addListProvider(providerA);
        assert.strictEqual((series.getAllNames()).length, 0);
    });

    test('should prevent undefined entrys in names', async () => {
        const series = new Series();
        const providerA = new ListProviderLocalData(1);
        providerA.addSeriesName(undefined as unknown as Name);
        await series.addListProvider(providerA);
        assert.strictEqual((series.getAllNames()).length, 0);
    });

    test('should replace existing info provider binding', async () => {
        const series = new Series();
        const provider1 = new InfoProviderLocalData(1, 'test');
        const provider2 = new InfoProviderLocalData(2, 'test');

        await series.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider1, new Season([3])));
        await series.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider2, new Season([3])));

        assert.strictEqual(series.getAllProviderBindings()[0].id, 2);
    });

    test('should extract season number from series', async () => {
        const series = new Series();
        const provider = new ListProviderLocalData(-1, '');
        provider.addSeriesName(new Name('title-2nd-season', 'slug', NameType.SLUG));
        await series.addProviderDatas(provider);
        const season = series.getSeason(SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS);
        assert.strictEqual((await season).getSingleSeasonNumberAsNumber(), 2);
    });
});
