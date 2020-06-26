
import { expose } from 'threads/worker';


const worker = {
};

export type SyncEpisodeWorker = typeof worker;

expose(worker);