import TestHelper from "../../../test-helper";
import Series from "../../../../src/backend/controller/objects/series";
import ProviderDataWithSeasonInfo from "../../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info";
import { ListProviderLocalData } from "../../../../src/backend/controller/provider-manager/local-data/list-provider-local-data";
import { strictEqual } from "assert";
import TraktProvider from "../../../../src/backend/api/trakt/trakt-provider";
import Season from "../../../../src/backend/controller/objects/meta/season";

describe('Series provider extension tests', () => {
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });

    test('should add providers with season info to series', async () => {
        const series = new Series();

        const provider1 = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), new Season(2));
        const provider2 = new ProviderDataWithSeasonInfo(new ListProviderLocalData(2));

        await series.addProviderDatasWithSeasonInfos(...[provider1, provider2]);

        const result = series.getAllProviderLocalDatasWithSeasonInfo();

        strictEqual(result.length, 2);
    });

});
