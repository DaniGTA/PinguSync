import { writeFileSync } from 'fs';
import logger from '../../logger/logger';
import Series from '../objects/series';
import MainListPath from './main-list-path';

export default class MainListSaver {
    public static saveMainList(series: Series[]) {
        logger.log('info', 'Save list: ' + series.length);
        logger.log('info', MainListPath.getPath());
        writeFileSync(MainListPath.getPath(), JSON.stringify(series));
    }
}
