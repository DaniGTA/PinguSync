export enum InformationTrustRank {
    /**
     * Directly trust the data that comes from this Provider, no extra steps will be added to validate data
     */
    TRUST,
    /**
     * In the process the provider with this Flag will be confirmed by a other provider (need more resources to validate data)
     */
    CURRUPT_DATA,
}
