import * as fs from "fs";
import * as path from "path";

import Series from "../../controller/objects/series";
import PathHelper from '../../helpFunctions/path-helper';
import { UserData } from '../user-data';

export class KitsuUserData implements UserData {

    public accessToken: string = '';
    public refreshToken: string = '';
    public expiresIn: number = 0;
    public username: string = '';
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

    public setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.saveData();
    }

    private async saveData() {
        try {
            console.warn('[IO] Write kitsu user file.')
            fs.writeFileSync(await this.getPath(), JSON.stringify(this));
        } catch (err) { }
    }

    private loadData() {
        try {
            console.warn('[IO] Read kitsu user file.')
            if (fs.existsSync(this.getPath())) {
                const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
            }
        } catch (err) {

        }
    }

    private getPath(): string {
        try {
            // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
            return path.join(new PathHelper().getAppPath(), 'kitsu_config.json');
        } catch (err) {
            throw err;
        }
    }
}