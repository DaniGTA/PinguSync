import { InfoProviderLocalData } from '../../controller/objects/infoProviderLocalData';
import TVDBProvider from './tvdbProvider';

export default class TVDBConverter {
    convertSeriesToProviderLocalData(series: Series): InfoProviderLocalData {
        const infoProviderLocalData = new InfoProviderLocalData(TVDBProvider.Instance);

        infoProviderLocalData.lastExternalChange = new Date(series.data.lastUpdated);
        infoProviderLocalData.id = series.data.id;
        infoProviderLocalData.publicScore = series.data.siteRating;
        infoProviderLocalData.rawEntry = series;

        return infoProviderLocalData;
    }
}
