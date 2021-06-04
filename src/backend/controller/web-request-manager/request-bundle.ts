import got from 'got'
// eslint-disable-next-line @typescript-eslint/ban-types
export default class RequestBundle {
    constructor(public url: got.GotUrl, public options: got.GotBodyOptions<string> = {}) {}
}
