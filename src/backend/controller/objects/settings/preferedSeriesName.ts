import Series from '../series';
import UserSettings from './userSettings';
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
        const seriesNames = series.getAllNames();
        try {
            if (userSettings.preferedSeriesName === PreferedSeriesName.ENGLISH) {
                if (seriesNames) {
                    return seriesNames[0].name;
                } else {
                    return Name.getRomajiName(seriesNames);
                }
            } else if (userSettings.preferedSeriesName === PreferedSeriesName.ROMANJI) {
                return Name.getRomajiName(seriesNames);
            } else {
                return Name.getRomajiName(seriesNames);
            }
        } catch (err) { }

        return seriesNames[0].name;
    }
}
