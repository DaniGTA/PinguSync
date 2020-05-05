export default interface ICommunication {
    on(channel: string, f: ((data: any) => void) | ((data: any) => Promise<void>)): Promise<void>;
    send(channel: string, data?: any): void;
};

