import { ElectronApi } from '../../preload/types/electron-api'

declare global {
    interface Window {
        electronRequire: NodeRequire
    }
}
