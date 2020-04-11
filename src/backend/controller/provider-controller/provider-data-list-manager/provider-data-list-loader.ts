import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import logger from '../../../logger/logger';
import Episode from '../../objects/meta/episode/episode';
import { InfoProviderLocalData } from '../provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../provider-manager/local-data/list-provider-local-data';
export default class ProviderDataListLoader {
    /**
     * Load json data from file.
     * The json file contains all series that got added to the mainlist.
     */
    public static loadData(): ProviderLocalData[] {
        logger.log('info', 'Load list file...');
        try {
            if (existsSync(this.getPath())) {
                const dataPath = this.getPath();
                const loadedString = readFileSync(dataPath, 'UTF-8');
                const loadedData = JSON.parse(loadedString) as ProviderLocalData[];
                logger.log('info', 'Items loaded: ' + loadedData.length);
                for (let index = 0; index < loadedData.length; index++) {
                    const loadedDataEntry = loadedData[index];
                    loadedData[index] = this.createProviderLocalDataInstance(loadedDataEntry);
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
    public static async saveData(list: ProviderLocalData[]) {
        logger.log('info', 'Save list: ' + list.length);
        logger.log('info', this.getPath());
        writeFileSync(this.getPath(), JSON.stringify(list));
    }

    private static createProviderLocalDataInstance(loadedDataEntry: ProviderLocalData): ProviderLocalData {
        loadedDataEntry.lastUpdate = new Date(loadedDataEntry.lastUpdate);
        loadedDataEntry.lastExternalChange = new Date(loadedDataEntry.lastExternalChange);
        for (let index2 = 0; index2 < loadedDataEntry.detailEpisodeInfo.length; index2++) {
            const x = loadedDataEntry.detailEpisodeInfo[index2];

            loadedDataEntry.detailEpisodeInfo[index2] = Object.assign(new Episode(x.episodeNumber, x.season, x.title), x);
        }

        if (loadedDataEntry.instanceName === 'ListProviderLocalData') {
            loadedDataEntry = Object.assign(new ListProviderLocalData(loadedDataEntry.id, loadedDataEntry.provider), loadedDataEntry);
        } else if (loadedDataEntry.instanceName === 'InfoProviderLocalData') {
            loadedDataEntry = Object.assign(new InfoProviderLocalData(loadedDataEntry.id, loadedDataEntry.provider), loadedDataEntry);
        } else {
            logger.debug('[ProviderDataListLoader] Object cant be assigned');
        }
        return loadedDataEntry;
    }

    private static getPath(): string {
        const userDataPath = './';
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        return path.join(userDataPath, 'provider_data_list.json');
    }
}
