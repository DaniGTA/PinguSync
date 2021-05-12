import ProviderFileSettings from '../../provider-file-settings'

export class EregnyAnimeRelationsProviderData extends ProviderFileSettings {
    public database: any
    public lastDatabaseDownloadTimestamp = 0

    updateDatabase(database: any): void {
        this.database = database
        this.lastDatabaseDownloadTimestamp = Date.now()
        this.saveData()
    }
}
