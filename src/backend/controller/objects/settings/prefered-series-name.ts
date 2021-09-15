import logger from '../../../logger/logger'
import Name from '../meta/name'
import Series from '../series'
import UserSettings from './user-settings'

export enum PreferedSeriesName {
    NONE,
    ROMANJI,
    JAPANESE,
    ENGLISH,
}

export class PreferedSeriesNameHelper {
    public getPreferedNameOfSeries(series: Series): string {
        const userSettings = new UserSettings()
        const seriesNames = series.getAllNamesUnique()

        try {
            return Name.getRomajiName(seriesNames)
        } catch (err) {
            logger.error('Error at PreferedSeriesNameHelper.getPreferedNameOfSeries')
            logger.error(err)
        }

        return seriesNames[0].name
    }
}
