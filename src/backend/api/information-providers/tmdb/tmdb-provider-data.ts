import { UserData } from '../../user-data'

export class TMDBProviderData extends UserData {
    public lastOfflineMetdataDownload: Date | undefined

    public setLastOfflineMetadataDownload(): void {
        this.lastOfflineMetdataDownload = new Date()
        this.saveData()
    }
}
