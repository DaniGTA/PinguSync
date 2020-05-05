
import * as fs from 'fs';
import * as path from 'path';
import PathHelper from '../../../helpFunctions/path-helper';
import logger from '../../../logger/logger';

export class TVDBProviderData {

    public accessToken?: string;
    public expiresIn?: number;
    constructor() {
        try {
            this.loadData();
        } catch (err) {
            logger.error('[TVDBProviderData] ' + err);
        }
    }

    public setTokens(accessToken: string, expiresIn: number): void {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.saveData();
    }

    private saveData(): void {
        try {
            const dataPath = this.getPath();
            logger.warn('[IO] Write tvdb user file.');
            fs.writeFileSync(dataPath, JSON.stringify(this));
        } catch (err) {
            logger.error(err);
        }
    }

    private loadData(): void {
        try {
            const dataPath = this.getPath();
            logger.warn('[IO] Read tvdb user file. ' + dataPath);
            if (fs.existsSync(dataPath)) {
                const loadedString = fs.readFileSync(dataPath, 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
            }
        } catch (err) {
            logger.error(err);
        }
    }

    private getPath(): string {
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(new PathHelper().getAppPath(), 'tvdb_config.json');
    }
}
