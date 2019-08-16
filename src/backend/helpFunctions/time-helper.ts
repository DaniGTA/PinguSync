export default new class TimeHelper {
    public async delay(ms: number = 500): Promise<boolean> {
        return await new Promise<boolean>(resolve => {
            setTimeout(resolve, ms);
        });
    }
}
