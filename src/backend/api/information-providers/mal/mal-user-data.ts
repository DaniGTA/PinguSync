import Series from '../../../controller/objects/series';
import { UserData } from '../../user-data';


export class MalUserData extends UserData {
    public list: Series[] | undefined;
    public lastListUpdate: Date | undefined;
    protected configFileName = 'mal_config.json';
    constructor() {
        super();
        this.loadData();
    }

    public updateList(list: Series[]): void {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    public setToken(loginData: string): void {
        this.accessToken = loginData;
        this.saveData();
    }
}
