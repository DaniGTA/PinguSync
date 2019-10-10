import * as fs from 'fs';
import * as path from 'path';
import logger from '../../logger/logger';
import AniDBNameListXML from './objects/anidbNameListXML';

export default class AniDBNameManager {
    public lastDownloadTime: Date | undefined;
    public data: AniDBNameListXML | undefined;
    constructor() {
        this.loadData();
    }

    public updateData(time: Date, data?: AniDBNameListXML) {
       logger.log('info', '[update] -> anidb -> data');
       this.lastDownloadTime = time;
       this.data = data;
       this.saveData();
    }

    private async saveData() {
        try {
           logger.log('info', '[Save] -> AniDB -> Names');
           fs.writeFileSync(this.getPath(), JSON.stringify(this));
        } catch (err) {
           logger.error(err);
        }
    }

    private loadData() {
        try {
            if (fs.existsSync(this.getPath())) {
                const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
                if (this.data) {
                    this.data = Object.freeze(JSON.parse(this.data as unknown as string));
                }
            }
        } catch (err) {
           logger.error(err);
        }
    }
    private getPath(): string {
        try {
            const userDataPath = './';
            // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
            return path.join(userDataPath, 'anidb_config.json');
        } catch (err) {
            throw err;
        }
    }
}
