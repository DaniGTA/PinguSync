import logger from '@/backend/logger/logger'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import * as path from 'path'
import EpisodeBindingPool from '../objects/meta/episode/episode-binding-pool'

export default class EpisodeBindingLoader {
    /**
     * Load json data from file.
     * The json file contains all series that got added to the mainlist.
     */
    public static loadData(): EpisodeBindingPool[] {
        logger.info('Load episode-bindings file...')
        try {
            if (existsSync(this.getPath())) {
                const dataPath = this.getPath()
                const loadedString = readFileSync(dataPath, { encoding: 'utf8' })
                const loadedData = JSON.parse(loadedString) as EpisodeBindingPool[]
                logger.info(`Items loaded: ${loadedData.length}`)
                for (let index = 0; index < loadedData.length; index++) {
                    const loadedDataEntry = loadedData[index]
                    loadedData[index] = this.createProviderLocalDataInstance(loadedDataEntry)
                }
                return loadedData
            } else {
                logger.error('File not exist')
            }
        } catch (err) {
            logger.error(err as string)
            return []
        }
        return []
    }

    /**
     * Save the main list to a json file.
     * @param list the main list.
     */
    public static saveData(list: EpisodeBindingPool[]): void {
        logger.info(`Save list: ${list.length}`)
        logger.info(this.getPath())
        writeFileSync(this.getPath(), JSON.stringify(list))
    }

    private static createProviderLocalDataInstance(loadedDataEntry: EpisodeBindingPool): EpisodeBindingPool {
        return loadedDataEntry
    }

    private static getPath(): string {
        const userDataPath = './'
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'episode-bindings.json')
    }
}
