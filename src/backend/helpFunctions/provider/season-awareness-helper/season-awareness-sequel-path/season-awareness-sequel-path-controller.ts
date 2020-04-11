import MainListAdder from '../../../../controller/main-list-manager/main-list-adder';
import Season from '../../../../controller/objects/meta/season';
import Series from '../../../../controller/objects/series';
import { InfoProviderLocalData } from '../../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import logger from '../../../../logger/logger';
import EpisodeRelationAnalyser from '../../../episode-helper/episode-relation-analyser';
import ProviderLocalDataWithSeasonInfo from '../../provider-info-downloader/provider-data-with-season-info';
import SeasonAwarenessPathController from '../season-awareness-path-controller';

export default class SeasonAwarenessSequelPathController {
    public static getSequel(providerThatHasAwareness: ProviderLocalData): ProviderLocalData | undefined {
        if (providerThatHasAwareness.sequelIds.length !== 0) {
            const sequels = this.getSequelProviderLocalDatas(providerThatHasAwareness, providerThatHasAwareness.provider);
            for (const sequel of sequels) {
                return sequel;
            }
        }
    }


    public static async processSequel(
        providerThatHasAwareness: ProviderLocalData,
        providerWithoutAwareness: ProviderLocalData, targetSeason: Season): Promise<ProviderLocalDataWithSeasonInfo[]> {
        if (providerThatHasAwareness.sequelIds.length !== 0) {
            const sequels = this.getSequelProviderLocalDatas(providerThatHasAwareness, providerThatHasAwareness.provider);
            for (const sequel of sequels) {
                try {
                    const seasonPathInstance = new SeasonAwarenessPathController(sequel, providerWithoutAwareness, targetSeason);
                    const result = await seasonPathInstance.getSeasonAwarnessResult(targetSeason);
                    if (result.length !== 0) {
                        return result;
                    }
                } catch (err) {
                    logger.debug('[SeasonAwarenessCreatorSeason] Sequel processing error:');
                    logger.debug(err);
                }
            }
        }
        throw new Error('no sequel avaible for provider: ' + providerThatHasAwareness.provider);
    }

    public static async addSequelTooMainList(
        providerWithAwareness: ProviderLocalData,
        providerWithoutAwareness: ProviderLocalData, result: EpisodeRelationAnalyser) {
        const sequel = this.getSequel(providerWithAwareness);
        if (sequel) {
            const sequelSeasonResult = new Season(result.finalSeasonNumbers, 2);
            const sequelResult = [new ProviderLocalDataWithSeasonInfo(sequel, sequelSeasonResult),
            new ProviderLocalDataWithSeasonInfo(providerWithoutAwareness, sequelSeasonResult)];
            const sequelTempSeries = new Series();
            await sequelTempSeries.addProviderDatasWithSeasonInfos(...sequelResult);
            new MainListAdder().addSeries(sequelTempSeries);
        }
    }

    private static getSequelProviderLocalDatas(provider: ProviderLocalData, providerName: string): ProviderLocalData[] {
        const sequels = [];
        for (const sequelId of provider.sequelIds) {
            if (provider.instanceName === 'InfoProviderLocalData') {
                sequels.push(new InfoProviderLocalData(sequelId, providerName));
            } else if (provider.instanceName === 'ListProviderLocalData') {
                sequels.push(new ListProviderLocalData(sequelId, providerName));
            }
        }
        return sequels;
    }
}
