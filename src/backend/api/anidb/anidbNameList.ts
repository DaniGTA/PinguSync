
import * as http from "http";
import AniDBNameManager from './anidbNameManager';
import InfoProvider from '../infoProvider';
import { xml2json } from 'xml-js';
import { InfoProviderLocalData } from '../../../backend/controller/objects/infoProviderLocalData';
import Series from '../../controller/objects/series';
import { createWriteStream, readFileSync, createReadStream } from 'fs';
import Names from '../../controller/objects/meta/names';
import Name from '../../controller/objects/meta/name';
import AniDBNameListXML from './objects/anidbNameListXML';
import { createGunzip } from 'zlib';
import titleCheckHelper from '../../helpFunctions/titleCheckHelper';
export default class AniDBNameList implements InfoProvider {
    providerName: string = 'anidb';
    static anidbNameManager: AniDBNameManager = new AniDBNameManager();

    constructor(download: boolean = true) {
        if (this.allowDownload() && download) {
            this.getData();
        }
    }

    getSeriesInfo(anime: Series): Promise<InfoProviderLocalData> {
        throw new Error("Method not implemented.");
    }

    async getAllNames(names: Names): Promise<Name[]> {
        const allNames = await names.getAllNames();
        const resultNames = [...allNames];
        const nameDBList = AniDBNameList.anidbNameManager.data;

        if (nameDBList) {
            for (const seriesDB of nameDBList.animetitles.anime) {
                if (Array.isArray(seriesDB.title)) {
                    if (titleCheckHelper.checkNames(allNames.flatMap(x => x.name), seriesDB.title.flatMap(x => x._text))) {
                        for (const title of seriesDB.title) {
                            resultNames.push(new Name(title._text, title._attributes["xml:lang"]));
                        }
                        return resultNames;
                    }
                } else {
                    if (titleCheckHelper.checkNames(allNames.flatMap(x => x.name), [seriesDB.title._text])) {
                        resultNames.push(new Name(seriesDB.title._text, seriesDB.title._attributes["xml:lang"]));
                        return resultNames;
                    }
                }
            }
        }

        return resultNames;
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
        this.downloadFile("http://anidb.net/api/anime-titles.xml.gz").then(async (value) => {

            AniDBNameList.anidbNameManager.updateData(new Date(Date.now()), await this.getAniDBNameListXML());

        }).catch((err) => {
            AniDBNameList.anidbNameManager.updateData(new Date(Date.now()));
            console.log(err);
        });
    }

    private async getAniDBNameListXML(): Promise<AniDBNameListXML> {
        const fileContents = createReadStream('./anidb-anime-titles.xml.gz');
        const writeStream = createWriteStream('./anidb-anime-titles.xml');
        const unzip = createGunzip();

        var stream = fileContents.pipe(unzip).pipe(writeStream);
        // Wait until the Stream ends.
        await new Promise(fulfill => { stream.on("finish", fulfill); stream.on("close", fulfill); });

        var data = readFileSync('./anidb-anime-titles.xml', 'UTF-8');
        var json = xml2json(data, { compact: true, spaces: 0 });
        if (json) {
            return JSON.parse(json) as AniDBNameListXML;
        }
        throw 'convert from anidb xml to json failed';
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
