import WebRequestManager from '../../../controller/web-request-manager/web-request-manager'
import MultiProviderResult from '../../provider/multi-provider-result'
import TMDBConverter from './tmdb-converter'

export default class TMDBOnlineApi {
    private readonly baseUrl = 'https://api.themoviedb.org/3/'
    constructor(private apiKey: string) {}
    public async search(name: string): Promise<MultiProviderResult[]> {
        const result = await WebRequestManager.request({
            uri: `/search/multi?api_key=${this.apiKey}&query=${name}&include_adult=true`,
            baseUrl: this.baseUrl,
        })

        return TMDBConverter.convertOnlineApiSearchResults(result.body)
    }
}
