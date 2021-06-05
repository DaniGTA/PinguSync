import { MediaType } from '../../../controller/objects/meta/media-type'
import RequestBundle from '../../../controller/web-request-manager/request-bundle'
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager'
import MediaTypeComperator from '../../../helpFunctions/comperators/media-type-comperator'
import timeHelper from '../../../helpFunctions/time-helper'
import MultiProviderResult from '../../provider/multi-provider-result'
import { TMDBOnlineApiMoviesGetDetailsResult } from './objects/online/tmdb-online-api-movies-get-details'
import { TMDBOnlineApiSearchResult } from './objects/online/tmdb-online-api-search-result'
import { TMDBOnlineAPISeasonDetails } from './objects/online/tmdb-online-api-season-get-details'
import { TMDBOnlineApiSeriesGetDetailsResult, TMDBSeason } from './objects/online/tmdb-online-api-series-get-details'
import TMDBConverter from './tmdb-converter'

export default class TMDBOnlineApi {
    private readonly baseUrl = 'https://api.themoviedb.org/3/'

    constructor(private apiKey: string) {}

    public async search(name: string): Promise<MultiProviderResult[]> {
        const result = await WebRequestManager.request(
            new RequestBundle(`${this.baseUrl}search/multi?api_key=${this.apiKey}&query=${name}&include_adult=true`)
        )

        return TMDBConverter.convertOnlineApiSearchResults(
            ((JSON.parse(result.body) as unknown) as TMDBOnlineApiSearchResult).results
        )
    }

    public async getDetails(id: number | string, mediaType: MediaType): Promise<MultiProviderResult> {
        if (MediaTypeComperator.isMediaTypeANormalSeries(mediaType)) {
            const result = await WebRequestManager.request(
                new RequestBundle(`${this.baseUrl}tv/${id}?api_key=${this.apiKey}`)
            )
            const seriesDetailsBody = JSON.parse(result.body) as TMDBOnlineApiSeriesGetDetailsResult
            const seasons: TMDBOnlineAPISeasonDetails[] = []
            for (const season of seriesDetailsBody.seasons) {
                await timeHelper.delay(1000)
                const seasonInfo = await WebRequestManager.request(
                    new RequestBundle(`${this.baseUrl}tv/${id}/season/${season.season_number}?api_key=${this.apiKey}`)
                )
                if (seasonInfo.statusCode === 200) {
                    seasons.push(JSON.parse(seasonInfo.body) as TMDBOnlineAPISeasonDetails)
                }
            }

            return TMDBConverter.convertOnlineApiSeriesGetDetailsResult(seriesDetailsBody, mediaType, seasons)
        } else {
            const result = await WebRequestManager.request(
                new RequestBundle(`${this.baseUrl}movie/${id}?api_key=${this.apiKey}`)
            )
            const body = JSON.parse(result.body) as TMDBOnlineApiMoviesGetDetailsResult
            return TMDBConverter.convertOnlineApiMovieGetDetailsResult(body, mediaType)
        }
    }
}
