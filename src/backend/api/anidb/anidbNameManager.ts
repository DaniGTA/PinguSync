import * as fs from "fs";
import * as path from "path";
import AniDBNameProvider from './anidbNameProvider';
import AniDBNameListXML from './objects/anidbNameListXML';

export default class AniDBNameManager {
    constructor() {
        this.loadData();
    }
    lastDownloadTime: Date | undefined;
    data: AniDBNameListXML | undefined;

    public updateData(time: Date, data?: AniDBNameListXML) {
        console.log('[update] -> anidb -> data');
        this.lastDownloadTime = time;
        this.data = data;
        this.saveData();
    }

    private async saveData() {
        try {
            console.log('[Save] -> AniDB -> Names');
            fs.writeFileSync(this.getPath(), JSON.stringify(this));
        } catch (err) { }
    }

    private loadData() {
        try {
            if (fs.existsSync(this.getPath())) {
                const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
                if (this.data) {
                    this.data = JSON.parse(this.data as unknown as string);
                }
            }
        } catch (err) {

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
