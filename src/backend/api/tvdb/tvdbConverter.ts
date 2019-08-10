import { InfoProviderLocalData } from '../../controller/objects/infoProviderLocalData';
import TVDBProvider from './tvdbProvider';
import { TVDBSeries } from './models/getSeries';
import Cover from '../../controller/objects/meta/Cover';
import { SeriesSearchResult } from './models/searchResults';
import Series from '../../controller/objects/series';
import Name from '../../controller/objects/meta/name';
import Overview from '../../controller/objects/meta/overview';

export default class TVDBConverter {
    async convertSeriesToProviderLocalData(series: TVDBSeries): Promise<InfoProviderLocalData> {
        const infoProviderLocalData = new InfoProviderLocalData(TVDBProvider.Instance);

        infoProviderLocalData.lastExternalChange = new Date(series.data.lastUpdated);
        infoProviderLocalData.id = series.data.id;
        infoProviderLocalData.publicScore = series.data.siteRating;
        infoProviderLocalData.rawEntry = series;
        infoProviderLocalData.covers.push(new Cover(series.data.banner));

        return infoProviderLocalData;
    }

    async convertSearchResultToProviderLocalData(searchResult: SeriesSearchResult):  Promise<InfoProviderLocalData> {
        const infoProviderLocalData = new InfoProviderLocalData(TVDBProvider.Instance);
        if(searchResult.id){
            infoProviderLocalData.id = searchResult.id;
        }
        infoProviderLocalData.rawEntry = searchResult;


        return infoProviderLocalData;
    }

    async convertSearchResultToSeries(searchResult: SeriesSearchResult):  Promise<Series>{
        let series = new Series();
        if(searchResult.seriesName){
            series.addSeriesName(new Name(searchResult.seriesName,'en'));
        }
        if(searchResult.slug){
            series.addSeriesName(new Name(searchResult.slug,'slug'));
        }
        if(searchResult.firstAired){
            series.releaseYear = new Date(searchResult.firstAired).getFullYear();
        }
        if(searchResult.overview){
            series.addOverview(new Overview(searchResult.overview,'en'));
        }
        await series.addInfoProvider(await this.convertSearchResultToProviderLocalData(searchResult));
        return series;
    }
}
