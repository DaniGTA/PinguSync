/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */
import AniDBProvider from '../src/backend/api/information-providers/anidb/anidb-provider'
import ExternalProvider from '../src/backend/api/provider/external-provider'
import ListController from '../src/backend/controller/list-controller'
import MainListManager from '../src/backend/controller/main-list-manager/main-list-manager'
import MainListPath from '../src/backend/controller/main-list-manager/main-list-path'
import ProviderDataListLoader from '../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-loader'
import ProviderDataListManager from '../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager'
import ResponseHelper from './response-helper'
import SettingsManager from '../src/backend/controller/settings/settings-manager'
import MainListSaver from '../src/backend/controller/main-list-manager/main-list-saver'
import AnimeOfflineDatabaseProviderData from '../src/backend/api/mapping-providers/anime-offline-database/anime-offline-database-provider-data'
import 'threads/register'
import logger from '../src/backend/logger/logger'
import winston, { format } from 'winston'
// eslint-disable-next-line @typescript-eslint/no-var-requires

ResponseHelper.mockRequest()
// tslint:disable: no-string-literal
MainListManager['listLoaded'] = true
MainListManager['mainList'] = []
MainListPath.getPath = (): string => '/////- no path for testing -'
// tslint:disable-next-line: no-empty
MainListSaver.saveMainList = jest.fn()

ProviderDataListManager['listLoaded'] = true
// tslint:disable-next-line: no-empty
ProviderDataListLoader['saveData'] = jest.fn()
ProviderDataListLoader['loadData'] = (): [] => []
ProviderDataListManager['providerDataList'] = []
AniDBProvider.prototype['downloadFile'] = async (): Promise<string> => {
    throw new Error('Cant request file in test.')
}
/**
 * Disable I/O Functions for tests.
 */
jest.spyOn(ExternalProvider.prototype, 'waitUntilItCanPerfomNextRequest').mockImplementation(jest.fn())
jest.spyOn(SettingsManager.prototype, 'save' as any).mockImplementation(jest.fn())
jest.spyOn(AnimeOfflineDatabaseProviderData.prototype, 'saveData' as any).mockImplementation(jest.fn())
// tslint:disable-next-line: no-unused-expression
new ListController(true)

logger.on('data', function(log) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (log?.timestamp !== undefined && log?.level !== undefined && log?.message !== undefined) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        //addMsg(`${log.timestamp} ${log.level}: ${log.message}`)
    }
})
logger.info('Finished env setup')
logger.level = 'debug'
