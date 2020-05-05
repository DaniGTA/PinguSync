import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import PathHelper from '../../../helpFunctions/path-helper';
import logger from '../../../logger/logger';
import { IAnimeOfflineDatabase } from './objects/database-entry';

export default class AnimeOfflineDatabaseProviderData {
    public database: IAnimeOfflineDatabase = { data: [] };
    public lastDatabaseDownloadTimestamp = 0;
    constructor() {
        this.loadDatabase();
    }

    public async updateLastTimestamp(timestamp: number): Promise<void> {
        this.lastDatabaseDownloadTimestamp = timestamp;
        await this.saveData();
    }

    public async updateDatabase(database: IAnimeOfflineDatabase): Promise<void> {
        this.database = database;
        await this.updateLastTimestamp(Date.now());
    }

    private loadDatabase(): void {
        logger.info('[AnimeOfflineDatabaseProviderData] Loading database from file');
        const path = this.getPath();
        if (existsSync(path)) {
            try {
                const loadedString = readFileSync(path, 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
            } catch (err) {
                logger.error(err);
                this.saveData();
            }
        }
    }

    private async saveData(): Promise<void> {
        try {
            logger.info('[AnimeOfflineDatabaseProviderData] Write user data to hard drive');
            writeFileSync(this.getPath(), JSON.stringify(this));
        } catch (err) {
            logger.error(err);
        }
    }

    private getPath(): string {
        const userDataPath = './';
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'anime_offline_database_data.json');
    }
}
