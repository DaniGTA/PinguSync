import AniDBProvider from '../src/backend/api/information-providers/anidb/anidb-provider';
import ExternalProvider from '../src/backend/api/provider/external-provider';
import ListController from '../src/backend/controller/list-controller';
import MainListManager from '../src/backend/controller/main-list-manager/main-list-manager';
import MainListPath from '../src/backend/controller/main-list-manager/main-list-path';
import ProviderDataListLoader from '../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-loader';
import ProviderDataListManager from '../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import ResponseHelper from './response-helper';
import SettingsManager from '../src/backend/controller/settings/settings-manager';
import MainListSaver from '../src/backend/controller/main-list-manager/main-list-saver';
import AnimeOfflineDatabaseProviderData from '../src/backend/api/mapping-providers/anime-offline-database/anime-offline-database-provider-data';

ResponseHelper.mockRequest();
// tslint:disable: no-string-literal
MainListManager['listLoaded'] = true;
MainListManager['mainList'] = [];
MainListPath.getPath = () => '/////- no path for testing -';
// tslint:disable-next-line: no-empty
MainListSaver.saveMainList = jest.fn();

ProviderDataListManager['listLoaded'] = true;
// tslint:disable-next-line: no-empty
ProviderDataListLoader['saveData'] = jest.fn();
ProviderDataListLoader['loadData'] = () => [];
ProviderDataListManager['providerDataList'] = [];
AniDBProvider.prototype['downloadFile'] = async () => { throw new Error('Cant request file in test.'); };
jest.spyOn(ExternalProvider.prototype, 'waitUntilItCanPerfomNextRequest').mockImplementation(jest.fn());
jest.spyOn(SettingsManager.prototype, 'save' as any).mockImplementation(jest.fn());
jest.spyOn(AnimeOfflineDatabaseProviderData.prototype, 'saveData' as any).mockImplementation(jest.fn());
// tslint:disable-next-line: no-unused-expression
new ListController(true);
