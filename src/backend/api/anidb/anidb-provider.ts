import { createReadStream, createWriteStream, readFileSync } from 'fs';
import * as http from 'http';
// tslint:disable-next-line: no-implicit-dependencies
import request from 'request';
import { xml2json } from 'xml-js';
import { createGunzip } from 'zlib';
import { MediaType } from '../../controller/objects/meta/media-type';
import Name from '../../controller/objects/meta/name';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import titleCheckHelper from '../../helpFunctions/title-check-helper';
import logger from '../../logger/logger';
import ExternalProvider from '../provider/external-provider';
import InfoProvider from '../provider/info-provider';
import MultiProviderResult from '../provider/multi-provider-result';
import AniDBConverter from './anidb-converter';
import AniDBNameManager from './anidb-name-manager';
import { AniDBAnimeFullInfo } from './objects/anidbFullInfoXML';
import AniDBNameListXML, { Anime, Title } from './objects/anidbNameListXML';
import MalProvider from '../mal/mal-provider';

export default class AniDBProvider extends InfoProvider {
    public static instance: AniDBProvider;
    private static anidbNameManager: AniDBNameManager = new AniDBNameManager();

    public providerName: string = 'anidb';
    public version: number = 1;
    public isOffline = true;
    public hasUniqueIdForSeasons = true;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SPECIAL];
    public supportedOtherProvider: Array<(new () => ExternalProvider)> = [];
    public potentialSubProviders: Array<(new () => ExternalProvider)> = [MalProvider];

    constructor(download: boolean = true) {
        super();
        if (!AniDBProvider.instance) {
            AniDBProvider.instance = this;
            if (this.allowDownload() && download) {
                this.getData();
            }
        }
    }

    public async getMoreSeriesInfoByName(searchTitle: string, season?: number): Promise<MultiProviderResult[]> {
        const nameDBList = AniDBProvider.anidbNameManager.data;
        let lastResult: Name[] | null = null;
        let lastSeriesDB: Anime | null = null;
        if (nameDBList) {
            for (const seriesDB of nameDBList.animetitles.anime) {
                try {
                    const result = await this.checkTitles(searchTitle, seriesDB.title);

                    if (result) {
                        const seasonOfTitle = await Name.getSeasonNumber(result);
                        if (!seasonOfTitle.seasonNumber) {
                            lastResult = result;
                            lastSeriesDB = seriesDB;
                        }
                        if (seasonOfTitle.seasonNumber === season || !season) {
                            return [await this.fillSeries(seriesDB, result)];
                        }
                    }
                } catch (err) {
                    logger.error(err);
                }
            }
            if (lastResult && lastSeriesDB) {
                return [await this.fillSeries(lastSeriesDB, lastResult)];
            }
        }
        throw new Error('nothing found');
    }

    public async getFullInfoById(provider: InfoProviderLocalData): Promise<MultiProviderResult> {
        const converter = new AniDBConverter();
        if (provider.provider === this.providerName && provider.id) {
            try {
                const fullInfo = await this.webRequest<AniDBAnimeFullInfo>('http://api.anidb.net:9001/httpapi?request=anime&client=animesynclist&clientver=2&protover=1&aid=' + provider.id);
                return converter.convertFullInfoToProviderLocalData(fullInfo);
            } catch (err) {
                throw new Error(err);
            }
        }
        throw new Error('False provider - AniDB');
    }

    public async checkTitles(name: string, titles: Title[] | Title) {
        const converter = new AniDBConverter();
        const resultNames = [];
        let stringTitles = [];
        if (Array.isArray(titles)) {
            stringTitles = titles.flatMap((x) => x._text);
        } else {
            stringTitles.push(titles._text);
        }
        if (await titleCheckHelper.checkNames([name], stringTitles)) {
            if (Array.isArray(titles)) {
                for (const title of titles) {
                    if (title._text) {
                        const nameType = await converter.convertToNameType(title._attributes.type);
                        resultNames.push(new Name(title._text, title._attributes['xml:lang'], nameType));
                    }
                }
            } else {
                const nameType = await converter.convertToNameType(titles._attributes.type);
                resultNames.push(new Name(titles._text, titles._attributes['xml:lang'], nameType));
            }
            return resultNames;
        }
        return null;
    }


    public async isProviderAvailable(): Promise<boolean> {
        return true;
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


    private async fillSeries(seriesDB: Anime, result: Name[]): Promise<MultiProviderResult> {
        const converter = new AniDBConverter();
        const localdata = await converter.convertAnimeToLocalData(seriesDB);
        await localdata.mainProvider.addSeriesName(...result);
        return localdata;
    }

    private getData() {
        logger.warn('[ANIDB] Download anime names.');
        this.downloadFile('http://anidb.net/api/anime-titles.xml.gz').then(async (value) => {

            AniDBProvider.anidbNameManager.updateData(new Date(Date.now()), await this.getAniDBNameListXML());

        }).catch((err) => {
            AniDBProvider.anidbNameManager.updateData(new Date(Date.now()));
            logger.error(err);
        });
    }

    private async getAniDBNameListXML(): Promise<AniDBNameListXML> {
        const fileContents = createReadStream('./anidb-anime-titles.xml.gz');
        const writeStream = createWriteStream('./anidb-anime-titles.xml');
        const unzip = createGunzip();

        const stream = fileContents.pipe(unzip).pipe(writeStream);
        // Wait until the Stream ends.
        await new Promise((fulfill) => { stream.on('finish', fulfill); stream.on('close', fulfill); });

        const data = readFileSync('./anidb-anime-titles.xml', 'UTF-8');
        const json = xml2json(data, { compact: true, spaces: 0 });
        if (json) {
            return JSON.parse(json) as AniDBNameListXML;
        }
        throw new Error('convert from anidb xml to json failed');
    }

    private async downloadFile(url: string): Promise<string> {
        return new Promise<string>((resolve, rejects) => {
            const path = './anidb-anime-titles.xml.gz';
            const file = createWriteStream(path);
            http.get(url, (res) => {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();  // close() is async, call cb after close completes.
                    resolve(readFileSync(path, 'UTF-8'));
                });
            }).on('error', (e) => {
                logger.error(e);
                rejects();
            });
        });
    }

    private async webRequest<T>(url: string): Promise<T> {
        logger.log('info', '[AniDB] Start WebRequest');
        return new Promise<T>((resolve, rejects) => {
            try {

                request({ method: 'GET', uri: url, gzip: true }, (error: any, response: any, body: any) => {

                    logger.log('info', '[AniDB] statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    if (response.statusCode === 200) {
                        const json = xml2json(body, { compact: true, spaces: 0 });
                        if (json) {
                            resolve(JSON.parse(json) as T);
                        } else {
                            rejects();
                        }
                    } else {
                        rejects();
                    }
                }).on('error', (err) => {
                    logger.error(err);
                    rejects();
                });
            } catch (err) {
                logger.error(err);
                rejects();
            }
        });
    }
}
