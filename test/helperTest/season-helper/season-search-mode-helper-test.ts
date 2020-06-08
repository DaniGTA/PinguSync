import { equal } from 'assert';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import { SeasonSearchMode } from '../../../src/backend/helpFunctions/season-helper/season-search-mode';
import SeasonSearchModeHelper from '../../../src/backend/helpFunctions/season-helper/season-search-mode-helper';
import { assert } from 'console';



// tslint:disable: no-string-literal
describe('Season Search Mode Helper Test | Examples', () => {
    beforeEach(() => {
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
    });
    // tslint:enable: no-string-literal
    test('should perform title search', async () => {
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.ALL), true);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.PREQUEL_TRACE_MODE), true);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.SEQUEL_TRACE_MODE), true);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.TITLE_ONLY), true);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS), true);
    });
    test('should not perform title search', async () => {
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.SEQUEL_TRACE_ONLY), false);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.TRACE_ONLY), false);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.PROVIDER_SEASON_VALUE_ONLY), false);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.SEQUEL_TRACE_ONLY), false);
    });
});
