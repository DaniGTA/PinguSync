export enum FailedRequestError {
    UnkownError = 'UnkownError',
    ProviderNotAvailble = 'ProviderNotAvailable',
    Timeout = 'Timeout',
    ProviderNoResult = 'ProviderNoResult',
    ProviderApiNotExist = 'ProviderApiNotExist',
}

export const isFailedRequestError = (s: string): boolean => {
    return Object.values(FailedRequestError).includes(s as FailedRequestError)
}
