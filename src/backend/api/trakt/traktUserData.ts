import { TraktUserInfo } from "./objects/userInfo";
import path = require('path');
import fs = require('fs');
import { UserData } from "../userData";
import electron = require("electron");
import Anime from "../../controller/objects/anime";

export class TraktUserData implements UserData {

    public accessToken: string = '';
    public refreshToken: string = '';
    public expiresIn: number;
    public username: string;
    public userInfo: TraktUserInfo;
    public list: Anime[];
    public lastListUpdate: Date;
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



    private saveData() {
        fs.writeFileSync(this.getPath(), JSON.stringify(this));
    }

    private loadData() {
        try {
            if (fs.existsSync(this.getPath())) {
                const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
            }
        } catch (err) {
            console.log(err);
        }
    }

    private getPath(): string {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'trakt_config.json');
    }
}