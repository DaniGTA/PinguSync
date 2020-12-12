import AniListProvider from '../../../src/backend/api/information-providers/anilist/anilist-provider';
import TraktProvider from '../../../src/backend/api/information-providers/trakt/trakt-provider';
import MultiProviderResult from '../../../src/backend/api/provider/multi-provider-result';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import MainListSearcher from '../../../src/backend/controller/main-list-manager/main-list-searcher';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderLoader from '../../../src/backend/controller/provider-controller/provider-manager/provider-loader';
import ProviderNameManager from '../../../src/backend/controller/provider-controller/provider-manager/provider-name-manager';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import TestListProvider from '../objects/testClass/testListProvider';

// tslint:disable: no-string-literal
describe('MainList | Searcher tests', () => {

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ProviderLoader.prototype as any).listOfListProviders = [TestListProvider];
        ProviderList['loadedInfoProvider'] = [];
    });

    test('should find series', async () => {
        const searcher = new MainListSearcher();

        const series1 = new Series();
        const provider1 = new ListProviderLocalData(1, ProviderNameManager.getProviderName(TraktProvider));
        series1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider1, new Season([1])));


        const series2 = new Series();
        const provider2 = new ListProviderLocalData(1, ProviderNameManager.getProviderName(TraktProvider));
        series2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider2, new Season([2])));

        const series3 = new Series();
        const provider3 = new ListProviderLocalData(1, ProviderNameManager.getProviderName(TraktProvider));
        series3.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider3, new Season([1])));

        MainListManager['mainList'] = [series1, series2];

        const result = await searcher['quickFindSameSeriesInList'](series3, MainListManager['mainList']);

        expect(result.length).toBe(1);
    });

    test('should find series 2', () => {

        ProviderList['loadedListProvider'] = [new TraktProvider(), new AniListProvider()];

        const series1 = new Series();
        const provider1 = new ListProviderLocalData(1, ProviderNameManager.getProviderName(TraktProvider));
        series1.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider1, new Season([1])));


        const series2 = new Series();
        const provider2 = new ListProviderLocalData(1, ProviderNameManager.getProviderName(TraktProvider));
        series2.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider2, new Season([2])));

        const series3 = new Series();
        const provider3 = new ListProviderLocalData(1, ProviderNameManager.getProviderName(AniListProvider));
        series3.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider3, new Season([1])));

        MainListManager['mainList'] = [series1, series2, series3];

        const search = new MultiProviderResult(new ListProviderLocalData(1, ProviderNameManager.getProviderName(TraktProvider)));
        const result = MainListSearcher.findSeriesWithMultiProviderResult(search);
        expect(result).toBe(series1);

    });

    describe('test fn: findSeriesById', () => {
        test('should find Series by Id', async () => {
            const series = new Series();
            MainListManager['mainList'].push(series);
            const result = await MainListSearcher.findSeriesById(series.id);
            expect(result?.id).toBe(series.id);
        });

        test('should return on no result', async () => {
            const result = await MainListSearcher.findSeriesById('id');
            expect(result).toBeNull();
        });
    });

});

