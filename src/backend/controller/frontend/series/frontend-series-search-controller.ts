import FrontendSeriesListController from './list/frontend-series-list-controller';
import IPCBackgroundController from '../../../communication/ipc-background-controller';
import { chOnce } from '../../../communication/channels';
import { SearchQuery } from './model/search-query';
import MainListManager from '../../main-list-manager/main-list-manager';

export default class FrontendSeriesSearchController {
    private com: IPCBackgroundController;


    constructor(webcontents: Electron.WebContents) {
        this.com = new IPCBackgroundController(webcontents);
        this.init();
    }

    private init(): void {
        this.com.on(chOnce.SearchSeries, (searchQuery: SearchQuery) => this.com.send(chOnce.SearchSeries, this.getSearchResult(searchQuery)));
    }

    getSearchResult(searchQuery: SearchQuery): string[] {
        const mainList = MainListManager.getMainList();
        const searchStringResult = mainList.filter(x => !!x.getAllNamesUnique().find(x => new RegExp(searchQuery.searchString, 'gmi').test(x.name)));
        return searchStringResult.map(x => x.id);
    }

}
