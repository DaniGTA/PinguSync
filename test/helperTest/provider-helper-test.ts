import { equal, strictEqual } from 'assert';
import AniDBProvider from '../../src/backend/api/anidb/anidb-provider';
import AniListProvider from '../../src/backend/api/anilist/anilist-provider';
import KitsuProvider from '../../src/backend/api/kitsu/kitsu-provider';
import MalProvider from '../../src/backend/api/mal/mal-provider';
import ExternalProvider from '../../src/backend/api/provider/external-provider';
import ListProvider from '../../src/backend/api/provider/list-provider';
import TraktProvider from '../../src/backend/api/trakt/trakt-provider';
import ListController from '../../src/backend/controller/list-controller';
import MainListAdder from '../../src/backend/controller/main-list-manager/main-list-adder';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import Season from '../../src/backend/controller/objects/meta/season';
import Series from '../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../src/backend/controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import ProviderNameManager from '../../src/backend/controller/provider-manager/provider-name-manager';
import dateHelper from '../../src/backend/helpFunctions/date-helper';
import ProviderHelper from '../../src/backend/helpFunctions/provider/provider-helper';
import ProviderDataWithSeasonInfo from '../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import TestInfoProvider from '../controller/objects/testClass/testInfoProvider';
import TestHelper from '../test-helper';
jest.mock('../../src/backend/api/provider/external-provider');
describe('Provider Helper Test', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new KitsuProvider(), new MalProvider(), new TraktProvider()];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [new TestInfoProvider('test1'), new TestInfoProvider('test2'), new TestInfoProvider('test3'), new AniDBProvider()];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
        const wait = jest.fn();
        jest.fn().mockImplementation(() => {
            return { waitUntilItCanPerfomNextRequest: wait };
        });
    });

    test('It should find that it can get id from other provider', async () => {
        // Series A
        const series = new Series();
        const listProvider = new ListProviderLocalData(1, 'Kitsu');
        await series.addProviderDatas(listProvider);
        // tslint:disable-next-line: no-string-literal
        const pList = ProviderList['loadedListProvider'];
        let provider: ListProvider | null = null;
        if (pList && pList[1]) {
            provider = pList[1];
        }
        let result: boolean = false;
        if (provider) {
            // tslint:disable-next-line: no-string-literal
            result = ProviderHelper['canGetTargetIdFromCurrentProvider'](listProvider, provider);
        }
        equal(result, true);
    });

    test('It should get all list provider that need a update', async () => {
        // Series A
        const series = new Series();
        await series.addProviderDatas(new InfoProviderLocalData(1, 'test1'));
        await series.addProviderDatas(new InfoProviderLocalData(1, 'test2'));
        // tslint:disable-next-line: no-string-literal
        const result = await ProviderHelper['getInfoProviderThatNeedUpdates'](series.getAllProviderLocalDatas());
        equal(result.length, 2);
    });

    test('should update series', async () => {
        const series = new Series();
        series.lastInfoUpdate = dateHelper.removeDays(new Date(), 31).getTime();
        // tslint:disable-next-line: no-string-literal
        const result1 = ProviderHelper['canUpdateSeries'](series);
        strictEqual(result1, true);
    });

    test('should not update series', async () => {
        const series = new Series();
        series.lastInfoUpdate = dateHelper.removeDays(new Date(), 15).getTime();
        // tslint:disable-next-line: no-string-literal
        const result1 = ProviderHelper['canUpdateSeries'](series);
        strictEqual(result1, false);
    });

    test('should sort provider that need updates right (1/3)', async () => {
        const providersThatNeedsAUpdate: ExternalProvider[] = [];

        providersThatNeedsAUpdate.push(AniListProvider.getInstance());
        providersThatNeedsAUpdate.push(TraktProvider.getInstance());
        providersThatNeedsAUpdate.push(KitsuProvider.getInstance());

        const currentProviderData: ProviderLocalData[] = [];
        currentProviderData.push(new ListProviderLocalData(1, TraktProvider));

        // tslint:disable-next-line: no-string-literal
        providersThatNeedsAUpdate.sort((a, b) => ProviderHelper['sortProvidersThatNeedUpdates'](a, b, currentProviderData));

        strictEqual(providersThatNeedsAUpdate[0].providerName, TraktProvider.getInstance().providerName);
    });

    test('should sort provider that need updates right (2/3)', async () => {
        const providersThatNeedsAUpdate: ExternalProvider[] = [];

        providersThatNeedsAUpdate.push(AniListProvider.getInstance());
        providersThatNeedsAUpdate.push(KitsuProvider.getInstance());
        providersThatNeedsAUpdate.push(TraktProvider.getInstance());

        const currentProviderData: ProviderLocalData[] = [];
        currentProviderData.push(new ListProviderLocalData(1, TraktProvider));

        // tslint:disable-next-line: no-string-literal
        providersThatNeedsAUpdate.sort((a, b) => ProviderHelper['sortProvidersThatNeedUpdates'](a, b, currentProviderData));

        strictEqual(providersThatNeedsAUpdate[0].providerName, TraktProvider.getInstance().providerName);
    });


    test('should sort provider that need updates right (3/3)', async () => {
        const providersThatNeedsAUpdate: ExternalProvider[] = [];

        providersThatNeedsAUpdate.push(TraktProvider.getInstance());
        providersThatNeedsAUpdate.push(AniListProvider.getInstance());
        providersThatNeedsAUpdate.push(KitsuProvider.getInstance());

        const currentProviderData: ProviderLocalData[] = [];
        currentProviderData.push(new ListProviderLocalData(1, TraktProvider));

        // tslint:disable-next-line: no-string-literal
        providersThatNeedsAUpdate.sort((a, b) => ProviderHelper['sortProvidersThatNeedUpdates'](a, b, currentProviderData));

        strictEqual(providersThatNeedsAUpdate[0].providerName, TraktProvider.getInstance().providerName);
    });

    test('should create season awareness', async () => {
        const mainListAdder = new MainListAdder();
        const series: Series = new Series();
        const provider = new ListProviderLocalData(94084, TraktProvider.getInstance().providerName);

        await series.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(provider, new Season(3)));
        await mainListAdder.addSeries(series);
        const infoProvider = series.getAllProviderLocalDatas();

        const anidbProvider = infoProvider.find((x) => x.provider === ProviderNameManager.getProviderName(AniDBProvider));
        if (anidbProvider) {
            strictEqual(anidbProvider.id, '13658');
            strictEqual(series.getProviderSeasonTarget(anidbProvider.provider)?.getSingleSeasonNumberAsNumber(), 3);
            strictEqual(series.getProviderSeasonTarget(anidbProvider.provider)?.seasonPart, 2);

        } else {
            fail();
        }
    });
});
