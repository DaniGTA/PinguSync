import WorkerController from '../../backend/communication/ipc-renderer-controller'

export default class ApiRequestController {
    public static async getDataWithId<T>(channel: string, seriesId: string): Promise<T> {
        if (seriesId) {
            const trackingToken = WorkerController.getNewTrackingToken()
            WorkerController.send(channel, seriesId, trackingToken)
            return WorkerController.once(channel + '-' + seriesId, trackingToken)
        } else {
            throw new Error('No series id for request')
        }
    }
}
