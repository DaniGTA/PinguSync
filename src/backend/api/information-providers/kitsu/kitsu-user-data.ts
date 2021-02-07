import Series from '../../../controller/objects/series';
import logger from '../../../logger/logger';
import { UserData } from '../../user-data';

export class KitsuUserData extends UserData {
    protected configFileName = 'kitsu_config.json';
    public expiresIn = 0;
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


    public updateList(list: Series[]): void {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    public setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.saveData();
    }
}
