import stringHelper from '../../helpFunctions/string-helper';
import Series from './series';
import FrontendSeriesInfos from './transfer/frontend-series-infos';
import { PreferedSeriesNameHelper } from './settings/prefered-series-name';
import Name from './meta/name';
import logger from '../../logger/logger';

/**
 * Contains all Relations of a Series.
 */
export default class SeriesPackage {
    public id: string;
    public allRelations: FrontendSeriesInfos[] = [];
    constructor(...series: Series[]) {
        for (const serie of series) {
            if (this.allRelations.findIndex((x) => serie.id === x.id) === -1) {
                this.allRelations.push(new FrontendSeriesInfos(serie));
            }
        }

        this.id = stringHelper.randomString(25);
    }

    public getAnyCoverUrl(): string {
        for (let relation of this.allRelations) {
            relation = Object.assign(new Series(), relation);
            const result = relation.getCoverImage();
            if (result) {
                return result.url;
            }
        }
        return '';
    }

    public async getPreferedName(): Promise<string> {
        let preferedName = '';
        for (let relation of this.allRelations) {
            try {
                relation = Object.assign(new Series(), relation);
                if ((await relation.getSeason()).seasonNumbers.includes(1) || this.allRelations.length === 1) {
                    preferedName = await new PreferedSeriesNameHelper().getPreferedNameOfSeries(relation);
                    break;
                }
            } catch (err) {
               logger.error(err);
            }
            if (!preferedName) {
                const names = relation.getAllNames();
                if (names.length !== 0) {
                    preferedName = names.sort((a, b) => Name.getSearchAbleScore(b, names) - Name.getSearchAbleScore(a, names))[0].name;
                }
            }
        }
        return preferedName;
    }
}
