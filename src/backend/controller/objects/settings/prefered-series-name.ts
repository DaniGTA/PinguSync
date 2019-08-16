import Series from '../series';
import UserSettings from './user-settings';
import Name from '../meta/name';

export enum PreferedSeriesName {
    NONE,
    ROMANJI,
    JAPANESE,
    ENGLISH
}

export class PreferedSeriesNameHelper {
    async getPreferedNameOfSeries(series: Series): Promise<string> {
        const userSettings = new UserSettings();
        const seriesNames = await series.getAllNames();

        try {
            return Name.getRomajiName(seriesNames);
        } catch (err) { }

        return seriesNames[0].name;
    }
}
