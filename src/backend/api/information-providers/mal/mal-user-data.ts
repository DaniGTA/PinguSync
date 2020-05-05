import * as fs from 'fs';
import { LoginData } from 'node-myanimelist/typings/methods/poly/noApiLogin';
import * as path from 'path';
import Series from '../../../controller/objects/series';
import PathHelper from '../../../helpFunctions/path-helper';
import logger from '../../../logger/logger';
import { UserData } from '../../user-data';


export class MalUserData extends UserData {

    public loginData?: LoginData;
    public username = '';
    public list: Series[] | undefined;
    public lastListUpdate: Date | undefined;
    constructor() {
        super();
        this.loadData();
    }


    public updateList(list: Series[]): void {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    public setLoginData(loginData: LoginData): void {
        this.loginData = loginData;
        this.saveData();
    }
    protected loadData(): void {
        try {
            logger.debug('[IO] Read mal user file.');
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
            logger.debug('[IO] Write mal user file.');
            fs.writeFileSync(this.getPath(), JSON.stringify(this));
        } catch (err) {
            logger.error(err);
        }
    }


    private getPath(): string {
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(new PathHelper().getAppPath(), 'mal_config.json');
    }
}
