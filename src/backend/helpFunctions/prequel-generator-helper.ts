import { MediaType } from '../controller/objects/meta/media-type';
import Season from '../controller/objects/meta/season';
import Series from '../controller/objects/series';
import { InfoProviderLocalData } from '../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import logger from '../logger/logger';
import { AbsoluteResult } from './comperators/comperator-results.ts/comperator-result';
import MediaTypeComperator from './comperators/media-type-comperator';
import NewProviderHelper from './provider/new-provider-helper';
import ProviderLocalDataWithSeasonInfo from './provider/provider-info-downloader/provider-data-with-season-info';

export default class PrequelGeneratorHelper {
    private series: Series;
    constructor(series: Series) {
        this.series = series;
    }
    public async generatePrequel(series: Series, season: Season, lowerSeasonNumber = true, mediaType?: MediaType): Promise<Series | null> {
        let newSNumber;
        const currentSeasonNumber = season.getSingleSeasonNumberAsNumber();
        if (season.isSeasonNumberPresent() && currentSeasonNumber !== undefined && currentSeasonNumber > 0) {
            if (lowerSeasonNumber) {
                newSNumber = currentSeasonNumber - 1;
            }
            for (const localdataProvider of series.getAllProviderLocalDatas()) {
                try {
                    if (localdataProvider.prequelIds && localdataProvider.prequelIds.length !== 0) {
                        for (const id of localdataProvider.prequelIds) {
                            return await this.createPrequel(localdataProvider, id, new Season(newSNumber), mediaType);
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
        if (localdataProvider instanceof ListProviderLocalData) {
            newProvider = new ProviderLocalDataWithSeasonInfo(new ListProviderLocalData(id, localdataProvider.provider));
        } else if (localdataProvider instanceof InfoProviderLocalData) {
            newProvider = new ProviderLocalDataWithSeasonInfo(new InfoProviderLocalData(id, localdataProvider.provider));
        }
        let newSeries = new Series();
        if (newProvider) {
            await newSeries.addProviderDatasWithSeasonInfos(newProvider);
            newSeries = await NewProviderHelper.getAllRelevantProviderInfosForSeries(newSeries);
            const mediaTypeComperatorResult = MediaTypeComperator.comperaMediaType(await newSeries.getMediaType(), currentMediaType);
            if (mediaTypeComperatorResult.isAbsolute === AbsoluteResult.ABSOLUTE_FALSE) {
                return this.generatePrequel(newSeries, season, false, currentMediaType);
            }
            return newSeries.getFirstSeason(undefined, season);
        }
        return null;
    }
}
