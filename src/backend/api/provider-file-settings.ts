import path from 'path'
import PathHelper from '../helpFunctions/path-helper'
import logger from '../logger/logger'
import * as fs from 'fs'
export default abstract class ProviderFileSettings {
    constructor() {
        this.loadData()
    }

    public loadData(): void {
        try {
            const filePath = this.getPath()
            logger.debug(`[IO] Read ${this.getConfigFileName()} user file. | path: ${filePath} `)
            if (fs.existsSync(filePath)) {
                const loadedString = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' })
                const loadedData = JSON.parse(loadedString) as this
                Object.assign(this, loadedData)
            }
        } catch (err) {
            logger.error(err as string)
        }
    }

    public saveData(): void {
        try {
            logger.debug(`[IO] Write ${this.getConfigFileName()} user file.`)
            const filePath = this.getPath()
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath)
            }
            fs.writeFileSync(filePath, JSON.stringify(this), { encoding: 'utf8', flag: 'w+' })
        } catch (err) {
            logger.error(err as string)
        }
    }

    protected getPath(): string {
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(new PathHelper().getAppPath(), this.getConfigFileName())
    }

    private getConfigFileName(): string {
        return this.constructor.name + 'Config.json'
    }
}
