import * as fs from 'fs';
import * as path from 'path';
import logger from '../../../logger/logger';
import AniDBNameListXML from './objects/anidbNameListXML';

export default class AniDBNameManager {
    public lastDownloadTime: Date | undefined;
    public data: AniDBNameListXML | undefined;

    public getData(): AniDBNameListXML {
        if (this.data) {
            return this.data;
        } else {
            this.data = this.loadData();
            return this.data;
        }
    }

    public updateData(time: Date, data?: AniDBNameListXML): void {
        logger.log('info', '[update] -> anidb -> data');
        this.lastDownloadTime = time;
        this.data = data;
        this.saveData();
    }

    public updateOnlyData(data?: AniDBNameListXML): void {
        this.data = data;
        this.saveData();
    }

    private saveData(): void {
        try {
            logger.log('info', '[Save] -> AniDB -> Names');
            fs.writeFileSync(this.getPath(), JSON.stringify(this));
        } catch (err) {
            logger.error('Error at AniDBNameManager.save:');
            logger.error(err);
        }
    }

    private loadData(): AniDBNameListXML {
        if (fs.existsSync(this.getPath())) {
            const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
            const loadedData = JSON.parse(loadedString) as this;
            Object.assign(this, loadedData);
            return Object.freeze(JSON.parse(this.data as unknown as string));
        }
        throw 'File for AniDBNameList not found';
    }
    private getPath(): string {
        const userDataPath = './';
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'anidb_config.json');
    }
}
