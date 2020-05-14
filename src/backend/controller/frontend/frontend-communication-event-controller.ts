import FrontendProviderController from './providers/frontend-provider-controller';
import FrontendAppUpdateController from './app/update/frontend-app-update-controller';
import FrontendSettingsController from './settings/frontend-settings-controller';

export default class FrontendCommmunicationEventController {
    public frontendProviderController: FrontendProviderController;
    public frontendAppUpdateController: FrontendAppUpdateController;
    public frontendSettingsController: FrontendSettingsController;
    /**
     *Creates an instance of FrontendCommmunicationEventController.
     * @param {Electron.WebContents} webcontents  
     */
    constructor(webcontents: Electron.WebContents) {
        this.frontendProviderController = new FrontendProviderController(webcontents);
        this.frontendAppUpdateController = new FrontendAppUpdateController(webcontents);
        this.frontendSettingsController = new FrontendSettingsController(webcontents);

    }
}