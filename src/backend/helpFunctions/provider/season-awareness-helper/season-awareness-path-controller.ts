import Season from '../../../controller/objects/meta/season';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import logger from '../../../logger/logger';
import SeasonComperator from '../../comperators/season-comperator';
import EpisodeHelper from '../../episode-helper/episode-helper';
import EpisodeRelationAnalyser from '../../episode-helper/episode-relation-analyser';
import ProviderLocalDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info';
import SeasonAwarenessHelper from './season-awareness-helper';
import SeasonAwarenessPrequelPathController from './season-awareness-preuqel-path/season-awareness-prequel-path-controller';
import SeasonAwarenessSequelPathController from './season-awareness-sequel-path/season-awareness-sequel-path-controller';

export default class SeasonAwarenessPathController {
    private providerWithAwareness: ProviderLocalData;
    private providerWithoutAwarness: ProviderLocalData;
    private seasonTargetMode = false;
    constructor(pWithAwareness: ProviderLocalData, pWithoutAwarness: ProviderLocalData, tSeason?: Season) {
        this.providerWithAwareness = pWithAwareness;
        this.providerWithoutAwarness = pWithoutAwarness;
        if (tSeason) {
            this.seasonTargetMode = true;
        }
    }

    public async getProviderLocalDataWithSeason(targetSeason: Season | undefined): Promise<Season | undefined> {
        let currentProviderThatHasAwareness: ProviderLocalData | undefined = { ...this.providerWithAwareness } as ProviderLocalData;
        currentProviderThatHasAwareness = await SeasonAwarenessHelper.updateProvider(currentProviderThatHasAwareness);

        if (EpisodeHelper.hasEpisodeNames(currentProviderThatHasAwareness.detailEpisodeInfo)) {
            const result = new EpisodeRelationAnalyser(this.providerWithoutAwarness.detailEpisodeInfo, currentProviderThatHasAwareness.detailEpisodeInfo);
            const seasonResult = await this.seasonAwarenessChoicePath(result, targetSeason);
            return seasonResult;
        }
    }
    /**
     * When no default season is set it will sync season between the given provider local datas.
     * @param pWithAwareness provider with season awareness
     * @param pWithoutAwarness provider without season awareness
     * @param tSeason target season.
     */
    public async getSeasonAwarnessResult(tSeason: Season | undefined) {
        const seasonResult = await this.getProviderLocalDataWithSeason(tSeason);
        const finalResult = [
            new ProviderLocalDataWithSeasonInfo(this.providerWithoutAwarness, seasonResult),
            new ProviderLocalDataWithSeasonInfo(this.providerWithAwareness, seasonResult),
        ];
        return finalResult;
    }

    private async seasonAwarenessChoicePath(result: EpisodeRelationAnalyser, targetSeason: Season | undefined): Promise<Season | undefined> {
        if (!targetSeason || this.checkIfTheSeasonIsTheSame(result, targetSeason)) {
            if (result.finalSeasonNumbers !== undefined && result.seasonComplete) {
                return new Season(result.finalSeasonNumbers);
            } else if (result.finalSeasonNumbers?.length === 1 && result.minEpisodeNumberOfSeasonHolder !== 1) {
                const prequelSeason = await SeasonAwarenessPrequelPathController.processPrequel(this.providerWithAwareness,
                    this.providerWithoutAwarness, new Season(result.finalSeasonNumbers));
                if (SeasonComperator.isSameSeasonNumber(prequelSeason[0].seasonTarget, new Season(result.finalSeasonNumbers))) {
                    let newSeasonpart = prequelSeason[0].seasonTarget?.seasonPart;
                    if (newSeasonpart !== undefined) {
                        newSeasonpart++;
                    }
                    return new Season(prequelSeason[0].seasonTarget?.seasonNumbers, newSeasonpart);
                }

            } else if (result.finalSeasonNumbers?.length === 1 && result.minEpisodeNumberOfSeasonHolder === 1) {
                await SeasonAwarenessSequelPathController.addSequelTooMainList(this.providerWithAwareness, this.providerWithoutAwarness, result);
                return new Season(result.finalSeasonNumbers, 1);
            } else {
                logger.error('SEASON IS NOT COMPLETE CANT EXTRACT SEASON NUMBER !!!');
                throw new Error('Failed to get Season');
            }
        } else {
            const sequelResult = await SeasonAwarenessSequelPathController.processSequel(
                this.providerWithAwareness,
                this.providerWithoutAwarness,
                targetSeason);
            if (sequelResult[0].seasonTarget?.seasonPart === undefined || sequelResult[0].seasonTarget?.seasonPart === 1) {
                return new Season((sequelResult[0].seasonTarget?.getSingleSeasonNumberAsNumber() as number));
            } else {
                return new Season(sequelResult[0].seasonTarget.seasonNumbers, 1 - sequelResult[0].seasonTarget.seasonPart);
            }
        }
    }


    private checkIfTheSeasonIsTheSame(result: EpisodeRelationAnalyser, targetSeason: Season): boolean {
        const singleSeasonNumber = targetSeason.getSingleSeasonNumberAsNumber();
        if (targetSeason.isSeasonUndefined()) {
            return true;
        } else if (SeasonComperator.isSameSeasonNumber(new Season(result.finalSeasonNumbers), targetSeason)) {
            return true;
        } else if (singleSeasonNumber && result.maxSeasonNumber && singleSeasonNumber > result.maxSeasonNumber) {
            const tempTargetSeason = new Season(singleSeasonNumber - 1);
            if (result.minEpisodeNumberOfSeasonHolder !== 1 && SeasonComperator.isSameSeasonNumber(new Season(result.finalSeasonNumbers), tempTargetSeason)) {
                return true;
            }
        }
        return false;
    }
}
