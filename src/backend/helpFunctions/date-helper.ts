class DateHelper {
    // Given a string in m/d/y format, return a string in the same format with n days added
    public addDays(s: Date, days: number): Date {
        return new Date(s.getTime() + (days * 24 * 60 * 60 * 1000));
    }
}

export default new DateHelper();