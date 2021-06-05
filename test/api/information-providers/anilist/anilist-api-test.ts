/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'request'
import AniListProvider from '../../../../src/backend/api/information-providers/anilist/anilist-provider'

// tslint:disable: no-string-literal
describe('Provider: AniList | Test runs', () => {
    test('should return headers', () => {
        const options: request.UriOptions & request.CoreOptions = {
            body: JSON.stringify({
                query: 'query',
                variables: 'variables',
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            uri: 'https://graphql.anilist.co',
        }

        const a = new AniListProvider()
        const result = a['getGraphQLOptions']('query', 'variables')
        expect(options.body).toBe(result.options.body)
        expect(options.headers + '').toBe(result.options.headers + '')
        expect(options.method).toBe(result.options.method)
        expect(options.uri).toEqual(result.url)
        return
    })
})
