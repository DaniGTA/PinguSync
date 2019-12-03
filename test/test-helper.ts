import ListController from '../src/backend/controller/list-controller';
import MainListLoader from '../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../src/backend/controller/main-list-manager/main-list-manager';
import ProviderDataListLoader from '../src/backend/controller/provider-data-list-manager/provider-data-list-loader';
import ProviderDataListManager from '../src/backend/controller/provider-data-list-manager/provider-data-list-manager';
export default class TestHelper {
    // tslint:disable: no-string-literal
    public static mustHaveBefore() {
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
        MainListManager['listLoaded'] = true;
        MainListLoader['loadData'] = () => [];
        MainListManager['mainList'] = [];
        // tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };

        ProviderDataListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-empty
        ProviderDataListLoader['saveData'] = async () => { };
        ProviderDataListLoader['loadData'] = () => [];
        ProviderDataListManager['providerDataList'] = [];
    }
}
