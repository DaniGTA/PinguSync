import { existsSync, readFileSync, writeFileSync } from 'fs'
import logger from '../../logger/logger'
import Series from '../objects/series'
import MainListPath from './main-list-path'
export default class MainListLoader {
    /**
     * Load json data from file.
     * The json file contains all series that got added to the mainlist.
     */
    public static loadData(): Series[] {
        logger.info('Load list file...')
        try {
            if (existsSync(MainListPath.getPath())) {
                const dataPath = MainListPath.getPath()
                const loadedString = readFileSync(dataPath, { encoding: 'utf8' })
                const loadedData = JSON.parse(loadedString)
                logger.info(`Items loaded: ${loadedData?.length}`)
                return this.convertJSONArrayToSeriesArray(loadedData)
            } else {
                logger.warn('File not exist, creating file...')
                writeFileSync(MainListPath.getPath(), '')
            }
        } catch (err) {
            logger.error(err as string)
            return []
        }
        return []
    }
    private static convertJSONArrayToSeriesArray(jsonEntityArray: any): Series[] {
        const seriesArray: Series[] = []
        if (Array.isArray(jsonEntityArray)) {
            for (const jsonEntity of jsonEntityArray) {
                const series = this.convertJSONToSeries(jsonEntity)
                seriesArray.push(series)
            }
        }
        return seriesArray
    }

    private static convertJSONToSeries(jsonEntity: any): Series {
        const series: Series = Object.setPrototypeOf(jsonEntity, Series.prototype) as Series
        series.loadPrototypes()
        return series
    }
}
