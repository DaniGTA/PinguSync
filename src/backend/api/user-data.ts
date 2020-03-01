export abstract class UserData {
    public abstract username: string;
    protected abstract loadData(): void;
}
