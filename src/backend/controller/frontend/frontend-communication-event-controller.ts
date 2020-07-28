import FrontendProviderController from './providers/frontend-provider-controller';
import FrontendAppUpdateController from './app/update/frontend-app-update-controller';
import FrontendSettingsController from './settings/frontend-settings-controller';
import FrontendSeriesController from './series/frontend-series-controller';
import FrontendEpisodesController from './episodes/frontend-episodes-controller';
import FrontendSeriesSearchController from './series/frontend-series-search-controller';

export default class FrontendCommmunicationEventController {
    public frontendProviderController: FrontendProviderController;
    public frontendAppUpdateController: FrontendAppUpdateController;
    public frontendSettingsController: FrontendSettingsController;
    public frontendSeriesController: FrontendSeriesController;
    public frontendEpisodesController: FrontendEpisodesController;
    public frontendSeriesSearchCOntroller: FrontendSeriesSearchController;
    /**
     *Creates an instance of FrontendCommmunicationEventController.
     * @param {Electron.WebContents} webcontents  
     */
    constructor(webcontents: Electron.WebContents) {
        this.frontendSeriesController = new FrontendSeriesController(webcontents);
        this.frontendProviderController = new FrontendProviderController(webcontents);
        this.frontendAppUpdateController = new FrontendAppUpdateController(webcontents);
        this.frontendSettingsController = new FrontendSettingsController(webcontents);
        this.frontendEpisodesController = new FrontendEpisodesController(webcontents);
        this.frontendSeriesSearchCOntroller = new FrontendSeriesSearchController(webcontents);
    }
}