import * as fs from "fs";
import * as http from "http";
import AniDBNameManager from './anidbNameManager';
import NameProvider from '../nameProvider';
import zlib from 'zlib';
export default class AniDBNameList implements NameProvider {
    anidbNameManager: AniDBNameManager = new AniDBNameManager();
    constructor(download: boolean = true) {
        if (this.needDownload() && download) {
            this.downloadFile();
        }
    }

    public InternalTesting() {
        return {
            needDownload: this.needDownload,
            dateDiffInDays: this.dateDiffInDays,
            downloadFile: this.downloadFile,
            anidbNameManager: this.anidbNameManager
        }
    }

    private needDownload(): boolean {
        if (typeof this.anidbNameManager.lastDownloadTime === 'undefined') {
            return true;
        } else if (this.dateDiffInDays(this.anidbNameManager.lastDownloadTime, new Date(Date.now())) > 1) {
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
        this.getGzipped("http://anidb.net/api/anime-titles.xml.gz").then(value => {
            that.anidbNameManager.updateData(new Date(Date.now()), value);
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