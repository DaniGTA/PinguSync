export enum ProviderInfoStatus {
    /**
     * Has everything that the provider can give.
     */
    FULL_INFO,
    /**
     * Has episode number.
     */
    ADVANCED_BASIC_INFO,
    /**
     * Has no episode numbers but basic infos like name
     */
    BASIC_INFO,
    ONLY_ID,
    NOT_AVAILABLE,
}
