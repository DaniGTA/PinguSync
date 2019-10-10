// tslint:disable-next-line: no-implicit-dependencies
import { app } from 'electron';

export default class PathHelper {
    public getAppPath(): string {
        try {
            return app.getPath('userData');

        } catch (err) {
            return './data/';
        }
    }
}
