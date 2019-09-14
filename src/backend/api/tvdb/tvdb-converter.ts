import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import TVDBProvider from './tvdb-provider';
import { TVDBSeries } from './models/getSeries';
import Cover from '../../controller/objects/meta/cover';
import { SeriesSearchResult } from './models/searchResults';
import Name from '../../controller/objects/meta/name';
import Overview from '../../controller/objects/meta/overview';
import { NameType } from '../../controller/objects/meta/name-type';

export default class TVDBConverter {
    async convertSeriesToProviderLocalData(series: TVDBSeries): Promise<InfoProviderLocalData> {
        const infoProviderLocalData = new InfoProviderLocalData(TVDBProvider.Instance);

        infoProviderLocalData.lastExternalChange = new Date(series.data.lastUpdated);
        infoProviderLocalData.id = series.data.id;
        infoProviderLocalData.publicScore = series.data.siteRating;
        infoProviderLocalData.rawEntry = series;
        infoProviderLocalData.banners.push(new Cover(series.data.banner));
        infoProviderLocalData.addSeriesName(new Name(series.data.slug, 'slug', NameType.SLUG));
        infoProviderLocalData.addSeriesName(new Name(series.data.seriesName, 'eng', NameType.OFFICIAL));
        if (series.data.firstAired)
            infoProviderLocalData.releaseYear = new Date(series.data.firstAired).getFullYear();
        return infoProviderLocalData;
    }

    async convertSearchResultToProviderLocalData(searchResult: SeriesSearchResult): Promise<InfoProviderLocalData> {
        const infoProviderLocalData = new InfoProviderLocalData(TVDBProvider.Instance);
        if (searchResult.id) {
            infoProviderLocalData.id = searchResult.id;
        }
        infoProviderLocalData.rawEntry = searchResult;
        if(searchResult.slug)
            infoProviderLocalData.addSeriesName(new Name(searchResult.slug, 'slug', NameType.SLUG));
        if(searchResult.seriesName)
            infoProviderLocalData.addSeriesName(new Name(searchResult.seriesName, 'eng', NameType.OFFICIAL));
        if (searchResult.overview) 
            infoProviderLocalData.addOverview(new Overview(searchResult.overview, 'en'));
        if (searchResult.firstAired)
            infoProviderLocalData.releaseYear = new Date(searchResult.firstAired).getFullYear();

        return infoProviderLocalData;
    }

    async convertSearchResultToSeries(searchResult: SeriesSearchResult): Promise<InfoProviderLocalData> {
        const providerLocalData = await this.convertSearchResultToProviderLocalData(searchResult);
        providerLocalData.rawEntry = searchResult;
        if (searchResult.firstAired) {
            providerLocalData.releaseYear = new Date(searchResult.firstAired).getFullYear();
        }
        if (searchResult.seriesName) {
            providerLocalData.addSeriesName(new Name(searchResult.seriesName, 'en', NameType.OFFICIAL));
        }
        if (searchResult.slug) {
            providerLocalData.addSeriesName(new Name(searchResult.slug, 'slug', NameType.SLUG));
        }

        if (searchResult.overview) {
            providerLocalData.addOverview(new Overview(searchResult.overview, 'en'));
        }
        return providerLocalData;
    }
}
