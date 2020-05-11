import AniDBProvider from '../../../src/backend/api/information-providers/anidb/anidb-provider';
import KitsuProvider from '../../../src/backend/api/information-providers/kitsu/kitsu-provider';
import MalProvider from '../../../src/backend/api/information-providers/mal/mal-provider';
import TraktProvider from '../../../src/backend/api/information-providers/trakt/trakt-provider';
import InfoProvider from '../../../src/backend/api/provider/info-provider';
import ListProvider from '../../../src/backend/api/provider/list-provider';
import ListController from '../../../src/backend/controller/list-controller';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Season from '../../../src/backend/controller/objects/meta/season';
import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import SeasonAwarenessHelper from '../../../src/backend/helpFunctions/provider/season-awareness-helper/season-awareness-helper';

describe('Season Awareness Test', () => {
    beforeEach(() => {
        // tslint:disable no-string-literal
        ProviderList['loadedListProvider'] = ProviderList['loadProviderList']([KitsuProvider, MalProvider, TraktProvider] as Array<(new () => ListProvider)>);
        ProviderList['loadedInfoProvider'] = ProviderList['loadProviderList']([AniDBProvider] as Array<(new () => InfoProvider)>);
        MainListManager['mainList'] = [];
        ProviderDataListManager['providerDataList'] = [];
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
    });

    test('should detected as season unaware (no season)', () => {
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), undefined);
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        expect(result).toBeFalsy();
    });

    test('should detected as season unaware (undefined season number)', () => {
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), new Season());
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        expect(result).toBeFalsy();
    });

    test('should detected as season aware (already first season)', () => {
        const season = new Season(1);
        season.confirmed = true;
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), season);
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        expect(result).toBeTruthy();
    });

    test('should detected as season aware (unique id for season)', () => {
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(2, MalProvider), new Season(2));
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        expect(result).toBeTruthy();
    });

    test('should detected as season aware (unknown season)', () => {
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), new Season(2));
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        expect(result).toBeFalsy();
    });

    test('should detected as season aware (known season)', () => {
        const seasonUnawareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), new Season(3, 1));
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new InfoProviderLocalData(1, AniDBProvider), new Season(3, 1));
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider, seasonUnawareeProvider]);
        expect(result).toBeTruthy();

        const result2 = SeasonAwarenessHelper.isSeasonAware([seasonUnawareeProvider, seasonAwareeProvider]);
        expect(result2).toBeTruthy();
    });
});
