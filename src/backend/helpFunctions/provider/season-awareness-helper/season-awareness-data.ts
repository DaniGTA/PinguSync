import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data'
import { SeasonAwarenessPath } from './season-awarness-path'

export default class SeasonAwarenessData {
    public seasonPartTargetTracker: number | undefined = undefined
    public seasonPartTargetTrackerDirection = SeasonAwarenessPath.UNKNOWN
    constructor(public pWithoutAwarness: ProviderLocalData, public pWithAwareness: ProviderLocalData) {}

    seasonTargetTrackerTrack(currSeasonPartTargetTrackerDirection: SeasonAwarenessPath): void {
        if (this.seasonPartTargetTrackerDirection == currSeasonPartTargetTrackerDirection) {
            if (this.seasonPartTargetTrackerDirection == SeasonAwarenessPath.PREQUEL) {
                if (this.seasonPartTargetTracker == undefined) {
                    this.seasonPartTargetTracker = 1
                } else {
                    this.seasonPartTargetTracker++
                }
            } else if (this.seasonPartTargetTrackerDirection == SeasonAwarenessPath.SEQUEL) {
                if (this.seasonPartTargetTracker == undefined) {
                    this.seasonPartTargetTracker = 1
                }
            }
        } else {
            this.seasonPartTargetTrackerDirection = currSeasonPartTargetTrackerDirection
        }
    }

    loadTrackingData(oldSeasonAwarenessData: SeasonAwarenessData): void {
        this.seasonPartTargetTracker = oldSeasonAwarenessData.seasonPartTargetTracker
        this.seasonPartTargetTrackerDirection = oldSeasonAwarenessData.seasonPartTargetTrackerDirection
    }
}
