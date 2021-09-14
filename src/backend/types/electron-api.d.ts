import FrontendController from '../controller/frontend/frontend-controller'

interface ElectronApi {
    readonly versions: Readonly<NodeJS.ProcessVersions>
    readonly controller: FrontendController
}

declare interface Window {
    electron: Readonly<ElectronApi>
    electronRequire?: NodeRequire
}
