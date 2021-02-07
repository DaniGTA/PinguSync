import { IViewer } from './graphql/viewer';
import logger from '../../../logger/logger';
import MultiProviderResult from '../../provider/multi-provider-result';
import { UserData } from '../../user-data';

export class AniListUserData extends UserData {
    protected configFileName = 'anilist_config.json';
    public createdToken: Date = new Date();
    public expiresIn = 0;
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

    public updateList(list: MultiProviderResult[]): void {
        this.list = list;
        this.lastListUpdate = new Date(Date.now());
        this.saveData();
    }

    public setViewer(viewer: IViewer): void {
        this.viewer = viewer;
        this.userName = viewer.name;
        this.saveData();
    }

    public setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.saveData();
    }
}
