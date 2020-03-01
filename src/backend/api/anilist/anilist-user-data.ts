import { IViewer } from './graphql/viewer';

import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import Series from '../../controller/objects/series';
import PathHelper from '../../helpFunctions/path-helper';
import logger from '../../logger/logger';
import MultiProviderResult from '../provider/multi-provider-result';
import { UserData } from '../user-data';

export class AniListUserData extends UserData {
    public username: string = '';
    public access_token: string = '';
    public refresh_token: string = '';
    public created_token: Date = new Date();
    public expires_in: number = 0;
    public viewer?: IViewer;
    public list?: MultiProviderResult[];
    public lastListUpdate?: Date;

    constructor() {
        super();
        try {
            this.loadData();
        } catch (err) {
            logger.error('[AniListUserData] ' + err);
        }
    }

    public updateList(list: MultiProviderResult[]) {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    public setViewer(viewer: IViewer) {
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

    protected loadData() {
        try {
            logger.warn('[IO] Read anilist user file.');
            if (existsSync(this.getPath())) {
                const loadedString = readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
                if (typeof this.list !== 'undefined') {
                    for (let index = 0; index < this.list.length; index++) {
                        this.list[index] = Object.assign(new MultiProviderResult(this.list[index].mainProvider), this.list[index]);
                    }
                }
                this.lastListUpdate = loadedData.lastListUpdate;
            }
        } catch (err) {
            logger.error('[AniListUserData] Error on next line.');
            logger.error(err);
        }
    }



    private async saveData() {
        logger.warn('[IO] Write anilist user file.');
        writeFileSync(await this.getPath(), JSON.stringify(this));
    }

    private getPath(): string {
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(new PathHelper().getAppPath(), 'anilist_config.json');
    }
}
