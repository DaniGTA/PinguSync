import { DataStream } from 'scramjet';

export default class MultiThreadingHelper {
    public static async runFunctionInWorker<T>(func: (...args: any) => Promise<T>, ...args: any): Promise<T> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<T>(async (resolve, reject) => {
            DataStream
                .from(async function* () { yield func(...args); })
                .catch((x: Error) => reject(x))
                .stringify((x) => resolve(x));
        });
    }
}
