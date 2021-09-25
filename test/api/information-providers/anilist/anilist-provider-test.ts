import AniDBProvider from '../../../../src/backend/api/information-providers/anidb/anidb-provider'
import AniListProvider from '../../../../src/backend/api/information-providers/anilist/anilist-provider'
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data'
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list'

describe('Provider: AniList | Online Test runs', () => {
    beforeAll(() => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = undefined
        ProviderList['loadedMappingProvider'] = []
    })
    test('should get id 704', async () => {
        const a = new AniListProvider()
        const lpdld = new ListProviderLocalData(704, a)

        const result = await a.getFullInfoById(lpdld)

        expect(result.mainProvider.providerLocalData.id).toBe(704)
    })

    test('should find Hataraku Saibou', async () => {
        const a = new AniListProvider()
        const result = await a.getMoreSeriesInfoByName('Hataraku Saibou')

        expect(result[0].mainProvider.providerLocalData.id).toBe(0)
    })
})
