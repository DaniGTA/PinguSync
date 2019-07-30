
import * as http from "http";
import AniDBNameManager from './anidbNameManager';
import InfoProvider from '../infoProvider';
import * as zlib from 'zlib';
import { InfoProviderLocalData } from '../../../backend/controller/objects/infoProviderLocalData';
import Series from '../../controller/objects/series';
export default class AniDBNameList implements InfoProvider {
    providerName: string = 'anidb';
    getSeriesInfo(anime: Series): Promise<InfoProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    static anidbNameManager: AniDBNameManager = new AniDBNameManager();
    constructor(download: boolean = true) {
        if (this.allowDownload() && download) {
            //this.downloadFile();
        }
    }

    public InternalTesting() {
        return {
            needDownload: this.allowDownload,
            dateDiffInDays: this.dateDiffInDays,
            downloadFile: this.downloadFile,
            anidbNameManager: AniDBNameList.anidbNameManager
        }
    }

    private allowDownload(): boolean {
        if (typeof AniDBNameList.anidbNameManager.lastDownloadTime === 'undefined') {
            return true;
        } else if (this.dateDiffInDays(AniDBNameList.anidbNameManager.lastDownloadTime, new Date(Date.now())) > 2) {
            return true;
        }
        return false;
    }

    private dateDiffInDays(a: Date, b: Date): number {
        a = new Date(a);
        b = new Date(b);
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    private downloadFile() {
        const that = this;
        console.warn('[ANIDB] Download anime names.')
        this.getGzipped("http://anidb.net/api/anime-titles.xml.gz").then(value => {
            AniDBNameList.anidbNameManager.updateData(new Date(Date.now()), value);
        }).catch((err) => {
            AniDBNameList.anidbNameManager.updateData(new Date(Date.now()), "");
            console.log(err);
        });
    }

    private async getGzipped(url: string): Promise<string> {
        return new Promise<string>((resolve, rejects) => {
            // buffer to store the streamed decompression
            var buffer: string[] = [];
            http.get(url, function (res) {
                // pipe the response into the gunzip to decompress
                var gunzip = zlib.createGunzip();
                res.pipe(gunzip);

                gunzip.on('data', function (data) {
                    // decompression chunk ready, add it to the buffer
                    buffer.push(data.toString())
                }).on("end", function () {
                    // response and decompression complete, join the buffer and return
                    resolve(buffer.join(""));
                }).on("error", function (e) {
                    console.log(e);
                    rejects();
                })
            }).on('error', function (e) {
                console.log(e);
                rejects();
            });
        });
    }
}
