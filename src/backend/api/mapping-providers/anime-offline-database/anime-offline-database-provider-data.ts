import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import PathHelper from '../../../helpFunctions/path-helper';
import logger from '../../../logger/logger';
import { IAnimeOfflineDatabase } from './objects/database-entry';

export default class AnimeOfflineDatabaseProviderData {
    public database: IAnimeOfflineDatabase = { data: [] };
    public lastDatabaseDownloadTimestamp: number = 0;
    constructor() {
        this.loadDatabase();
    }

    public async updateLastTimestamp(timestamp: number) {
        this.lastDatabaseDownloadTimestamp = timestamp;
        await this.saveData();
    }

    public async updateDatabase(database: IAnimeOfflineDatabase) {
        this.database = database;
        await this.saveData();
    }

    private loadDatabase(): void {
        logger.info('[AnimeOfflineDatabaseProviderData] Loading database from file');
        if (existsSync(this.getPath())) {
            const loadedString = readFileSync(this.getPath(), 'UTF-8');
            const loadedData = JSON.parse(loadedString) as this;
            Object.assign(this, loadedData);
        }
    }

    private async saveData() {
        try {
            logger.info('[AnimeOfflineDatabaseProviderData] Write user data to hard drive');
            writeFileSync(this.getPath(), JSON.stringify(this));
        } catch (err) {
            logger.error(err);
        }
    }

    private getPath(): string {
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(new PathHelper().getAppPath(), 'anime_offline_database_data.json');
    }
}
