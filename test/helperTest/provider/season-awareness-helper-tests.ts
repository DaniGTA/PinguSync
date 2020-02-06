import TestHelper from "../../test-helper";
import ProviderList from "../../../src/backend/controller/provider-manager/provider-list";
import KitsuProvider from "../../../src/backend/api/kitsu/kitsu-provider";
import MalProvider from "../../../src/backend/api/mal/mal-provider";
import MainListManager from "../../../src/backend/controller/main-list-manager/main-list-manager";
import ListController from "../../../src/backend/controller/list-controller";
import dateHelper from "../../../src/backend/helpFunctions/date-helper";
import { equal, strictEqual } from "assert";
import ProviderDataWithSeasonInfo from "../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info";
import ProviderLocalData from "../../../src/backend/controller/provider-manager/local-data/interfaces/provider-local-data";
import { ListProviderLocalData } from "../../../src/backend/controller/provider-manager/local-data/list-provider-local-data";
import TraktProvider from "../../../src/backend/api/trakt/trakt-provider";
import SeasonAwarenessHelper from "../../../src/backend/helpFunctions/provider/season-awareness-helper";
import Season from "../../../src/backend/controller/objects/meta/season";


describe('Date Helper Test', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new KitsuProvider(), new MalProvider(), new TraktProvider()];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
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
});
