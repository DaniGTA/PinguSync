import moment from 'moment';
import { xml2json } from 'xml-js';
import WebRequestManager from '../../../controller/web-request-manager/web-request-manager';
import { ScudLeeAnimeListProviderData } from './scud-lee-anime-list-provider-data';

export default class ScudLeeAnimeListManager {
    private static readonly SETTINGS_DATA: ScudLeeAnimeListProviderData = new ScudLeeAnimeListProviderData();
    private static readonly UPDATE_INTERVAL_IN_DAYS: number = 7;
    private static readonly DATABASE_URL = 'https://raw.githubusercontent.com/ScudLee/anime-lists/master/anime-list-master.xml';

    public static async checkDatabaseStatus(): Promise<void> {
        if (this.canUpdateDatabase()) {
            const database = await this.downloadDatabase();
            this.SETTINGS_DATA.updateDatabase(database);
        }
    }

    private static canUpdateDatabase(): boolean {
        const currentDate = moment(new Date());
        const lastDownload = moment(this.SETTINGS_DATA.lastDatabaseDownloadTimestamp);
        if (currentDate.diff(lastDownload, 'days') > this.UPDATE_INTERVAL_IN_DAYS) {
            return true;
        }
        return false;
    }

    private static async downloadDatabase(): Promise<any> {
        const res = await WebRequestManager.request({ uri: ScudLeeAnimeListManager.DATABASE_URL });
        if (res.statusCode === 200) {
            return this.convertXmlToJson(res.body);
        } else {
            throw new Error('[AnimeOfflineDatabase] Database download failed status code: ' + res.statusCode);
        }
    }

    private static convertXmlToJson(xmlData: string) {
        const json = xml2json(xmlData, { compact: true, spaces: 0 });
        if (json) {
            return JSON.parse(json);
        }
        throw new Error('Failed to convert ScudLeeAnimeList xml to json.');
    }
}