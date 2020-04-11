import Season from '../../../../controller/objects/meta/season';
import { InfoProviderLocalData } from '../../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalData from '../../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ListProviderLocalData } from '../../../../controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import logger from '../../../../logger/logger';
import SeasonComperator from '../../../comperators/season-comperator';
import EpisodeRelationAnalyser from '../../../episode-helper/episode-relation-analyser';
import ProviderLocalDataWithSeasonInfo from '../../provider-info-downloader/provider-data-with-season-info';
import SeasonAwarenessPathController from '../season-awareness-path-controller';

export default class SeasonAwarenessPrequelPathController {
    public static async getSeasonAwarenessFromPrequel(
        providerThatHasAwarenss: ProviderLocalData, providerThatDonthaveAwareness: ProviderLocalData, result: EpisodeRelationAnalyser) {
        const prequelSeason = await this.processPrequel(providerThatHasAwarenss, providerThatDonthaveAwareness, new Season(result.finalSeasonNumbers));
        if (SeasonComperator.isSameSeasonNumber(prequelSeason[0].seasonTarget, new Season(result.finalSeasonNumbers))) {
            let newSeasonpart = prequelSeason[0].seasonTarget?.seasonPart;
            if (newSeasonpart !== undefined) {
                newSeasonpart++;
            }
            return new Season(prequelSeason[0].seasonTarget?.seasonNumbers, newSeasonpart);
        }
    }

    public static async processPrequel(
        providerWithAwareness: ProviderLocalData,
        providerWithoutAwareness: ProviderLocalData, targetSeason: Season | undefined): Promise<ProviderLocalDataWithSeasonInfo[]> {
        if (providerWithAwareness.prequelIds.length !== 0) {
            const prequels = this.getPrequelProviderLocalDatas(providerWithAwareness, providerWithAwareness.provider);
            for (const prequel of prequels) {
                try {
                    const seasonPathInstance = new SeasonAwarenessPathController(prequel, providerWithoutAwareness, targetSeason);
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
        throw new Error('no prequel avaible for provider: ' + providerWithAwareness.provider);

    }

    private static getPrequelProviderLocalDatas(provider: ProviderLocalData, providerName: string): ProviderLocalData[] {
        const prequels = [];
        for (const prequelId of provider.prequelIds) {
            if (provider.instanceName === 'InfoProviderLocalData') {
                prequels.push(new InfoProviderLocalData(prequelId, providerName));
            } else if (provider.instanceName === 'ListProviderLocalData') {
                prequels.push(new ListProviderLocalData(prequelId, providerName));
            }
        }
        return prequels;
    }
}
