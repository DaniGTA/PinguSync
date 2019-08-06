
import * as http from "http";
import AniDBNameManager from './anidbNameManager';
import InfoProvider from '../infoProvider';
import * as zlib from 'zlib';
import { InfoProviderLocalData } from '../../../backend/controller/objects/infoProviderLocalData';
import Series from '../../controller/objects/series';
import { createWriteStream, readFileSync, createReadStream } from 'fs';
import Names from 'src/backend/controller/objects/meta/names';
import Name from 'src/backend/controller/objects/meta/name';
export default class AniDBNameList implements InfoProvider {
    getAllNames(names: Names): Promise<Name[]> {
        throw new Error("Method not implemented.");
    }
    providerName: string = 'anidb';
    getSeriesInfo(anime: Series): Promise<InfoProviderLocalData> {
        throw new Error("Method not implemented.");
    }
    static anidbNameManager: AniDBNameManager = new AniDBNameManager();
    constructor(download: boolean = true) {
        if (this.allowDownload() && download) {
            this.getData();
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

    private getData() {
        const that = this;
        console.warn('[ANIDB] Download anime names.')
        this.downloadFile("http://anidb.net/api/anime-titles.xml.gz").then(value => {
            const fileContents = createReadStream('./anidb-anime-titles.xml.gz');
            const writeStream = createWriteStream('./anidb-anime-titles.xml');
            const unzip = zlib.createGunzip();
            fileContents.pipe(unzip).pipe(writeStream);
            AniDBNameList.anidbNameManager.updateData(new Date(Date.now()), readFileSync('./anidb-anime-titles.xml'));
        }).catch((err) => {
            AniDBNameList.anidbNameManager.updateData(new Date(Date.now()), "");
            console.log(err);
        });
    }

    private async downloadFile(url: string): Promise<string> {
        return new Promise<string>((resolve, rejects) => {
            const path = "./anidb-anime-titles.xml.gz";
            const file = createWriteStream(path);
            http.get(url, function (res) {
                res.pipe(file);
                file.on('finish', function () {
                    file.close();  // close() is async, call cb after close completes.
                    resolve(readFileSync(path, "UTF-8"));
                });
            }).on('error', function (e) {
                console.log(e);
                rejects();
            });
        });
    }
}
