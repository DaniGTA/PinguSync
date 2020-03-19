import AniDBProvider from '../src/backend/api/information-providers/anidb/anidb-provider';
import ExternalProvider from '../src/backend/api/provider/external-provider';
import ListController from '../src/backend/controller/list-controller';
import MainListLoader from '../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../src/backend/controller/main-list-manager/main-list-manager';
import ProviderDataListLoader from '../src/backend/controller/provider-data-list-manager/provider-data-list-loader';
import ProviderDataListManager from '../src/backend/controller/provider-data-list-manager/provider-data-list-manager';
import ResponseHelper from './response-helper';

ResponseHelper.mockRequest();
// tslint:disable: no-string-literal
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
AniDBProvider.prototype['downloadFile'] = async () => { throw new Error('Cant request file in test.'); };
jest.spyOn(ExternalProvider.prototype, 'waitUntilItCanPerfomNextRequest').mockImplementation(jest.fn());

// tslint:disable-next-line: no-unused-expression
new ListController(true);
