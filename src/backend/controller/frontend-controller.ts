import ListProvider from '../api/provider/list-provider'
import logger from '../logger/logger'
import ListController from './list-controller'
import ProviderList from './provider-controller/provider-manager/provider-list'
import FrontendCommmunicationEventController from './frontend/frontend-communication-event-controller'
import IPCBackgroundController from '../communication/ipc-background-controller'

export default class FrontendController {
    public static getInstance(): FrontendController {
        return FrontendController.instance
    }
    public static getProviderInstance(providerString: string): ListProvider {
        for (const provider of ProviderList.getListProviderList()) {
            if (provider.providerName === providerString) {
                return provider
            }
        }
        throw new Error(`[FrontendController] NoProviderFound: ${providerString}`)
    }

    private static instance: FrontendController

    constructor(webcontents?: Electron.WebContents) {
        logger.info('Load list controller')
        // tslint:disable-next-line: no-unused-expression
        new ListController()
        if (webcontents) {
            this.mainInit(webcontents)
        }
    }
    public mainInit(webcontents: Electron.WebContents): void {
        IPCBackgroundController.webcontents = webcontents
        new FrontendCommmunicationEventController()
    }

    public getPath(): string {
        // eslint-disable-next-line no-undef
        return (
            (process.env.APPDATA ||
                (process.platform === 'darwin'
                    ? process.env.HOME + 'Library/Preferences'
                    : process.env.HOME + '/.local/share')) + '/list-manager/'
        )
    }
}
