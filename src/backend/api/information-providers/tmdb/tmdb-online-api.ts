import RequestBundle from '../../../controller/web-request-manager/request-bundle'
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager'
import MultiProviderResult from '../../provider/multi-provider-result'
import { TMDBOnlineApiSearchResultEntry } from './objects/online/tmdb-online-api-search-result'
import TMDBConverter from './tmdb-converter'

export default class TMDBOnlineApi {
    private readonly baseUrl = 'https://api.themoviedb.org/3/'

    constructor(private apiKey: string) {}

    public async search(name: string): Promise<MultiProviderResult[]> {
        const result = await WebRequestManager.request(
            new RequestBundle(`${this.baseUrl}/search/multi?api_key=${this.apiKey}&query=${name}&include_adult=true`)
        )

        return TMDBConverter.convertOnlineApiSearchResults((result.body as unknown) as TMDBOnlineApiSearchResultEntry[])
    }
}
