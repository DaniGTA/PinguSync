import { FailedRequestErrorType } from './failed-request-error-type'

export default class FailedRequestError {
    constructor(public errorType: FailedRequestErrorType, public errorMessage: string = '') {}

    public getErrorMessage() {
        return this.errorType + ' | msg: ' + this.errorMessage
    }
}
