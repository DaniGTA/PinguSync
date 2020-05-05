import * as fs from 'fs';
import * as path from 'path';

import Series from '../../../controller/objects/series';
import PathHelper from '../../../helpFunctions/path-helper';
import logger from '../../../logger/logger';
import { UserData } from '../../user-data';

export class KitsuUserData extends UserData {

    public accessToken = '';
    public refreshToken = '';
    public expiresIn = 0;
    public username = '';
    public list: Series[] | undefined;
    public lastListUpdate: Date | undefined;
    constructor() {
        super();
        try {
            this.loadData();
        } catch (err) {
            logger.error('[KitsuUserData] ' + err);
        }
    }


    public updateList(list: Series[]) {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    public setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.saveData();
    }

    protected loadData(): void {
        try {
            logger.warn('[IO] Read kitsu user file.');
            if (fs.existsSync(this.getPath())) {
                const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
            }
        } catch (err) {
            logger.error(err);
        }
    }

    private async saveData(): Promise<void> {
        try {
            logger.warn('[IO] Write kitsu user file.');
            fs.writeFileSync(this.getPath(), JSON.stringify(this));
        } catch (err) {
            logger.error(err);
        }
    }


    private getPath(): string {
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(new PathHelper().getAppPath(), 'kitsu_config.json');
    }
}
