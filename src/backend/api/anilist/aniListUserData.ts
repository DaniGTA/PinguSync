import { Viewer } from './graphql/viewer';
import { UserData } from '../userData';
import Anime from '../../../backend/controller/objects/anime';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import PathHelper from '../../../backend/helpFunctions/pathHelper';
import * as path from "path";

export class AniListUserData implements UserData {
    username: string = '';
    access_token: string = "";
    refresh_token: string = "";
    expires_in: number = 0;
    viewer: Viewer | undefined;
    list: Anime[] | undefined;
    lastListUpdate: Date | undefined;

    constructor() {
        this.loadData();
    }

    updateList(list: Anime[]) {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    setViewer(viewer: Viewer) {
        this.viewer = viewer;
        this.username = viewer.name;
        this.saveData();
    }

    setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        this.access_token = accessToken;
        this.refresh_token = refreshToken;
        this.expires_in = expiresIn;
        this.saveData();
    }



    private async saveData() {
        console.warn('[IO] Write anilist user file.')
        writeFileSync(await this.getPath(), JSON.stringify(this));
    }

    private loadData() {
        try {
            console.warn('[IO] Read anilist user file.')
            if (existsSync(this.getPath())) {
                var loadedString = readFileSync(this.getPath(), "UTF-8");
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
                if (typeof this.list != 'undefined') {
                    for (let index = 0; index < this.list.length; index++) {
                        this.list[index] = Object.assign(new Anime(), this.list[index]);
                    }
                }
                this.lastListUpdate = loadedData.lastListUpdate;
            }
        } catch (err) {

        }
    }

    private getPath(): string {
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(new PathHelper().getAppPath(), 'anilist_config.json');
    }
}
