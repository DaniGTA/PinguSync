import { expose } from 'threads/worker';
import Series from '../../objects/series';

const worker = {
    findSeriesById(buffer: Series[], id: string): number | null {
        const result = buffer.findIndex(x => x.id === id) ?? null;
        if (result === -1) {
            return null;
        }
        return result;
    },
};

export type MainListSearchIdWorker = typeof worker;

expose(worker);