import moment from 'moment'
import TMDBProvider from '../../../../src/backend/api/information-providers/tmdb/tmdb-provider'
import { MediaType } from '../../../../src/backend/controller/objects/meta/media-type'
import { InfoProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data'

describe('Provider: TMDB | Online Test runs', () => {
    let dateNowSpy: jest.SpyInstance<number, []>

    beforeAll(() => {
        dateNowSpy = jest.spyOn(moment, 'now').mockImplementation(() => new Date(Date.UTC(2021, 5, 5)).valueOf())
    })

    afterAll(() => {
        dateNowSpy.mockRestore()
    })
    test('should find Death Note', async () => {
        const a = new TMDBProvider()

        const result = await a.getMoreSeriesInfoByName('Death Note')

        expect(result[0].mainProvider.providerLocalData.id).toBe(13916)
    })

    test('get details for Gintama', async () => {
        const a = new TMDBProvider()
        const data = new InfoProviderLocalData(57041, TMDBProvider)
        data.mediaType = MediaType.ANIME

        const result = await a.getFullInfoById(data)

        expect(result.mainProvider.providerLocalData.id).toBe(57041)
    }, 15000)
})
