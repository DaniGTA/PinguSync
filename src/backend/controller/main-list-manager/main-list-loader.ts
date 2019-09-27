import { existsSync, writeFileSync, readFileSync } from 'fs';
import Series from '../objects/series';
import * as path from "path";
export default class MainListLoader {
    /**
     * Load json data from file.
     * The json file contains all series that got added to the mainlist.
     */
    static loadData(): Series[] {
        console.log('Load list file...');
        try {
            if (existsSync(this.getPath())) {
                const loadedString = readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as Series[];
                console.log('Items loaded: ' + loadedData.length)
                for (let index = 0; index < loadedData.length; index++) {
                    loadedData[index] = Object.assign(new Series(), loadedData[index]);
                    loadedData[index].readdFunctions();
                }
                return loadedData;
            }
        } catch (err) {
            console.log(err);
            return [];
        }
        console.log('File not exist');
        return [];
    }

    /**
     * Save the main list to a json file.
     * @param list the main list.
     */
    static async saveData(list: Series[]) {
        console.log('Save list: '+list.length);
        console.log(this.getPath());
        writeFileSync(this.getPath(), JSON.stringify(list));
    }

    private static getPath(): string {
        const userDataPath = './';
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'list.json');
    }
}
