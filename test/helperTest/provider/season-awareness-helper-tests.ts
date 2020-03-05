import { strictEqual } from 'assert';
import AniDBProvider from '../../../src/backend/api/anidb/anidb-provider';
import KitsuProvider from '../../../src/backend/api/kitsu/kitsu-provider';
import MalProvider from '../../../src/backend/api/mal/mal-provider';
import TraktProvider from '../../../src/backend/api/trakt/trakt-provider';
import ListController from '../../../src/backend/controller/list-controller';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Season from '../../../src/backend/controller/objects/meta/season';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import SeasonAwarenessHelper from '../../../src/backend/helpFunctions/provider/season-awareness-helper/season-awareness-helper';
import ProviderDataListManager from '../../../src/backend/controller/provider-data-list-manager/provider-data-list-manager';



describe('Season Awareness Test', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new KitsuProvider(), new MalProvider(), new TraktProvider()];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [new AniDBProvider()];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
        ProviderDataListManager['providerDataList'] = [];
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
    });

    test('should detected as season unaware (no season)', async () => {
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), undefined);
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        strictEqual(result, false);
    });

    test('should detected as season unaware (undefined season number)', async () => {
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), new Season());
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        strictEqual(result, false);
    });

    test('should detected as season aware (already first season)', async () => {
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), new Season(1));
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        strictEqual(result, true);
    });

    test('should detected as season aware (unique id for season)', async () => {
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(2, MalProvider), new Season(2));
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        strictEqual(result, true);
    });

    test('should detected as season aware (unknown season)', async () => {
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), new Season(2));
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider]);
        strictEqual(result, false);
    });

    test('should detected as season aware (known season)', async () => {
        const seasonUnawareeProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), new Season(3, 1));
        const seasonAwareeProvider = new ProviderDataWithSeasonInfo(new InfoProviderLocalData(1, AniDBProvider), new Season(3, 1));
        const result = SeasonAwarenessHelper.isSeasonAware([seasonAwareeProvider, seasonUnawareeProvider]);
        strictEqual(result, true);

        const result2 = SeasonAwarenessHelper.isSeasonAware([seasonUnawareeProvider, seasonAwareeProvider]);
        strictEqual(result2, true);
    });
});
