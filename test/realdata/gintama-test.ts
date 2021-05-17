import AniDBHelper from '../../src/backend/api/information-providers/anidb/anidb-helper'
import AniDBProvider from '../../src/backend/api/information-providers/anidb/anidb-provider'
import AniListProvider from '../../src/backend/api/information-providers/anilist/anilist-provider'
import TraktProvider from '../../src/backend/api/information-providers/trakt/trakt-provider'
import ListController from '../../src/backend/controller/list-controller'
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager'
import Name from '../../src/backend/controller/objects/meta/name'
import { NameType } from '../../src/backend/controller/objects/meta/name-type'
import Series from '../../src/backend/controller/objects/series'
import ProviderDataListManager from '../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager'
import { ProviderInfoStatus } from '../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import { ListProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../src/backend/controller/provider-controller/provider-manager/provider-list'

describe('Basic List | Testrun', () => {
    beforeAll(() => {
        const anilistInstance = ProviderList.getProviderInstanceByClass(AniListProvider)
        if (!anilistInstance) {
            throw new Error()
        }
        jest.spyOn(anilistInstance, 'isUserLoggedIn').mockImplementation(async () => true)
        const traktInstance = ProviderList.getProviderInstanceByClass(TraktProvider)
        if (!traktInstance) {
            throw new Error()
        }
        jest.spyOn(traktInstance, 'isUserLoggedIn').mockImplementation(async () => true)
        const anidbNameManagerInstance = AniDBHelper['anidbNameManager']
        anidbNameManagerInstance.data = new AniDBProvider()['convertXmlToJson']()
    })

    beforeEach(() => {
        MainListManager['mainList'] = []
        ProviderDataListManager['providerDataList'] = []
    })

    test('should process the anime Gintama right', async () => {
        const series = new Series()
        const provider = new ListProviderLocalData(918, AniListProvider)
        provider.infoStatus = ProviderInfoStatus.ONLY_ID
        series.addListProvider(provider)

        await ListController.instance?.addSeriesToMainList(series)

        expect(MainListManager['mainList'].length).toBe(1)

        const updatedProviders = MainListManager['mainList'][0].getAllProviderLocalDatas()
    })
})
