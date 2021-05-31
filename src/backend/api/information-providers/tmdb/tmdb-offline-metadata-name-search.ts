import TMDBOfflineMetdataDownloadManager from './tmdb-offline-metadata-download-manager'
import readline from 'readline'
import { createReadStream } from 'fs'
import TMDBOfflineSeriesMetadata from './objects/offline/tmdb-offline-series-metadata'
import TMDBOfflineMovieMetadata from './objects/offline/tmdb-offline-movie-metadata'
import TitleCheckHelper from '../../../helpFunctions/name-helper/title-check-helper'
import TMDBConverter from './tmdb-converter'
import logger from '../../../logger/logger'
import MultiProviderResult from '../../provider/multi-provider-result'

export default class TMDBOfflineMetdataNameSearch {
    public static async search(name: string): Promise<MultiProviderResult[]> {
        const result: MultiProviderResult[] = []
        result.push(...(await this.searchSeries(name)))
        result.push(...(await this.searchMovies(name)))
        return result
    }

    private static async searchSeries(name: string): Promise<MultiProviderResult[]> {
        const result: MultiProviderResult[] = []
        logger.debug('[TMDB] Reading offline metadata series')
        for await (const line of this.getReadInterface(TMDBOfflineMetdataDownloadManager.getSeriesFilePath())) {
            const series = JSON.parse(line) as TMDBOfflineSeriesMetadata
            if (TitleCheckHelper.checkNames([name], [series.original_title])) {
                result.push(TMDBConverter.convertOfflineSeriesMetadata(series))
            }
        }
        return result
    }
    private static async searchMovies(name: string): Promise<MultiProviderResult[]> {
        const result: MultiProviderResult[] = []
        logger.debug('[TMDB] Reading offline metadata movies')
        for await (const line of this.getReadInterface(TMDBOfflineMetdataDownloadManager.getSeriesFilePath())) {
            const movie = JSON.parse(line) as TMDBOfflineMovieMetadata
            if (TitleCheckHelper.checkNames([name], [movie.original_title])) {
                result.push(TMDBConverter.convertOfflineMovieMetadata(movie))
            }
        }
        return result
    }
    private static getReadInterface(path: string) {
        return readline.createInterface({ input: createReadStream(path), crlfDelay: Infinity })
    }
}
