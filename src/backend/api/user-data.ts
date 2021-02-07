import logger from '../logger/logger';
import * as fs from 'fs';
import PathHelper from '../helpFunctions/path-helper';
import path from 'path';

export abstract class UserData {
    public accessToken = '';
    public refreshToken: string | undefined;
    public userName = '';
    public userImageUrl = '';
    public userJoined: Date | undefined;
    /**
     * Config file name like:
     * `provider_name.json`
     * @abstract
     * @type {string}
     * @memberof UserData
     */
    protected abstract configFileName: string;

    public logout(): void {
        this.accessToken = '';
        this.refreshToken = undefined;
        this.userImageUrl = '';
        this.userName = '';
        this.userJoined = undefined;
    }

    protected loadData(): void {
        try {
            logger.debug(`[IO] Read ${this.configFileName} user file.`);
            if (fs.existsSync(this.getPath())) {
                const loadedString = fs.readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as this;
                Object.assign(this, loadedData);
            }
        } catch (err) {
            logger.error(err);
        }
    }

    protected saveData(): void {
        try {
            logger.debug(`[IO] Write ${this.configFileName} user file.`);
            fs.writeFileSync(this.getPath(), JSON.stringify(this));
        } catch (err) {
            logger.error(err);
        }
    }

    protected getPath(): string {
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(new PathHelper().getAppPath(), this.configFileName);
    }
}
