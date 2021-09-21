/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import AniListProvider from '../../../../src/backend/api/information-providers/anilist/anilist-provider'
import RequestBundle from '../../../../src/backend/controller/web-request-manager/request-bundle'

// tslint:disable: no-string-literal
describe('Provider: AniList | Test runs', () => {
    test('should return headers', () => {
        const options: RequestBundle = {
            options: {
                body: JSON.stringify({
                    query: 'query',
                    variables: 'variables',
                }),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            },
            url: 'https://graphql.anilist.co',
        }

        const a = new AniListProvider()
        const result = a['getGraphQLOptions']('query', 'variables')
        expect(options.options.body).toBe(result.options.body)
        expect(options.options.headers + '').toBe(result.options.headers + '')
        expect(options.options.method).toBe(result.options.method)
        expect(options.url).toEqual(result.url)
        return
    })
})
