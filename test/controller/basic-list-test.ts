import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import TestHelper from '../test-helper';
import Series from '../../src/backend/controller/objects/series';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import AniListProvider from '../../src/backend/api/anilist/anilist-provider';
import Name from '../../src/backend/controller/objects/meta/name';
import { ProviderInfoStatus } from '../../src/backend/controller/provider-manager/local-data/interfaces/provider-info-status';
import { strictEqual, fail, notStrictEqual } from 'assert';
import TraktProvider from '../../src/backend/api/trakt/trakt-provider';
import ResponseHelper from '../response-helper';

describe('Basic List | Testrun', () => {
    const lc = new ListController(true);

    before(() => {
       TestHelper.mustHaveBefore();
    });
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
    });

    it('should find other provider and mapping them.', async () => {
        const anilistInstance = ProviderList.getListProviderList().find((x) => x.providerName === AniListProvider.getInstance().providerName);
        anilistInstance.isUserLoggedIn = async () => true;
        const traktInstance = ProviderList.getListProviderList().find((x) => x.providerName === TraktProvider.getInstance().providerName);
        traktInstance.isUserLoggedIn = async () => true;
        const series = new Series();
        const provider = new ListProviderLocalData(101348, AniListProvider);
        provider.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series.addListProvider(provider);

        await ListController.instance.addSeriesToMainList(series);

        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 1);

        // tslint:disable-next-line: no-string-literal
        const updatedProviders = MainListManager['mainList'][0].getAllProviderLocalDatas();

        // provider should got been updated

        const anilistResult = updatedProviders.find(x => x.provider === AniListProvider.getInstance().providerName);
        const traktResult = updatedProviders.find(x => x.provider === TraktProvider.getInstance().providerName);
        if (anilistResult && traktResult) {
            notStrictEqual(await anilistResult.detailEpisodeInfo.length, 0);
            notStrictEqual(await traktResult.detailEpisodeInfo.length, 0);
            notStrictEqual(await anilistResult.getAllNames().length, 0);
            notStrictEqual(await traktResult.getAllNames().length, 0);
            strictEqual(traktResult.version, ProviderInfoStatus.ADVANCED_BASIC_INFO);
            strictEqual(anilistResult.version, ProviderInfoStatus.ADVANCED_BASIC_INFO);
        } else {
            fail();
        }
    });

    it('should find other provider and mapping two season together.', async () => {
        const anilistInstance = ProviderList.getListProviderList().find((x) => x.providerName === AniListProvider.getInstance().providerName);
        anilistInstance.isUserLoggedIn = async () => true;
        anilistInstance['webRequest'] = ResponseHelper.aniListResponse;
        const traktInstance = ProviderList.getListProviderList().find((x) => x.providerName === TraktProvider.getInstance().providerName);
        traktInstance.isUserLoggedIn = async () => true;
        traktInstance['traktRequest'] = ResponseHelper.traktRequest;

        // S1
        const series = new Series();
        const provider = new ListProviderLocalData(21202, AniListProvider);
        provider.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series.addListProvider(provider);

        await ListController.instance.addSeriesToMainList(series);

        // S2
        const series2 = new Series();
        const provider2 = new ListProviderLocalData(21699, AniListProvider);
        provider2.infoStatus = ProviderInfoStatus.ONLY_ID;
        await series2.addListProvider(provider2);

        await ListController.instance.addSeriesToMainList(series2);

        // tslint:disable-next-line: no-string-literal
        strictEqual(MainListManager['mainList'].length, 2);

        // tslint:disable-next-line: no-string-literal
        const updatedProviders = MainListManager['mainList'][0].getAllProviderLocalDatas();

        // provider should got been updated

        const anilistResult = updatedProviders.find(x => x.provider === AniListProvider.getInstance().providerName);
        const traktResult = updatedProviders.find(x => x.provider === TraktProvider.getInstance().providerName);
        if (anilistResult && traktResult) {
            notStrictEqual(await anilistResult.detailEpisodeInfo.length, 0);
            notStrictEqual(await traktResult.detailEpisodeInfo.length, 0);
            notStrictEqual(await anilistResult.getAllNames().length, 0);
            notStrictEqual(await traktResult.getAllNames().length, 0);
            strictEqual(traktResult.version, ProviderInfoStatus.ADVANCED_BASIC_INFO);
            strictEqual(anilistResult.version, ProviderInfoStatus.ADVANCED_BASIC_INFO);
        } else {
            fail();
        }
    });
});
