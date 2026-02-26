// entity porque realiza mutação
export default class Balance {

    constructor (readonly assetId: string, public quantity: number, public blockedQuantity: number) {
    }

    getAvailableQuantity () {
        return this.quantity - this.blockedQuantity;
    }

}