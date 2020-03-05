import ListController from '../src/backend/controller/list-controller';
import MainListLoader from '../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../src/backend/controller/main-list-manager/main-list-manager';
import ProviderDataListLoader from '../src/backend/controller/provider-data-list-manager/provider-data-list-loader';
import ProviderDataListManager from '../src/backend/controller/provider-data-list-manager/provider-data-list-manager';
import WebRequestManager from '../src/backend/controller/web-request-manager/web-request-manager';
import ResponseHelper from './response-helper';
export default class TestHelper {
    // tslint:disable: no-string-literal
    /**
     * This disables loading from files and saving data to files and it  clears all data lists.
     * Adds a caching system for webrequests
     */
    public static mustHaveBefore() {

    }
}
