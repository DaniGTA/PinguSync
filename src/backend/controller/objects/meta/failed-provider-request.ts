import ExternalProvider from '../../../api/provider/external-provider'
import { FailedRequestErrorType } from './failed-request-error-type'

export default class FailedProviderRequest {
    public providerName: string
    public providerVersion: number
    public errorType: FailedRequestErrorType
    public errorMessage: string
    public timestamp: number

    constructor(provider: ExternalProvider, errorType: FailedRequestErrorType, errorMessage = '') {
        this.providerName = provider.providerName
        this.providerVersion = provider.version
        this.errorType = errorType
        this.errorMessage = errorMessage
        this.timestamp = new Date().getTime()
    }
}
