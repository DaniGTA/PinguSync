export default class DataPackage<T> {
    constructor(public data: T | null | undefined, public trackingToken?: string) {}
}
