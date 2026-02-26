export default class UUID {
    private value: string;

    constructor (uuid: string) {
        if (!uuid || !uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            throw new Error("Invalid uuid");
        }
        this.value = uuid;
    }

    static create () {
        return new UUID(crypto.randomUUID());
    }

    getValue () {
        return this.value;
    }
}
