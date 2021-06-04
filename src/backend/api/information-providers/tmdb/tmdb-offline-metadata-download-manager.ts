import { createWriteStream, ReadStream, writeFileSync, WriteStream } from 'fs'
import moment from 'moment'
import { Readable } from 'stream'
import { createGunzip } from 'zlib'
import RequestBundle from '../../../controller/web-request-manager/request-bundle'
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

        const movies_response = await WebRequestManager.request(
            new RequestBundle(this.BASE_URL + movies, { decompress: true })
        )
        const series_response = await WebRequestManager.request(
            new RequestBundle(this.BASE_URL + series, { decompress: true })
        )
        if (movies_response.statusCode === 200 && series_response.statusCode === 200) {
            writeFileSync(this.getMovieFilePath(), movies_response.body, { flag: 'w' })
            writeFileSync(this.getSeriesFilePath(), series_response.body, { flag: 'w' })
        }

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
}
