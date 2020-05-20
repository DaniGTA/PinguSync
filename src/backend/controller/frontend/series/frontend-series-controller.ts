import FrontendSeriesListController from './list/frontend-series-list-controller';
import IPCBackgroundController from '../../../communication/ipc-background-controller';
import { chOnce } from '../../../communication/channels';
import MainListSearcher from '../../main-list-manager/main-list-searcher';
import logger from '../../../logger/logger';
import Series from '../../objects/series';
import FrontendSeriesInfos from '../../objects/transfer/frontend-series-infos';

export default class FrontendSeriesController {
    private com: IPCBackgroundController;
    public seriesListController: FrontendSeriesListController;


    constructor(webcontents: Electron.WebContents) {
        this.com = new IPCBackgroundController(webcontents);
        this.seriesListController = new FrontendSeriesListController(webcontents);
        this.init();
    }

    private init(): void {
        this.com.on(chOnce.GetSeriesById, (x) => this.com.send(chOnce.GetSeriesById + '-' + x, this.getSeriesById(x)));
    }

    private getSeriesById(id: string): FrontendSeriesInfos | null {
        const result = MainListSearcher.findSeriesById(id);
        if (result) {
            return new FrontendSeriesInfos(result);
        }
        return null;
    }




}