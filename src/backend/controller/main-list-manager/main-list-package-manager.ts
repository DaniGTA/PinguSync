import listHelper from '../../helpFunctions/list-helper';
import seriesHelper from '../../helpFunctions/series-helper';
import logger from '../../logger/logger';
import Series from '../objects/series';
import SeriesPackage from '../objects/series-package';
import MainListManager from './main-list-manager';
import SeasonComperator from '../../helpFunctions/comperators/season-comperator';
export default class MainListPackageManager {
    public async getIndexFromPackageId(packageId: string, list: readonly Series[] | Series[]): Promise<number> {
        return list.findIndex((x) => packageId === x.id);
    }

    public async getSeriesPackages(list: readonly Series[] | Series[]): Promise<SeriesPackage[]> {
        let tempList = [...list];

        const seriesPackageList: SeriesPackage[] = [];

        for (const entryList of tempList) {
            try {
                if (seriesPackageList.findIndex(x => x.id === entryList.packageId) === -1) {
                    const tempPackage = await this.createSeriesPackage(entryList, tempList);
                    for (const entry of tempPackage.allRelations) {
                        for (const entry2 of tempPackage.allRelations) {
                            const seasonA = entry.getSeason();
                            const seasonB = entry2.getSeason();
                            if (SeasonComperator.isSameSeason(await seasonA, await seasonB) && entry.id !== entry2.id) {
                                const result = await seriesHelper.isSameSeries(entry, entry2);
                                if (result) {
                                    logger.warn('Same season in package. Detected as same series:' + result);
                                }
                            }
                        }
                    }
                    seriesPackageList.push(tempPackage);
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return seriesPackageList;
    }

    public async getSeriesPackage(series: Series, list: Series[]): Promise<SeriesPackage> {
        if (series.packageId) {
            const allSeriesInThePackage = list.filter((x) => x.packageId === series.packageId);
            const seriesPackage = new SeriesPackage(...allSeriesInThePackage);
            seriesPackage.id = series.packageId;
            return seriesPackage;
        } else {
            return this.createSeriesPackage(series, list);
        }
    }

    public async removeSeriesPackage(packageId: string, list: Series[] | readonly Series[]) {
        const allSeriesInThePackage = list.filter((x) => x.packageId === packageId);
        for (const series of allSeriesInThePackage) {
            MainListManager.removeSeriesFromMainList(series);
        }
    }

    private async createSeriesPackage(series: Series, list: Series[]): Promise<SeriesPackage> {
        try {
            series = Object.assign(new Series(), series);
            const relations = await series.getAllRelations(list, true);
            const tempPackage = new SeriesPackage(...relations);

            for (const relation of relations) {
                const index = list.findIndex((x) => x.id === relation.id);
                if (index !== -1) {
                    relation.packageId = tempPackage.id;
                    list[index] = relation;
                }
            }
            return tempPackage;
        } catch (err) {
            logger.error('Cant create package for: ');
            logger.error(series);
            throw new Error('cant create package');
        }
    }
}
