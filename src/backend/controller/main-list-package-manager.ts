import SeriesPackage from './objects/series-package';
import listHelper from '../helpFunctions/list-helper';
import Series from './objects/series';

export default class MainListPackageManager {
    public async getIndexFromPackageId(packageId: string,list: Series[]): Promise<number> {
        return list.findIndex(x => packageId === x.id);
    }

    public async getSeriesPackages(list: Series[]): Promise<SeriesPackage[]> {
        let tempList = [...list];

        const seriesPackageList: SeriesPackage[] = [];

        for (let entry of tempList) {
            try {
                const tempPackage = await this.createPackage(entry, tempList);
                tempList = await listHelper.removeEntrys(tempList, ...tempPackage.allRelations);
                seriesPackageList.push(tempPackage);
            } catch (err) { }
        }
        return seriesPackageList;
    }

    private async createPackage(series: Series, list: Series[]): Promise<SeriesPackage> {
        try {
            series = Object.assign(new Series(), series);
            const relations = await series.getAllRelations(list, true);
            const tempPackage = new SeriesPackage(...relations);

            for (const relation of relations) {
                const index = list.findIndex(x => x.id === relation.id);
                if (index != -1) {
                    relation.packageId = tempPackage.id;
                    list[index] = relation;
                }
            }
            return tempPackage;
        } catch (err) {
            console.error("Cant create package for: ")
            console.error(series);
            throw "cant create package";
        }
    }

    public async getSeriesPackage(series: Series,list:Series[]): Promise<SeriesPackage> {
        if (series.packageId) {
            const allSeriesInThePackage = list.filter(x => x.packageId === series.packageId);
            const seriesPackage = new SeriesPackage(...allSeriesInThePackage);
            seriesPackage.id = series.packageId;
            return seriesPackage;
        } else {
            return this.createPackage(series,list);
        }
    }
}