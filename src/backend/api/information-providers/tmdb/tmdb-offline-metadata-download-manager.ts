import { rejects } from 'assert/strict'
import { createWriteStream, ReadStream, writeFileSync, WriteStream } from 'fs'
import moment from 'moment'
import { createGunzip, gunzipSync } from 'zlib'
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager'

export default class TMDBOfflineMetdataDownloadManager {
    private static readonly BASE_URL = 'http://files.tmdb.org/p/exports/'
    private static readonly EXTENSION = '.json.gz'

    public static getMovieFilePath(): string {
        return './tmdb-movie-meta.data'
    }

    public static getSeriesFilePath(): string {
        return './tmdb-series-meta.data'
    }

    public static async downloadOfflineMetadata(): Promise<void> {
        const yesterday = this.getOfflineMetadataDateFormat()
        const movies = `movie_ids_${yesterday}${this.EXTENSION}`
        const series = `tv_series_ids_${yesterday}${this.EXTENSION}`

        const moviesUnzip = createGunzip()
        const seriesUnzip = createGunzip()

        const moviesResponse = WebRequestManager.stream(this.BASE_URL + movies)
            .pipe(moviesUnzip)
            .pipe(createWriteStream(this.getMovieFilePath()))

        const seriesResponse = WebRequestManager.stream(this.BASE_URL + series)
            .pipe(seriesUnzip)
            .pipe(createWriteStream(this.getSeriesFilePath()))

        await Promise.allSettled([
            new Promise(fulfill => moviesResponse.on('finish', fulfill)),
            new Promise(fulfill => seriesResponse.on('finish', fulfill)),
        ])
        return
    }

    private static getOfflineMetadataDateFormat(): string {
        const yesterday = moment().subtract(1, 'days')
        const month = this.addZeroToHighNumbers(yesterday.month() + 1)
        const date = this.addZeroToHighNumbers(yesterday.date())
        const year = this.addZeroToHighNumbers(yesterday.year())
        return `${month}_${date}_${year}`
    }

    private static addZeroToHighNumbers(n: number) {
        return n > 9 ? `${n}` : `0${n}`
    }

    private static decrompessString(s: string) {
        return gunzipSync(Buffer.from(s)).toString('utf-8')
    }
}
