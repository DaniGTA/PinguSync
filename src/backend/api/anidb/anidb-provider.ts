import { createReadStream, createWriteStream, readFileSync } from 'fs';
import * as http from "http";
import { xml2json } from 'xml-js';
import { createGunzip } from 'zlib';
import Name from '../../controller/objects/meta/name';
import Series from '../../controller/objects/series';
import titleCheckHelper from '../../helpFunctions/title-check-helper';
import InfoProvider from '../info-provider';
import AniDBNameManager from './anidb-name-manager';
import AniDBNameListXML, { Title } from './objects/anidbNameListXML';
import AniDBConverter from './anidb-converter';
export default class AniDBProvider implements InfoProvider {
    public providerName: string = 'anidb';
    public version: number = 1;
    public isOffline = true;
    private static anidbNameManager: AniDBNameManager = new AniDBNameManager();
    public static instance: AniDBProvider;
    constructor(download: boolean = true) {
        AniDBProvider.instance = this;
        if (this.allowDownload() && download) {
            this.getData();
        }
    }

    async getMoreSeriesInfoByName(series: Series, searchTitle: string): Promise<Series> {
        const converter = new AniDBConverter();
        const nameDBList = AniDBProvider.anidbNameManager.data;
        if (nameDBList) {
            for (const seriesDB of nameDBList.animetitles.anime) {
                try {
                    const result = await this.checkTitles(searchTitle, seriesDB.title);
                    if (result) {
                        const localdata = await converter.convertAnimeToLocalData(seriesDB);
                        series.addInfoProvider(localdata);
                        series.addSeriesName(...result);
                        return series;
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }
        throw 'nothing found';

    }

    async checkTitles(name: string, titles: Title[] | Title) {
        const resultNames = [];
        let stringTitles = [];
        if (Array.isArray(titles)) {
            stringTitles = titles.flatMap(x => x._text)
        } else {
            stringTitles.push(titles._text);
        }
        if (await titleCheckHelper.checkNames([name], stringTitles)) {
            if (Array.isArray(titles)) {
                for (const title of titles) {
                    if (title._text) {
                        resultNames.push(new Name(title._text, title._attributes["xml:lang"]));
                    }
                }
            } else {
                resultNames.push(new Name(titles._text, titles._attributes["xml:lang"]));
            }
            return resultNames;
        }
        return null;
    }

    public InternalTesting() {
        return {
            needDownload: this.allowDownload,
            dateDiffInDays: this.dateDiffInDays,
            downloadFile: this.downloadFile,
            anidbNameManager: AniDBProvider.anidbNameManager
        }
    }

    private allowDownload(): boolean {
        if (typeof AniDBProvider.anidbNameManager.lastDownloadTime === 'undefined') {
            return true;
        } else if (this.dateDiffInDays(AniDBProvider.anidbNameManager.lastDownloadTime, new Date(Date.now())) > 2) {
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

            AniDBProvider.anidbNameManager.updateData(new Date(Date.now()), await this.getAniDBNameListXML());

        }).catch((err) => {
            AniDBProvider.anidbNameManager.updateData(new Date(Date.now()));
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
