import { writeFileSync } from 'fs'
import logger from '../../logger/logger'
import Series from '../objects/series'
import MainListPath from './main-list-path'

export default class MainListSaver {
    public static saveMainList(series: Series[]): void {
        try {
            logger.info(`Save list: ${series.length}`)
            logger.info(`Saved list at: ${MainListPath.getPath()}`)
            writeFileSync(MainListPath.getPath(), JSON.stringify(series))
        } catch (err) {
            logger.error(err)
        }
    }
}
