import ListController from '../src/backend/controller/list-controller';
import MainListLoader from '../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../src/backend/controller/main-list-manager/main-list-manager';
import ProviderDataListLoader from '../src/backend/controller/provider-data-list-manager/provider-data-list-loader';
import ProviderDataListManager from '../src/backend/controller/provider-data-list-manager/provider-data-list-manager';
import WebRequestManager from '../src/backend/controller/web-request-manager/web-request-manager';
import ResponseHelper from './response-helper';
import ExternalProvider from '../src/backend/api/provider/external-provider';
import AniDBProvider from '../src/backend/api/anidb/anidb-provider';

console.log('test setup');
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

WebRequestManager.request = ResponseHelper.mockRequest;

jest.spyOn<any, any>(AniDBProvider.prototype, 'getData').mockImplementation(jest.fn());
const t = jest.spyOn(ExternalProvider.prototype, 'waitUntilItCanPerfomNextRequest').mockImplementation(jest.fn());
t
new ListController(true);

