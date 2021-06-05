import got from 'got'
// eslint-disable-next-line @typescript-eslint/ban-types
export default class RequestBundle<T extends string | null = string> {
    constructor(public url: got.GotUrl, public options: got.GotBodyOptions<T> = {}) {}
}
