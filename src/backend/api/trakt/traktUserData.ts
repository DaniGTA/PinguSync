import { TraktUserInfo } from "./objects/userInfo";
import * as fs from "fs";
import * as path from "path";
import { UserData } from "../userData";
import Anime from "../../controller/objects/anime";
import ProviderController from '@/backend/controller/providerController';

export class TraktUserData implements UserData {

    public accessToken: string = '';
    public refreshToken: string = '';
    public expiresIn: number = 0;
    public username: string = '';
    public userInfo: TraktUserInfo | null = null;
    public list: Anime[] | undefined;
    public lastListUpdate: Date | undefined;
    constructor() {
        this.loadData();
    }


    public updateList(list: Anime[]) {
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
            console.warn('[IO] Write trakt user file.')
            fs.writeFileSync(await this.getPath(), JSON.stringify(this));
        } catch (err) { }
    }

    private async loadData() {
        try {
            console.warn('[IO] Read trakt user file.')
            if (fs.existsSync(await this.getPath())) {
                const loadedString = fs.readFileSync(await this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
            }
        } catch (err) {

        }
    }

    private async getPath(): Promise<string> {
        try {
            const userDataPath = './';
            // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
            return path.join(userDataPath + await ProviderController.getInstance().getPath(), 'trakt_config.json');
        } catch (err) {
            throw err;
        }
    }
}
