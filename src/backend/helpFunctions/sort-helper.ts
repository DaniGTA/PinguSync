export default new class SortHelper {


    public async quickSort<T>(array: T[], comparator: ((a: T, b: T) => Promise<number>) | ((a: T, b: T) => number)): Promise<T[]> {
        if (array.length <= 1 || array == null) {
            return array;
        }
        await this.sort(array, comparator, 0, array.length - 1);
        return array;
    }

    private async sort<T>(array: T[], comparator: ((a: T, b: T) => Promise<number>) | ((a: T, b: T) => number), low: number, high: number) {
        if (low < high) {
            const partIndex = await this.partition(array, comparator, low, high);
            await this.sort(array, comparator, low, partIndex - 1);
            await this.sort(array, comparator, partIndex + 1, high);
        }
    }

    /**
     *
     * @param array the array of items.
     * @param comp comperator function
     * @param low
     * @param high
     */
    private async  partition<T>(array: T[], comp: ((a: T, b: T) => Promise<number>) | ((a: T, b: T) => number), low: number, high: number): Promise<number> {
        const pivot: T = array[high];
        let i: number = low - 1;
        for (let j = low; j <= high - 1; j++) {
            if (await comp(array[j], pivot) === -1) {
                i = i + 1;
                await this.swap(array, i, j);
            }
        }
        if (await comp(array[high], array[i + 1]) === -1) {
            await this.swap(array, i + 1, high);
        }
        return i + 1;
    }

    private async swap<T>(array: T[], i: number, j: number) {
        const newJ: T = array[i];
        array[i] = array[j];
        array[j] = newJ;
    }
}();
