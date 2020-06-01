import IPCBackgroundController from '../../../../communication/ipc-background-controller';
import { chOnce } from '../../../../communication/channels';
import { ListType } from '../../../settings/models/provider/list-types';
import MainListSearcher from '../../../main-list-manager/main-list-searcher';

export default class FrontendSeriesListController {
    private com: IPCBackgroundController;
    constructor(webcontents: Electron.WebContents) {
        this.com = new IPCBackgroundController(webcontents);
        this.init();
    }

    private init(): void {
        this.com.on(chOnce.GetSeriesIdsWithListType, async (list) => this.com.send(chOnce.GetSeriesIdsWithListType, await this.GetSeriesIdsWithListType(list)));
    }

    private async GetSeriesIdsWithListType(listType: ListType): Promise<string[]> {
        const list = MainListSearcher.getAllSeriesWithTypeList(listType);
        return list.map(x => x.id);
    }
}
