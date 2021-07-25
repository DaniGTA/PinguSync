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
        const seriesSearch = this.searchSeries(name)
        const movieSearch = this.searchMovies(name)
        result.push(...(await seriesSearch))
        result.push(...(await movieSearch))
        return result
    }

    private static async searchSeries(name: string): Promise<MultiProviderResult[]> {
        const result: MultiProviderResult[] = []
        logger.debug('[TMDB] Reading offline metadata series')
        try {
            for await (const line of this.getReadInterface(TMDBOfflineMetdataDownloadManager.getSeriesFilePath())) {
                const lineResult = this.getSeriesLineResults(line, name)
                if (lineResult) {
                    result.push(lineResult)
                }
            }
        } catch (err) {
            logger.error('[TMDB] Failed to read file:' + TMDBOfflineMetdataDownloadManager.getSeriesFilePath())
            logger.error(err)
        }
        return result
    }

    private static getSeriesLineResults(line: string, name: string) {
        try {
            const series = JSON.parse(line) as TMDBOfflineSeriesMetadata
            if (TitleCheckHelper.checkNames([name], [series.original_title])) {
                return TMDBConverter.convertOfflineSeriesMetadata(series)
            }
        } catch (err) {
            logger.error('[TMDB] Failed to read a line in series meta file. ERR at following line')
            logger.error(err)
        }
    }

    private static async searchMovies(name: string): Promise<MultiProviderResult[]> {
        const result: MultiProviderResult[] = []
        logger.debug('[TMDB] Reading offline metadata movies')
        try {
            for await (const line of this.getReadInterface(TMDBOfflineMetdataDownloadManager.getSeriesFilePath())) {
                const lineResult = this.getMovieLineResults(line, name)
                if (lineResult) {
                    result.push(lineResult)
                }
            }
        } catch (err) {
            logger.error('[TMDB] Failed to read file:' + TMDBOfflineMetdataDownloadManager.getSeriesFilePath())
            logger.error(err)
        }
        return result
    }

    private static getMovieLineResults(line: string, name: string) {
        try {
            const series = JSON.parse(line) as TMDBOfflineMovieMetadata
            if (TitleCheckHelper.checkNames([name], [series.original_title])) {
                return TMDBConverter.convertOfflineMovieMetadata(series)
            }
        } catch (err) {
            logger.error('[TMDB] Failed to read a line in movie meta file. ERR at following line')
            logger.error(err)
        }
    }

    private static getReadInterface(path: string) {
        return readline.createInterface({ input: createReadStream(path) })
    }
}
