import TMDBProvider from '../../../../src/backend/api/information-providers/tmdb/tmdb-provider'
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list'

describe('Provider: TMDB | Online Test runs', () => {
    beforeAll(() => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = undefined
        ProviderList['loadedMappingProvider'] = []
    })

    test('should find Death Note', async () => {
        const a = new TMDBProvider()

        const result = await a.getMoreSeriesInfoByName('Death Note')

        expect(result[0].mainProvider.providerLocalData.id).toBe('14444')
    })
})
