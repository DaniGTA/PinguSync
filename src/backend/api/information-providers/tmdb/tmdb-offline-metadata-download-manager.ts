import { createWriteStream, ReadStream, WriteStream } from 'fs'
import { Readable } from 'stream'
import { createGunzip } from 'zlib'
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

        const movies_response = await WebRequestManager.request({ uri: movies, baseUrl: this.BASE_URL })
        const series_response = await WebRequestManager.request({ uri: series, baseUrl: this.BASE_URL })

        await this.decompressFile(Readable.from(movies_response.body), createWriteStream(this.getMovieFilePath()))
        await this.decompressFile(Readable.from(series_response.body), createWriteStream(this.getSeriesFilePath()))
        return
    }

    private static getOfflineMetadataDateFormat(): string {
        const yesterday = new Date(new Date().getDay() - 1)
        return `${yesterday.getMonth()}_${yesterday.getDay()}_${yesterday.getFullYear()}`
    }

    private static async decompressFile(compressedFile: ReadStream | Readable, decrompressedFile: WriteStream) {
        const unzip = createGunzip()

        const stream = compressedFile.pipe(unzip).pipe(decrompressedFile)
        // Wait until the Stream ends.
        await new Promise(fulfill => {
            stream.on('finish', fulfill)
            stream.on('close', fulfill)
        })
    }
}
