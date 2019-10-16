
import Cover from '../../controller/objects/meta/cover';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import Overview from '../../controller/objects/meta/overview';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { TVDBSeries } from './models/getSeries';
import { SeriesSearchResult } from './models/searchResults';
import TVDBProvider from './tvdb-provider';

export default class TVDBConverter {
    public async convertSeriesToProviderLocalData(series: TVDBSeries): Promise<InfoProviderLocalData> {
        const infoProviderLocalData = new InfoProviderLocalData(series.data.id, TVDBProvider);
        infoProviderLocalData.lastExternalChange = new Date(series.data.lastUpdated);
        infoProviderLocalData.publicScore = series.data.siteRating;
        infoProviderLocalData.rawEntry = series;
        infoProviderLocalData.banners.push(new Cover(series.data.banner));
        infoProviderLocalData.addSeriesName(new Name(series.data.slug, 'slug', NameType.SLUG));
        infoProviderLocalData.addSeriesName(new Name(series.data.seriesName, 'eng', NameType.OFFICIAL));
        infoProviderLocalData.hasFullInfo = true;
        if (series.data.firstAired) {
            infoProviderLocalData.releaseYear = new Date(series.data.firstAired).getFullYear();
        }
        return infoProviderLocalData;
    }

    public async convertSearchResultToProviderLocalData(searchResult: SeriesSearchResult): Promise<InfoProviderLocalData> {
        if (searchResult.id) {
            const infoProviderLocalData = new InfoProviderLocalData(searchResult.id, TVDBProvider);

            infoProviderLocalData.rawEntry = searchResult;
            if (searchResult.slug) {
                infoProviderLocalData.addSeriesName(new Name(searchResult.slug, 'slug', NameType.SLUG));
            }
            if (searchResult.seriesName) {
                infoProviderLocalData.addSeriesName(new Name(searchResult.seriesName, 'eng', NameType.OFFICIAL));
            }
            if (searchResult.overview) {
                infoProviderLocalData.addOverview(new Overview(searchResult.overview, 'en'));
            }
            if (searchResult.firstAired) {
                infoProviderLocalData.releaseYear = new Date(searchResult.firstAired).getFullYear();
            }

            return infoProviderLocalData;
        }
        throw new Error('[TVDBConverter] no id');
    }

    public async convertSearchResultToSeries(searchResult: SeriesSearchResult): Promise<InfoProviderLocalData> {
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
