export default class SeriesHoverController {
    public static currentlyHoveringSeriesId = ''

    static SET_currentlyHoveringSeriesId(value: string): void {
        this.currentlyHoveringSeriesId = value
    }
}
