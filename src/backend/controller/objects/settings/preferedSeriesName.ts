import Series from '../series';
import Names from '../meta/names';
import UserSettings from './userSettings';

export enum PreferedSeriesName {
    NONE,
    ROMANJI,
    JAPANESE,
    ENGLISH


}

export class PreferedSeriesNameHelper {
    async getPreferedNameOfSeries(series: Series): Promise<string> {
        const userSettings = new UserSettings();
        const seriesNames = Object.assign(new Names(), series.names);
        const names = await seriesNames.getAllNames();
        try {
            if (userSettings.preferedSeriesName === PreferedSeriesName.ENGLISH) {
                if (seriesNames.engName) {
                    return seriesNames.engName;
                } else {
                    return seriesNames.getRomajiName();
                }
            } else if (userSettings.preferedSeriesName === PreferedSeriesName.ROMANJI) {
                if (seriesNames.romajiName) {
                    return seriesNames.romajiName;
                } else {
                    return seriesNames.getRomajiName();
                }
            } else {
                return seriesNames.getRomajiName();
            }
        } catch (err) { }

        return (await seriesNames.getAllNames())[0];
    }
}
