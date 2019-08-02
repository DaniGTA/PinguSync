import { InfoProviderLocalData } from '../../controller/objects/infoProviderLocalData';
import TVDBProvider from './tvdbProvider';
import { TVDBSeries } from './models/getSeries';
import Cover from '../../controller/objects/meta/Cover';

export default class TVDBConverter {
    convertSeriesToProviderLocalData(series: TVDBSeries): InfoProviderLocalData {
        const infoProviderLocalData = new InfoProviderLocalData(TVDBProvider.Instance);

        infoProviderLocalData.lastExternalChange = new Date(series.data.lastUpdated);
        infoProviderLocalData.id = series.data.id;
        infoProviderLocalData.publicScore = series.data.siteRating;
        infoProviderLocalData.rawEntry = series;
        infoProviderLocalData.covers.push(new Cover(series.data.banner));

        return infoProviderLocalData;
    }
}
