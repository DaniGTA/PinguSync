import { isFailedRequestError } from '../../../../src/backend/controller/objects/meta/failed-request-error-type'

describe('FailedRequest meta object tests', () => {
    test('should detect error msg as FailedRequest error msg', () => {
        const msg = 'UnkownError'
        expect(isFailedRequestError(msg)).toBeTruthy()
    })

    test('should detect error msg as other error msg', () => {
        const msg = 'OtherError ...'
        expect(isFailedRequestError(msg)).toBeFalsy()
    })
})
