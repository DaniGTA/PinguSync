export enum MediaType {
    /**
     * It is unknown if it is a movie or series
     */
    UNKOWN = 'UNKOWN',
    /**
     * It is unknown if it is a anime or series but it is known that is not a movie
     */
    UNKOWN_SERIES = 'UNKOWN_SERIES',
    /**
     * It is known that it is a series and not a anime
     */
    SERIES = 'SERIES',
    /**
     * It is known that it is a anime and not a series
     */
    ANIME = 'ANIME',
    /**
     * It is known that it is a movie and not a series
     */
    MOVIE = 'MOVIE',
    SPECIAL = 'SPECIAL',
    OVA = 'OVA',
    ONA = 'ONA',
    /**
     * It is known that it is music
     * ~ Data with marked as music will be ignored
     */
    MUSIC = 'MUSIC',
}
