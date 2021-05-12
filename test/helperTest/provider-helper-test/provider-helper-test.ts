import AniDBHelper from '../../../src/backend/api/information-providers/anidb/anidb-helper';
import AniDBProvider from '../../../src/backend/api/information-providers/anidb/anidb-provider';
import AniListProvider from '../../../src/backend/api/information-providers/anilist/anilist-provider';
import KitsuProvider from '../../../src/backend/api/information-providers/kitsu/kitsu-provider';
import MalProvider from '../../../src/backend/api/information-providers/mal/mal-provider';
import TraktProvider from '../../../src/backend/api/information-providers/trakt/trakt-provider';
import ExternalProvider from '../../../src/backend/api/provider/external-provider';
import InfoProvider from '../../../src/backend/api/provider/info-provider';
import ListProvider from '../../../src/backend/api/provider/list-provider';
import ListController from '../../../src/backend/controller/list-controller';
import MainListAdder from '../../../src/backend/controller/main-list-manager/main-list-adder';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import FailedProviderRequest from '../../../src/backend/controller/objects/meta/failed-provider-request';
import { FailedRequestError } from '../../../src/backend/controller/objects/meta/failed-request';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderNameManager from '../../../src/backend/controller/provider-controller/provider-manager/provider-name-manager';
import NewProviderHelper from '../../../src/backend/helpFunctions/provider/new-provider-helper';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import ProviderInfoHelper from '../../../src/backend/helpFunctions/provider/provider-info-helper';
import ProviderListHelper from '../../../src/backend/helpFunctions/provider/provider-list-helper';
import TestInfoProvider1 from './test-info-provider-1';
import TestInfoProvider2 from './test-info-provider-2';
import TestInfoProvider3 from './test-info-provider-3';

jest.mock('../../../src/backend/api/provider/external-provider');
// tslint:disable: no-string-literal
describe('Provider Helper Test', () => {
    beforeAll(() => {
        const wait = jest.fn();
        jest.fn().mockImplementation(() => {
            return { waitUntilItCanPerfomNextRequest: wait };
        });
        const anidbNameManagerInstance = AniDBHelper['anidbNameManager'];
        anidbNameManagerInstance.data = new AniDBProvider()['convertXmlToJson']();
    });

    beforeEach(() => {
        ProviderList['loadedListProvider'] = ProviderList['loadProviderList']([KitsuProvider, MalProvider, TraktProvider] as Array<(new () => ListProvider)>);
        ProviderList['loadedInfoProvider'] = ProviderList['loadProviderList']([
            TestInfoProvider1,
            TestInfoProvider2,
            TestInfoProvider3,
            AniDBProvider,
        ] as Array<(new () => InfoProvider)>);
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
        ProviderDataListManager['providerDataList'] = [];
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);

    });
    describe('Test function: canUpdateAnyProvider()', () => {
        test('should be true', () => {
            const series = new Series();
            const providerLocalData = new InfoProviderLocalData(1, TestInfoProvider1);
            providerLocalData.version--;

            series.addInfoProvider(providerLocalData);

            const result = NewProviderHelper.canUpdateAnyProvider(series);
            expect(result).toBe(true);
        });
        test('should be false', () => {
            const series = new Series();
            const providerLocalData = new InfoProviderLocalData(1, TestInfoProvider1);

            series.addInfoProvider(providerLocalData);

            const result = NewProviderHelper.canUpdateAnyProvider(series);
            expect(result).toBe(false);
        });

        test('should be false (provider has error)', () => {
            const series = new Series();
            series.addFailedRequest(
                new FailedProviderRequest(ProviderList.getProviderInstanceByClass(TestInfoProvider1), FailedRequestError.ProviderNotAvailble));
            const providerLocalData = new InfoProviderLocalData(1, TestInfoProvider1);
            providerLocalData.version--;

            series.addInfoProvider(providerLocalData);

            const result = NewProviderHelper.canUpdateAnyProvider(series);
            expect(result).toBe(false);
        });
    });


    test('It should get all list provider that need a update', async () => {
        // Series A
        const series = new Series();
        series.addProviderDatas(new InfoProviderLocalData(1, TestInfoProvider1));
        series.addProviderDatas(new InfoProviderLocalData(1, TestInfoProvider2));
        // tslint:disable-next-line: no-string-literal
        const result = await ProviderInfoHelper['getInfoProviderThatNeedUpdates'](series.getAllProviderLocalDatas());
        expect(result.length).toBe(2);
    });

    test('should sort provider that need updates right (1/3)', () => {
        const providersThatNeedsAUpdate: ExternalProvider[] = [];

        providersThatNeedsAUpdate.push(AniListProvider.getInstance());
        providersThatNeedsAUpdate.push(TraktProvider.getInstance());
        providersThatNeedsAUpdate.push(KitsuProvider.getInstance());

        const currentProviderData: ProviderLocalData[] = [];
        currentProviderData.push(new ListProviderLocalData(1, TraktProvider));

        // tslint:disable-next-line: no-string-literal
        providersThatNeedsAUpdate.sort((a, b) => ProviderListHelper['sortProvidersThatNeedUpdates'](a, b, currentProviderData));

        expect(providersThatNeedsAUpdate[0].providerName).toBe(TraktProvider.getInstance().providerName);
    });

    test('should sort provider that need updates right (2/3)', () => {
        const providersThatNeedsAUpdate: ExternalProvider[] = [];

        providersThatNeedsAUpdate.push(AniListProvider.getInstance());
        providersThatNeedsAUpdate.push(KitsuProvider.getInstance());
        providersThatNeedsAUpdate.push(TraktProvider.getInstance());

        const currentProviderData: ProviderLocalData[] = [];
        currentProviderData.push(new ListProviderLocalData(1, TraktProvider));

        // tslint:disable-next-line: no-string-literal
        providersThatNeedsAUpdate.sort((a, b) => ProviderListHelper['sortProvidersThatNeedUpdates'](a, b, currentProviderData));

        expect(providersThatNeedsAUpdate[0].providerName).toBe(TraktProvider.getInstance().providerName);
    });


    test('should sort provider that need updates right (3/3)', () => {
        const providersThatNeedsAUpdate: ExternalProvider[] = [];

        providersThatNeedsAUpdate.push(TraktProvider.getInstance());
        providersThatNeedsAUpdate.push(AniListProvider.getInstance());
        providersThatNeedsAUpdate.push(KitsuProvider.getInstance());

        const currentProviderData: ProviderLocalData[] = [];
        currentProviderData.push(new ListProviderLocalData(1, TraktProvider));

        // tslint:disable-next-line: no-string-literal
        providersThatNeedsAUpdate.sort((a, b) => ProviderListHelper['sortProvidersThatNeedUpdates'](a, b, currentProviderData));

        expect(providersThatNeedsAUpdate[0].providerName).toBe(TraktProvider.getInstance().providerName);
    });

    test('should create season awareness', async () => {
        const mainListAdder = new MainListAdder();
        const series: Series = new Series();
        const provider = new ListProviderLocalData(94084, TraktProvider);

        series.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider, new Season(3)));
        await mainListAdder.addSeries(series);
        const infoProvider = series.getAllProviderLocalDatas();

        const anidbProvider = infoProvider.find((x) => x.provider === ProviderNameManager.getProviderName(AniDBProvider));
        if (anidbProvider) {
            expect(anidbProvider.id).toBe(13244);
            expect(series.getProviderSeasonTarget(anidbProvider.provider)?.getSingleSeasonNumberAsNumber()).toBe(3);
            expect(series.getProviderSeasonTarget(anidbProvider.provider)?.seasonPart).toBe(1);
        } else {
            throw new Error('no provider');
        }
    });
});
