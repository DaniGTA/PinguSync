import listHelper from '../../helpFunctions/list-helper';
import seriesHelper from '../../helpFunctions/series-helper';
import Series from '../objects/series';
import SeriesPackage from '../objects/series-package';
import MainListManager from './main-list-manager';

export default class MainListPackageManager {
    public async getIndexFromPackageId(packageId: string, list: readonly Series[] | Series[]): Promise<number> {
        return list.findIndex((x) => packageId === x.id);
    }

    public async getSeriesPackages(list: readonly Series[] | Series[]): Promise<SeriesPackage[]> {
        let tempList = [...list];

        const seriesPackageList: SeriesPackage[] = [];

        for (const entryList of tempList) {
            try {
                const tempPackage = await this.createSeriesPackage(entryList, tempList);
                tempList = await listHelper.removeEntrys(tempList, ...tempPackage.allRelations);
                for (const entry of tempPackage.allRelations) {
                    for (const entry2 of tempPackage.allRelations) {
                        if ((await entry.getSeason()).seasonNumber === (await entry2.getSeason()).seasonNumber && entry.id !== entry2.id) {
                            const result = await seriesHelper.isSameSeries(entry, entry2);
                            console.log('Same season in package. Detected as same series:' + result);
                        }
                    }
                }
                seriesPackageList.push(tempPackage);
            } catch (err) {
                console.error(err);
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
            console.error('Cant create package for: ');
            console.error(series);
            throw new Error('cant create package');
        }
    }
}
