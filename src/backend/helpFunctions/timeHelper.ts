export default new class TimeHelper {
    public async delay(ms: number = 500): Promise<boolean> {
        return await new Promise<boolean>(resolve => {
            var start = new Date().getTime();
            var end = start;
            while (end < start + ms) {
                end = new Date().getTime();
            }
            resolve(true);
        });
    }
}