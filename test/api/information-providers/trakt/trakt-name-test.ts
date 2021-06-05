/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list'
import TraktProvider from '../../../../src/backend/api/information-providers/trakt/trakt-provider'
import nock from 'nock'

describe('Provider: Trakt | username/name get tested', () => {
    const traktProviderInstance = ProviderList.getProviderInstanceByClass(TraktProvider)

    test('should get name', async () => {
        nock('https://api.trakt.tv')
            .get('/users/Sean Rudford')
            .reply(
                200,
                '{"username":"sean","private":false,"name":"Sean Rudford","vip":true,"vip_ep":true,"ids":{"slug":"sean"}}'
            )
        traktProviderInstance.userData.userName = 'Sean Rudford'
        const a = await traktProviderInstance.getUsername()
        expect(a).toBe('Sean Rudford')
    })

    test('should get username when name is missing', async () => {
        nock('https://api.trakt.tv')
            .get('/users/sean')
            .reply(200, '{"username":"sean","private":false,"vip":true,"vip_ep":true,"ids":{"slug":"sean"}}')
        traktProviderInstance.userData.userName = 'sean'
        const a = await traktProviderInstance.getUsername()
        expect(a).toBe('sean')
    })
})
