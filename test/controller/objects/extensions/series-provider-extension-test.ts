import TraktProvider from '../../../../src/backend/api/information-providers/trakt/trakt-provider';
import InfoLocalDataBind from '../../../../src/backend/controller/objects/extension/provider-extension/binding/info-local-data-bind';
import ListLocalDataBind from '../../../../src/backend/controller/objects/extension/provider-extension/binding/list-local-data-bind';
import Season from '../../../../src/backend/controller/objects/meta/season';
import Series from '../../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderDataWithSeasonInfo from '../../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';


describe('Series provider extension tests', () => {
    test('should add providers with season info to series', () => {
        const series = new Series();

        const provider1 = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), new Season([2]));
        const provider2 = new ProviderDataWithSeasonInfo(new ListProviderLocalData(2));

        series.addProviderDatasWithSeasonInfos(...[provider1, provider2]);

        const result = series.getAllProviderLocalDatasWithSeasonInfo();

        expect(result.length).toBe(2);
    });

    test('should upgrade providers with season info to series', () => {
        const series = new Series();

        const provider1 = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider));

        series.addProviderDatasWithSeasonInfos(...[provider1]);

        const season = new Season([2]);
        const provider2 = new ProviderDataWithSeasonInfo(new ListProviderLocalData(1, TraktProvider), season);
        series.addProviderDatasWithSeasonInfos(...[provider2]);
        const result = series.getAllProviderLocalDatasWithSeasonInfo();

        expect(result.length).toBe(1);
        expect(result[0]?.seasonTarget).toBe(season);
    });

    test('should combine bindings and add them all without duplication', () => {
        const series = new Series();
        const season = new Season([2]);

        const binding1 = new ListLocalDataBind(new ListProviderLocalData(1));
        const binding2 = new ListLocalDataBind(new ListProviderLocalData(1), season);
        const binding3 = new InfoLocalDataBind(new InfoProviderLocalData(1));
        const binding4 = new InfoLocalDataBind(new InfoProviderLocalData(1), season);

        series.addAllBindings(...[binding1, binding2, binding3, binding4]);

        const allBindings = series.getAllProviderBindings();
        expect(allBindings.length).toBe(2);
        expect(allBindings[0].targetSeason).toBe(season);
    });

});
