import { OptionsOfJSONResponseBody } from 'got'

// eslint-disable-next-line @typescript-eslint/ban-types
export default class RequestBundle {
    constructor(public url: string, public options: OptionsOfJSONResponseBody = {}) {}
}
