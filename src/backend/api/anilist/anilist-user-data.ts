import { Viewer } from './graphql/viewer';

import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import Series from '../../controller/objects/series';
import PathHelper from '../../helpFunctions/path-helper';
import logger from '../../logger/logger';
import { UserData } from '../user-data';

export class AniListUserData implements UserData {
    public username: string = '';
    public access_token: string = '';
    public refresh_token: string = '';
    public created_token: Date = new Date();
    public expires_in: number = 0;
    public viewer: Viewer | undefined;
    public list: Series[] | undefined;
    public lastListUpdate: Date | undefined;

    constructor() {
        this.loadData();
    }

    public updateList(list: Series[]) {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    public setViewer(viewer: Viewer) {
        this.viewer = viewer;
        this.username = viewer.name;
        this.saveData();
    }

    public setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        this.access_token = accessToken;
        this.refresh_token = refreshToken;
        this.expires_in = expiresIn;
        this.saveData();
    }



    private async saveData() {
       logger.warn('[IO] Write anilist user file.');
       writeFileSync(await this.getPath(), JSON.stringify(this));
    }

    private loadData() {
        try {
           logger.warn('[IO] Read anilist user file.');
           if (existsSync(this.getPath())) {
                const loadedString = readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
                if (typeof this.list !== 'undefined') {
                    for (let index = 0; index < this.list.length; index++) {
                        this.list[index] = Object.assign(new Series(), this.list[index]);
                    }
                }
                this.lastListUpdate = loadedData.lastListUpdate;
            }
        } catch (err) {
           logger.error(err);
        }
    }

    private getPath(): string {
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(new PathHelper().getAppPath(), 'anilist_config.json');
    }
}
