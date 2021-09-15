import IPCBackgroundController from '../../../../communication/ipc-background-controller'
import { chOnce } from '../../../../communication/channels'
import { ListType } from '../../../settings/models/provider/list-types'
import MainListSearcher from '../../../main-list-manager/main-list-searcher'
import logger from '../../../../logger/logger'

export default class FrontendSeriesListController {
    private com: IPCBackgroundController
    constructor() {
        this.com = new IPCBackgroundController()
        this.init()
    }

    private init(): void {
        IPCBackgroundController.on<ListType>(chOnce.GetSeriesIdsWithListType, async (list, token) =>
            IPCBackgroundController.send(
                chOnce.GetSeriesIdsWithListType,
                await this.GetSeriesIdsWithListType(list),
                token
            )
        )
    }

    private async GetSeriesIdsWithListType(listType: ListType): Promise<string[]> {
        try {
            const list = MainListSearcher.getAllSeriesWithTypeList(listType)
            return list.map(x => x.id)
        } catch (err) {
            logger.error(err)
        }
        return []
    }
}
