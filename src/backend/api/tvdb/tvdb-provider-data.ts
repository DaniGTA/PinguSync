
import * as fs from 'fs';
import * as path from 'path';
import PathHelper from '../../helpFunctions/path-helper';

export class TVDBProviderData {

    public accessToken?: string;
    public expiresIn?: number;
    constructor() {
        this.loadData();
    }

    public setTokens(accessToken: string, expiresIn: number) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.saveData();
    }

    private async saveData() {
        try {
            const dataPath = this.getPath();
            console.warn('[IO] Write tvdb user file.');
            fs.writeFileSync(dataPath, JSON.stringify(this));
        } catch (err) {
            console.error(err);
        }
    }

    private loadData() {
        try {
            const dataPath = this.getPath();
            console.warn('[IO] Read tvdb user file. ' + dataPath);
            if (fs.existsSync(dataPath)) {
                const loadedString = fs.readFileSync(dataPath, 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
            }
        } catch (err) {
            console.error(err);
        }
    }

    private getPath(): string {
        try {
            // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
            return path.join(new PathHelper().getAppPath(), 'tvdb_config.json');
        } catch (err) {
            throw err;
        }
    }
}
