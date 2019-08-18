import { existsSync, writeFileSync, readFileSync } from 'fs';
import Series from '../objects/series';
import * as path from "path";
export default class MainListLoader {
    loadData(): Series[] {
        console.log('Load list file...');
        try {
            if (existsSync(this.getPath())) {
                const loadedString = readFileSync(this.getPath(), 'UTF-8');
                const loadedData = JSON.parse(loadedString) as Series[];
                console.log('Items loaded: '+loadedData.length)
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

    async saveData(list: Series[]) {
        console.log('Save list');
        console.log(this.getPath());
        writeFileSync(this.getPath(), JSON.stringify(list));
    }

    private getPath(): string {
        const userDataPath = './';
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'list.json');
    }
}