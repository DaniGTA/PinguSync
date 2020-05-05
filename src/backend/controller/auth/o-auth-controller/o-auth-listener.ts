import { Application } from 'express';
import express from 'express';
import { Request, Response } from 'request';
import logger from '../../../logger/logger';

export default class OAuthListener {
    public static listen(): void {
        if (!this.alreadyListening) {
            this.alreadyListening = true;
            this.app.get('/callback', (req, res) => {
                this.callAllListeners(req.query.code as string);
                res.send('OK');
            });
            this.currentRunningListener = this.app.listen(this.port);
        }
    }

    public static stopListen(): void {
        if (this.alreadyListening && this.currentRunningListener) {
            this.currentRunningListener.close();
            this.alreadyListening = false;
            this.callbackListeners = [];
        }
    }

    public static onCallback(f: (s: string) => void): void {
        this.callbackListeners.push(f);
    }

    private static port = 3000;
    private static app: Application = express();
    private static currentRunningListener?: any;
    private static alreadyListening = false;
    private static callbackListeners: Array<(s: string) => void> = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static callAllListeners(code: string): void {
        for (const listener of this.callbackListeners) {
            try {
                listener(code);
            } catch (err) {
                logger.error(err);
            }
        }
    }
}
