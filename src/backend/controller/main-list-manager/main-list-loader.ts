import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import logger from '../../logger/logger';
import Series from '../objects/series';
export default class MainListLoader {
    /**
     * Load json data from file.
     * The json file contains all series that got added to the mainlist.
     */
    public static loadData(): Series[] {
        logger.log('info', 'Load list file...');
        try {
            if (existsSync(this.getPath())) {
                const dataPath = this.getPath();
                const loadedString = readFileSync(dataPath, 'UTF-8');
                const loadedData = JSON.parse(loadedString) as Series[];
                logger.log('info', 'Items loaded: ' + loadedData.length);
                for (let index = 0; index < loadedData.length; index++) {
                    loadedData[index] = Object.assign(new Series(), loadedData[index]);
                    loadedData[index].readdFunctions();
                }
                return loadedData;
            } else {
                logger.error('File not exist');
            }
        } catch (err) {
            logger.error(err);
            return [];
        }
        return [];
    }

    /**
     * Save the main list to a json file.
     * @param list the main list.
     */
    public static async saveData(list: Series[]) {
        logger.log('info', 'Save list: ' + list.length);
        logger.log('info', this.getPath());
        writeFileSync(this.getPath(), JSON.stringify(list));
    }

    private static getPath(): string {
        const userDataPath = './';
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'list.json');
    }
}
