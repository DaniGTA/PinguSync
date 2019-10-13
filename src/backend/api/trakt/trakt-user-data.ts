import * as fs from 'fs';
import * as path from 'path';
import { TraktUserInfo } from './objects/userInfo';

import Series from '../../controller/objects/series';
import PathHelper from '../../helpFunctions/path-helper';
import logger from '../../logger/logger';
import MultiProviderResult from '../multi-provider-result';
import { UserData } from '../user-data';

export class TraktUserData implements UserData {

    public accessToken: string = '';
    public refreshToken: string = '';
    public expiresIn: number = 0;
    public username: string = '';
    public userInfo: TraktUserInfo | null = null;
    public list: MultiProviderResult[] | undefined;
    public lastListUpdate: Date | undefined;
    constructor() {
        this.loadData();
    }


    public updateList(list: MultiProviderResult[]) {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    public removeTokens() {
        this.accessToken = '';
        this.refreshToken = '';
        this.expiresIn = 0;
        this.saveData();
    }

    public setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.saveData();
    }

    public setUserData(userData: TraktUserInfo) {
        this.userInfo = userData;
        this.username = userData.user.name;
        this.saveData();

    }



    private async saveData() {
        try {
            const path = this.getPath();
            logger.warn('[IO] Write trakt user file.');
            fs.writeFileSync(path, JSON.stringify(this));
        } catch (err) { }
    }

    private loadData() {
        try {
            const path = this.getPath();
            logger.warn('[IO] Read trakt user file. ' + path);
            if (fs.existsSync(path)) {
                const loadedString = fs.readFileSync(path, 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
            }
        } catch (err) {

        }
    }

    private getPath(): string {
        try {
            // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
            return path.join(new PathHelper().getAppPath(), 'trakt_config.json');
        } catch (err) {
            throw err;
        }
    }
}
