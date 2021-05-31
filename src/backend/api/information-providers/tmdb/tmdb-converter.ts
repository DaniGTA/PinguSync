import Cover from '../../../controller/objects/meta/cover'
import { ImageSize } from '../../../controller/objects/meta/image-size'
import { MediaType } from '../../../controller/objects/meta/media-type'
import Name from '../../../controller/objects/meta/name'
import { NameType } from '../../../controller/objects/meta/name-type'
import Overview from '../../../controller/objects/meta/overview'
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import MultiProviderResult from '../../provider/multi-provider-result'
import TMDBOfflineMovieMetadata from './objects/offline/tmdb-offline-movie-metadata'
import TMDBOfflineSeriesMetadata from './objects/offline/tmdb-offline-series-metadata'
import { TMDBOnlineApiSearchResultEntry } from './objects/online/tmdb-online-api-search-result'
import TMDBProvider from './tmdb-provider'

export default class TMDBConverter {
    public static convertOfflineMovieMetadata(movie: TMDBOfflineMovieMetadata): MultiProviderResult {
        const infoProviderLocalData = new InfoProviderLocalData(movie.id, TMDBProvider)
        infoProviderLocalData.isNSFW = movie.adult
        infoProviderLocalData.addSeriesName(new Name(movie.original_title, 'unknown', NameType.MAIN))
        infoProviderLocalData.publicScore = movie.popularity
        infoProviderLocalData.mediaType = MediaType.MOVIE
        return new MultiProviderResult(infoProviderLocalData)
    }

    public static convertOfflineSeriesMetadata(series: TMDBOfflineSeriesMetadata): MultiProviderResult {
        const infoProviderLocalData = new InfoProviderLocalData(series.id, TMDBProvider)
        infoProviderLocalData.addSeriesName(new Name(series.original_title, 'unknown', NameType.MAIN))
        infoProviderLocalData.publicScore = series.popularity
        infoProviderLocalData.mediaType = MediaType.UNKOWN_SERIES
        return new MultiProviderResult(infoProviderLocalData)
    }

    public static convertOnlineApiSearchResults(
        searchResults: TMDBOnlineApiSearchResultEntry[]
    ): MultiProviderResult[] {
        const results: MultiProviderResult[] = []
        for (const searchResult of searchResults) {
            const convertedSearchResult = this.convertOnlineApiSearchResult(searchResult)
            if (convertedSearchResult) {
                results.push(convertedSearchResult)
            }
        }
        return results
    }

    public static convertOnlineApiSearchResult(
        apiEntry: TMDBOnlineApiSearchResultEntry
    ): MultiProviderResult | undefined {
        const localData = new InfoProviderLocalData(apiEntry.id, TMDBProvider)
        // Poster
        if (apiEntry.poster_path) {
            localData.covers.push(
                new Cover(`https://image.tmdb.org/t/p/w500/${apiEntry.poster_path}`, ImageSize.ORIGINAL)
            )
        }
        localData.isNSFW = apiEntry.adult ?? false

        // Name
        if (apiEntry.original_name && apiEntry.original_language) {
            localData.addSeriesName(new Name(apiEntry.original_name, apiEntry.original_language, NameType.MAIN))
        }
        if (apiEntry.name) {
            localData.addSeriesName(new Name(apiEntry.name, 'unknown', NameType.UNKNOWN))
        }

        switch (apiEntry.media_type) {
            case 'movie':
                localData.mediaType = MediaType.MOVIE
                break
            case 'person':
                return
            case 'tv':
                localData.mediaType = MediaType.UNKOWN_SERIES
                break
        }
        if (apiEntry.overview) localData.addOverview(new Overview(apiEntry.overview, 'en'))
        if (apiEntry.first_air_date) localData.releaseYear = new Date(apiEntry.first_air_date).getFullYear()
        if (apiEntry.release_date) localData.releaseYear = new Date(apiEntry.release_date).getFullYear()
        localData.publicScore = apiEntry.vote_average
        return new MultiProviderResult(localData)
    }
}
