import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';

import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';

import { equal } from 'assert';
import ListController from '../../../src/backend/controller/list-controller';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import { SeasonSearchMode } from '../../../src/backend/helpFunctions/season-helper/season-search-mode';
import SeasonSearchModeHelper from '../../../src/backend/helpFunctions/season-helper/season-search-mode-helper';



// tslint:disable: no-string-literal
describe('Season Search Mode Helper Test | Examples', () => {
    before(() => {
        // tslint:disable-next-line: no-string-literal
        MainListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-string-literal
        MainListLoader['loadData'] = () => [];
        // tslint:disable-next-line: no-string-literal tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
    });
    beforeEach(() => {
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
    });
    // tslint:enable: no-string-literal
    it('should perform title search', async () => {
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.ALL), true);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.PREQUEL_TRACE_MODE), true);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.SEQUEL_TRACE_MODE), true);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.TITLE_ONLY), true);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.NO_EXTRA_TRACE_REQUESTS), true);
    });
    it('should not perform title search', async () => {
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.SEQUEL_TRACE_ONLY), false);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.TRACE_ONLY), false);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.PROVIDER_SEASON_VALUE_ONLY), false);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.TITLE_ONLY), false);
        equal(SeasonSearchModeHelper.canPerformATitleSearch(SeasonSearchMode.SEQUEL_TRACE_ONLY), false);
    });
});
