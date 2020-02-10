import Season from '../controller/objects/meta/season';
import Series from '../controller/objects/series';
import { InfoProviderLocalData } from '../controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../controller/provider-manager/provider-list';
import logger from '../logger/logger';
import ProviderDataWithSeasonInfo from './provider/provider-info-downloader/provider-data-with-season-info';
import providerInfoDownloaderhelper from './provider/provider-info-downloader/provider-info-downloaderhelper';
import { MediaType } from '../controller/objects/meta/media-type';
import MediaTypeComperator from './comperators/media-type-comperator';
import { AbsoluteResult } from './comperators/comperator-results.ts/comperator-result';

export default class PrequelGeneratorHelper {
    private series: Series;
    constructor(series: Series) {
        this.series = series;
    }
    public async generatePrequel(series: Series, season: Season, lowerSeasonNumber = true, mediaType?: MediaType): Promise<Series | null> {
        let newSNumber;
        if (season.isSeasonNumberPresent() && season.seasonNumber !== undefined && season.seasonNumber > 0) {
            if (lowerSeasonNumber) {
                newSNumber = season.seasonNumber - 1;
            }
            for (const localdataProvider of series.getAllProviderLocalDatas()) {
                try {
                    if (localdataProvider.prequelIds && localdataProvider.prequelIds.length !== 0) {
                        for (const id of localdataProvider.prequelIds) {
                            return this.createPrequel(localdataProvider, id, new Season(newSNumber), mediaType);
                        }

                    }
                } catch (err) {
                    logger.error(err);
                }
            }
        }
        return null;
    }

    private async createPrequel(localdataProvider: ProviderLocalData, id: number | string, season: Season, mediaType?: MediaType): Promise<Series | null> {
        let newProvider = null;
        const currentMediaType = mediaType ? mediaType : localdataProvider.mediaType;
        const externalProvider = ProviderList.getExternalProviderInstance(localdataProvider);
        if (localdataProvider instanceof ListProviderLocalData) {
            newProvider = new ProviderDataWithSeasonInfo(new ListProviderLocalData(id, localdataProvider.provider));
        } else if (localdataProvider instanceof InfoProviderLocalData) {
            newProvider = new ProviderDataWithSeasonInfo(new InfoProviderLocalData(id, localdataProvider.provider));
        }
        const newSeries = new Series();
        if (newProvider) {
            const providerResult = await providerInfoDownloaderhelper.downloadProviderSeriesInfo(newSeries, externalProvider);
            await newSeries.addProviderDatasWithSeasonInfos(providerResult.mainProvider);
            const mediaTypeComperatorResult = await MediaTypeComperator.comperaMediaType(providerResult.mainProvider.providerLocalData.mediaType, currentMediaType);
            if (mediaTypeComperatorResult.isAbsolute === AbsoluteResult.ABSOLUTE_FALSE) {
                return this.generatePrequel(newSeries, season, false, currentMediaType);
            }
            return newSeries.getFirstSeason(undefined, season);
        }
        return null;
    }
}
