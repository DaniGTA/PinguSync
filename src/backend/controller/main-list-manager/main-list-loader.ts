import { existsSync, readFileSync } from 'fs';
import logger from '../../logger/logger';
import Series from '../objects/series';
import MainListPath from './main-list-path';
import { TypedJSON } from 'typedjson';
export default class MainListLoader {
    /**
     * Load json data from file.
     * The json file contains all series that got added to the mainlist.
     */
    public static loadData(): Series[] {
        logger.log('info', 'Load list file...');
        try {
            if (existsSync(MainListPath.getPath())) {
                const dataPath = MainListPath.getPath();
                const loadedString = readFileSync(dataPath, 'UTF-8');
                const loadedData = JSON.parse(loadedString);
                logger.log('info', 'Items loaded: ' + loadedData.length);
                return this.convertJSONArrayToSeriesArray(loadedData);
            } else {
                logger.error('File not exist');
            }
        } catch (err) {
            logger.error(err);
            return [];
        }
        return [];
    }
    private static convertJSONArrayToSeriesArray(jsonEntityArray: any) {
        const seriesArray: Series[] = [];
        if (Array.isArray(jsonEntityArray)) {
            for (const jsonEntity of jsonEntityArray) {
                const series = this.convertJSONToSeries(jsonEntity);
                seriesArray.push(series);
            }
        }
        return seriesArray;
    }

    private static convertJSONToSeries(jsonEntity: any): Series {
        const serializer = new TypedJSON(Series);
        const object = new Series();

        const json = serializer.stringify(object);
        const object2 = serializer.parse(json) as Series;

        return object2;
    }
}
