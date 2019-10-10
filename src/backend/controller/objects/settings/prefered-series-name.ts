import Name from '../meta/name';
import Series from '../series';
import UserSettings from './user-settings';

export enum PreferedSeriesName {
    NONE,
    ROMANJI,
    JAPANESE,
    ENGLISH,
}

export class PreferedSeriesNameHelper {
    public async getPreferedNameOfSeries(series: Series): Promise<string> {
        const userSettings = new UserSettings();
        const seriesNames = await series.getAllNamesUnique();

        try {
            return Name.getRomajiName(seriesNames);
        } catch (err) {
            console.error(err);
        }

        return seriesNames[0].name;
    }
}
