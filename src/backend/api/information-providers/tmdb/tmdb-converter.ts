import Banner from '../../../controller/objects/meta/banner'
import Cover from '../../../controller/objects/meta/cover'
import Episode from '../../../controller/objects/meta/episode/episode'
import EpisodeThumbnail from '../../../controller/objects/meta/episode/episode-thumbnail'
import EpisodeTitle from '../../../controller/objects/meta/episode/episode-title'
import { EpisodeType } from '../../../controller/objects/meta/episode/episode-type'
import { ImageSize } from '../../../controller/objects/meta/image-size'
import { MediaType } from '../../../controller/objects/meta/media-type'
import Name from '../../../controller/objects/meta/name'
import { NameType } from '../../../controller/objects/meta/name-type'
import Overview from '../../../controller/objects/meta/overview'
import Season from '../../../controller/objects/meta/season'
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data'
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status'
import MultiProviderResult from '../../provider/multi-provider-result'
import TMDBOfflineMovieMetadata from './objects/offline/tmdb-offline-movie-metadata'
import TMDBOfflineSeriesMetadata from './objects/offline/tmdb-offline-series-metadata'
import { TMDBOnlineApiMoviesGetDetailsResult } from './objects/online/tmdb-online-api-movies-get-details'
import { TMDBOnlineApiSearchResultEntry } from './objects/online/tmdb-online-api-search-result'
import { TMDBOnlineAPISeasonDetails } from './objects/online/tmdb-online-api-season-get-details'
import { TMDBOnlineApiSeriesGetDetailsResult } from './objects/online/tmdb-online-api-series-get-details'
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
        } else if (apiEntry.original_name) {
            localData.addSeriesName(new Name(apiEntry.original_name, 'unkown', NameType.MAIN))
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

    public static convertOnlineApiSeriesGetDetailsResult(
        apiResult: TMDBOnlineApiSeriesGetDetailsResult,
        mediaType: MediaType,
        seasons: TMDBOnlineAPISeasonDetails[]
    ): MultiProviderResult {
        const localData = new InfoProviderLocalData(apiResult.id, TMDBProvider)
        for (const season of seasons) {
            for (const episode of season.episodes) {
                const newEp = new Episode(episode.episode_number, new Season(episode.season_number), [
                    new EpisodeTitle(episode.name),
                ])
                newEp.providerEpisodeId = episode.id
                newEp.summery = episode.overview
                newEp.airDate = new Date(episode.air_date)
                newEp.thumbnails.push(new EpisodeThumbnail(`https://image.tmdb.org/t/p/w500/${episode.still_path}`))
                newEp.rating = episode.vote_average
                if (season.name === 'Specials') {
                    newEp.type = EpisodeType.SPECIAL
                }
                localData.addDetailedEpisodeInfos(newEp)
            }
        }
        if (apiResult.name) {
            localData.addSeriesName(new Name(apiResult.name))
        }
        if (apiResult.overview) {
            localData.addOverview(new Overview(apiResult.overview, 'en'))
        }
        localData.score = apiResult.vote_average
        localData.banners.push(new Banner(`https://image.tmdb.org/t/p/w500/${apiResult.backdrop_path}`))

        localData.releaseYear = new Date(apiResult.first_air_date).getFullYear()
        localData.episodes = apiResult.number_of_episodes
        localData.infoStatus = ProviderInfoStatus.ADVANCED_BASIC_INFO
        if (apiResult.poster_path) {
            localData.covers.push(
                new Cover(`https://image.tmdb.org/t/p/w500/${apiResult.poster_path}`, ImageSize.ORIGINAL)
            )
        }
        if (apiResult.original_name && apiResult.original_language) {
            localData.addSeriesName(new Name(apiResult.original_name, apiResult.original_language, NameType.MAIN))
        } else if (apiResult.original_name) {
            localData.addSeriesName(new Name(apiResult.original_name, 'unkown', NameType.MAIN))
        }

        localData.mediaType = mediaType
        return new MultiProviderResult(localData)
    }

    public static convertOnlineApiMovieGetDetailsResult(
        apiResult: TMDBOnlineApiMoviesGetDetailsResult,
        mediaType: MediaType
    ): MultiProviderResult {
        const localData = new InfoProviderLocalData(apiResult.id, TMDBProvider)
        localData.mediaType = mediaType
        if (apiResult.title) {
            localData.addSeriesName(new Name(apiResult.tagline))
        }
        if (apiResult.overview) {
            localData.addOverview(new Overview(apiResult.overview, 'en'))
        }
        localData.score = apiResult.vote_average
        localData.banners.push(new Banner(`https://image.tmdb.org/t/p/w500/${apiResult.backdrop_path}`))

        localData.releaseYear = new Date(apiResult.release_date).getFullYear()
        localData.infoStatus = ProviderInfoStatus.FULL_INFO
        if (apiResult.poster_path) {
            localData.covers.push(
                new Cover(`https://image.tmdb.org/t/p/w500/${apiResult.poster_path ?? ''}`, ImageSize.ORIGINAL)
            )
        }
        if (apiResult.original_title && apiResult.original_language) {
            localData.addSeriesName(new Name(apiResult.original_title, apiResult.original_language, NameType.MAIN))
        }
        return new MultiProviderResult(localData)
    }
}
