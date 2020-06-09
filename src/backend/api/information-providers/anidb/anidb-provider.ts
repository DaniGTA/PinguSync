import { createReadStream, createWriteStream, existsSync, readFileSync } from 'fs';
// tslint:disable-next-line: no-implicit-dependencies
import { xml2json } from 'xml-js';
import { createGunzip } from 'zlib';
import { MediaType } from '../../../controller/objects/meta/media-type';
import Name from '../../../controller/objects/meta/name';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager';
import logger from '../../../logger/logger';
import ExternalInformationProvider from '../../provider/external-information-provider';
import InfoProvider from '../../provider/info-provider';
import MultiProviderResult from '../../provider/multi-provider-result';
import MalProvider from '../mal/mal-provider';
import AniDBConverter from './anidb-converter';
import AniDBHelper from './anidb-helper';
import { AniDBAnimeFullInfo } from './objects/anidbFullInfoXML';
import AniDBNameListXML, { Anime } from './objects/anidbNameListXML';
export default class AniDBProvider extends InfoProvider {
    public static instance: AniDBProvider;

    public requestRateLimitInMs = 3000;
    public providerName = 'anidb';
    public version = 1;
    public isOffline = true;
    public hasUniqueIdForSeasons = true;
    public hasEpisodeTitleOnFullInfo = true;
    public supportOnlyBasicLatinForNameSearch = false;
    public supportedMediaTypes: MediaType[] = [MediaType.ANIME, MediaType.MOVIE, MediaType.SPECIAL];
    public supportedOtherProvider: Array<(new () => ExternalInformationProvider)> = [];
    public potentialSubProviders: Array<(new () => ExternalInformationProvider)> = [MalProvider];
    public requireInternetAccessGetMoreSeriesInfoByName = false;
    constructor(private download = true) {
        super();
        if (!AniDBProvider.instance) {
            AniDBProvider.instance = this;
        }
    }

    private async loadAniDBNameManagerData(): Promise<void> {
        if (this.allowDownload() && this.download) {
            await this.getData();
        } else if (!AniDBHelper.anidbNameManager.data || Object.entries(AniDBHelper.anidbNameManager.data).length === 0) {
            try {
                AniDBHelper.anidbNameManager.updateOnlyData(this.convertXmlToJson());
            } catch (err) {
                logger.error('Error at AniDBProvider.constructor:');
                logger.error(err);
            }
        }
    }

    public async getMoreSeriesInfoByName(searchTitle: string, season?: number): Promise<MultiProviderResult[]> {
        const nameDBList = AniDBHelper.anidbNameManager.data;
        if (nameDBList) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            await this.loadAniDBNameManagerData();
            return await this.getSameTitle(searchTitle, nameDBList, season);
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

    public async isProviderAvailable(): Promise<boolean> {
        return true;
    }

    private async getSameTitle(searchTitle: string, nameDBList: AniDBNameListXML, season?: number): Promise<MultiProviderResult[]> {
        const lastResults: Array<[Anime, Name[]]> = [];
        for (const seriesDB of nameDBList.animetitles.anime) {
            try {
                const result = await AniDBHelper.checkTitles(searchTitle, seriesDB.title);

                if (result.length !== 0) {
                    const seasonOfTitle = await Name.getSeasonNumber(result);
                    if (season !== undefined) {
                        if (seasonOfTitle.seasonNumber === undefined && season <= 1) {
                            lastResults.push([seriesDB, result]);
                        } else if (seasonOfTitle.seasonNumber === season) {
                            return [await AniDBHelper.fillSeries(seriesDB, result)];
                        }
                    } else {
                        lastResults.push([seriesDB, result]);
                        if (result.flatMap((x) => x.name).includes(searchTitle)) {
                            return [await AniDBHelper.fillSeries(seriesDB, result)];
                        }
                    }
                }
            } catch (err) {
                logger.error(err);
            }
        }
        if (lastResults.length !== 0) {
            const finalResult = [];
            for (const lastResult of lastResults) {
                finalResult.push(await AniDBHelper.fillSeries(lastResult[0], lastResult[1]));
            }
            return finalResult;
        }
        return [];
    }

    private allowDownload(): boolean {
        if (typeof AniDBHelper.anidbNameManager.lastDownloadTime === 'undefined') {
            return true;
        } else if (this.dateDiffInDays(AniDBHelper.anidbNameManager.lastDownloadTime, new Date(Date.now())) > 3) {
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

    private async getData(): Promise<void> {
        logger.warn('[ANIDB] Download anime names.');
        try {
            await this.downloadFile('http://anidb.net/api/anime-titles.xml.gz', './anidb-anime-titles.xml.gz');
            AniDBHelper.anidbNameManager.updateData(new Date(Date.now()), await this.getAniDBNameListXML());
        } catch (err) {
            AniDBHelper.anidbNameManager.updateData(new Date(Date.now()), AniDBHelper.anidbNameManager.data);
            logger.error(err);

        }
    }

    private async getAniDBNameListXML(): Promise<AniDBNameListXML> {
        try {
            if (existsSync('./anidb-anime-titles.xml.gz')) {
                const fileContents = createReadStream('./anidb-anime-titles.xml.gz');
                const writeStream = createWriteStream('./anidb-anime-titles.xml');
                const unzip = createGunzip();

                const stream = fileContents.pipe(unzip).pipe(writeStream);
                // Wait until the Stream ends.
                await new Promise((fulfill) => { stream.on('finish', fulfill); stream.on('close', fulfill); });
                return this.convertXmlToJson();
            }
        } catch (err) {
            logger.error(err);
        }
        throw new Error('convert from anidb xml to json failed');
    }

    private convertXmlToJson(filePath = './anidb-anime-titles.xml') {
        if (existsSync(filePath)) {
            const data = readFileSync(filePath, 'UTF-8');
            const json = xml2json(data, { compact: true, spaces: 0 });
            if (json) {
                return JSON.parse(json) as AniDBNameListXML;
            }
        }
        throw new Error('convert from ' + filePath + ' to JSON has failed');
    }

    private downloadFile(url: string, filePath: string): Promise<string> {
        this.informAWebRequest();
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<string>(async (resolve, rejects) => {
            const res = await WebRequestManager.request({ uri: url, gzip: true });
            if (res.statusCode === 200) {
                const file = createWriteStream(filePath);
                res.body.pipe(file);
                file.on('finish', () => {
                    file.close();  // close() is async, call cb after close completes.
                    resolve(readFileSync(filePath, 'UTF-8'));
                });
            } else {
                rejects(new Error('Status Code: ' + res.statusCode));
            }
        });
    }

    private async webRequest<T>(url: string): Promise<T> {
        this.informAWebRequest();
        logger.log('info', '[AniDB] Start WebRequest');

        const response = await WebRequestManager.request({ method: 'GET', uri: url, gzip: true });
        logger.log('info', '[AniDB] statusCode:', response && response.statusCode); // Print the response status code if a response was received
        if (response.statusCode === 200) {
            const json = xml2json(response.body, { compact: true, spaces: 0 });
            if (json) {
                return JSON.parse(json) as T;
            } else {
                throw new Error('[AniDB] no json to parse. URL: ' + url);
            }
        } else {
            throw new Error('[AniDB] wrong status code: ' + response.statusCode);
        }
    }
}
