import Wallet from "../../domain/Wallet";
import Balance from "../../domain/Balance";
import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/Registry";


export default interface WalletRepository {
    updateWallet (wallet: Wallet): Promise<void>;
    getWalletById (accountId: string): Promise<Wallet>;
}

export class WalletRepositoryDatabase implements WalletRepository {
    @inject("databaseConnection")
    connection!: DatabaseConnection;

    async updateWallet (wallet: Wallet) {
        await this.connection.query("delete from ccca.balance where account_id = $1", [wallet.getAccountId()]);
        for (const balance of wallet.balances) {
            await this.connection.query("insert into ccca.balance (account_id, asset_id, quantity, blocked_quantity) values ($1, $2, $3, $4)", [wallet.getAccountId(), balance.assetId, balance.quantity, balance.blockedQuantity]);
        }
    }

    async getWalletById (accountId: string): Promise<Wallet> {
        const balancesData = await this.connection.query("select * from ccca.balance where account_id = $1", [accountId]);
        const balances = balancesData.map((balanceData: any) => (new Balance(balanceData.asset_id, parseFloat(balanceData.quantity), parseFloat(balanceData.blocked_quantity))));
        return new Wallet(accountId, balances);
    }
}
