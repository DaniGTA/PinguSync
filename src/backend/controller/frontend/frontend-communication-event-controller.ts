import FrontendProviderController from './providers/frontend-provider-controller'
import FrontendSettingsController from './settings/frontend-settings-controller'
import FrontendSeriesController from './series/frontend-series-controller'
import FrontendEpisodesController from './episodes/frontend-episodes-controller'
import FrontendSeriesSearchController from './series/frontend-series-search-controller'

export default class FrontendCommmunicationEventController {
    public frontendProviderController: FrontendProviderController
    public frontendSettingsController: FrontendSettingsController
    public frontendSeriesController: FrontendSeriesController
    public frontendEpisodesController: FrontendEpisodesController
    public frontendSeriesSearchCOntroller: FrontendSeriesSearchController
    /**
     *Creates an instance of FrontendCommmunicationEventController.
     */
    constructor() {
        this.frontendSeriesController = new FrontendSeriesController()
        this.frontendProviderController = new FrontendProviderController()
        this.frontendSettingsController = new FrontendSettingsController()
        this.frontendEpisodesController = new FrontendEpisodesController()
        this.frontendSeriesSearchCOntroller = new FrontendSeriesSearchController()
    }
}
