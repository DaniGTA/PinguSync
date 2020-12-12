import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import { SeasonSearchMode } from '../../../src/backend/helpFunctions/season-helper/season-search-mode';
import SeasonSearchModeHelper from '../../../src/backend/helpFunctions/season-helper/season-search-mode-helper';

// tslint:disable: no-string-literal
describe('Season Search Mode Helper Test | Examples', () => {
    beforeEach(() => {
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    });
    test('should perform title search', () => {
        expect(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.ALL)).toBeTruthy();
        expect(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.PREQUEL_TRACE_MODE)).toBeTruthy();
        expect(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.SEQUEL_TRACE_MODE)).toBeTruthy();
        expect(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.TITLE_ONLY)).toBeTruthy();
        expect(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS)).toBeTruthy();
    });
    test('should not perform title search', () => {
        expect(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.SEQUEL_TRACE_ONLY)).toBeFalsy();
        expect(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.TRACE_ONLY)).toBeFalsy();
        expect(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.PROVIDER_SEASON_VALUE_ONLY)).toBeFalsy();
        expect(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.SEQUEL_TRACE_ONLY)).toBeFalsy();
    });
});
