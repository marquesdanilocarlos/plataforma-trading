export default class OrderPlacedEvent {

    constructor (readonly orderId: string, readonly marketId: string) {
    }
}