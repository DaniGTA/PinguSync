import { TraktUserInfo } from "./objects/userInfo";
import * as fs from "fs";
import * as path from "path";
import { UserData } from "../userData";
import Series from "../../controller/objects/series";
import PathHelper from '../../../backend/helpFunctions/pathHelper';

export class TraktUserData implements UserData {

    public accessToken: string = '';
    public refreshToken: string = '';
    public expiresIn: number = 0;
    public username: string = '';
    public userInfo: TraktUserInfo | null = null;
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

    public setUserData(userData: TraktUserInfo) {
        this.userInfo = userData;
        this.username = userData.user.name;
        this.saveData();

    }



    private async saveData() {
        try {
            const path = this.getPath();
            console.warn('[IO] Write trakt user file.')
            fs.writeFileSync(path, JSON.stringify(this));
        } catch (err) { }
    }

    private loadData() {
        try {
            const path = this.getPath();
            console.warn('[IO] Read trakt user file. ' + path)
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
