import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import logger from '../../../logger/logger';
import { AnimeOfflineDatabase } from './objects/database-entry';

export default class AnimeOfflineDatabaseProviderData {
    public database: AnimeOfflineDatabase | null = null;
    public lastDatabaseDownloadTimestamp = 0;

    public getDatabase(): AnimeOfflineDatabase {
        if (this.database) {
            return this.database;
        } else {
            const data = this.loadDatabase();
            if (data) {
                this.database = data;
                return data;
            } else {
                throw 'No database';
            }
        }
    }

    public updateLastTimestamp(timestamp: number): void {
        this.lastDatabaseDownloadTimestamp = timestamp;
        this.saveData();
    }

    public updateDatabase(database: AnimeOfflineDatabase): void {
        this.database = database;
        this.updateLastTimestamp(Date.now());
    }

    private loadDatabase(): AnimeOfflineDatabase | null {
        logger.info('[AnimeOfflineDatabaseProviderData] Loading database from file');
        const path = this.getPath();
        if (existsSync(path)) {
            try {
                const loadedString = readFileSync(path, 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
                return loadedData.database;
            } catch (err) {
                logger.error(err);
                this.saveData();
            }
        }
        return null;
    }

    private saveData(): void {
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
