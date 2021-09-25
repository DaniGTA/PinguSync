export enum FailedRequestErrorType {
    UnkownError = 'UnkownError',
    ProviderNotAvailble = 'ProviderNotAvailable',
    Timeout = 'Timeout',
    ProviderNoResult = 'ProviderNoResult',
    ProviderApiNotExist = 'ProviderApiNotExist',
}

export const isFailedRequestError = (s: string): boolean => {
    return Object.values(FailedRequestErrorType).includes(s as FailedRequestErrorType)
}
