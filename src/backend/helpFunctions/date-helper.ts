class DateHelper {
    // Given a string in m/d/y format, return a string in the same format with n days added
    public addDays(s: Date, days: number): Date {
        return new Date(s.getTime() + this.convertDaysToTimestamp(days));
    }

    // Given a string in m/d/y format, return a string in the same format with n days removed
    public removeDays(s: Date, days: number): Date {
        return new Date(s.getTime() - this.convertDaysToTimestamp(days));
    }

    /**
     * Get the difference in days between two different dates.
     * @param date1 date 1
     * @param date2 date 2
     */
    public differenceBetweenTwoDatesInDays(date1: Date, date2: Date): number {
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
        return diffDays;
    }

    private convertDaysToTimestamp(days: number) {
        return (days * 24 * 60 * 60 * 1000);
    }
}

export default new DateHelper();
