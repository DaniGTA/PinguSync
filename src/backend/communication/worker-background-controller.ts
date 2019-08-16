import { WorkerTransfer } from '../controller/objects/worker-transfer';
import ICommunication from './icommunication';

const ctx: Worker = self as any;

export default class WorkerBackgroundController implements ICommunication {

    public send(channel: string, data?: any) {
        let success = false;
        while (!success) {
            try {
                ctx.postMessage(new WorkerTransfer(channel, JSON.stringify(data)));
                console.log("worker send: " + channel);
                success = true;
            } catch (err) {
                ctx.postMessage(new WorkerTransfer(channel, ''));
                console.log(err);
            }
        }
    }

    public async on(channel: string, f: (data: any) => void) {
        ctx.addEventListener('message', (ev: MessageEvent) => {
            const transfer = ev.data as WorkerTransfer;

            if (transfer.channel == channel) {
                console.log("worker: " + channel);
                try {
                    f(JSON.parse(transfer.data));
                } catch (err) {
                    f(transfer.data);
                }
            }
        })
    }

}
