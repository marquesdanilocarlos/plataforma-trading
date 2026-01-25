import pgp from "pg-promise";

export default interface AssetDAO {
    saveAsset (asset: any): Promise<void>;
    getByAccountId (accountId: string): Promise<any>;
    updateAsset (asset: any): Promise<void>;
}

export class AssetDAODatabase implements AssetDAO {
    async saveAsset (asset: any) {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        await connection.query("insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",
            [asset.accountId, asset.assetId, asset.quantity]);
        await connection.$pool.end();
    }

    async getByAccountId (accountId: string) {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        const assets = await connection.query("select * from ccca.account_asset where account_id = $1", [accountId]);
        await connection.$pool.end();
        return assets;
    }

   async updateAsset(asset: any): Promise<void> {
        const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
        const assets = await connection.query("update ccca.account_asset set quantity = $1 where asset_id = $2", [asset.quantity, asset.assetId]);
        await connection.$pool.end();
    }
}

export class AssetDAOMemory implements AssetDAO {
    assets: any[] = [];

    async saveAsset(asset: any): Promise<void> {
        this.assets.push(asset);
    }

    async getByAccountId(accountId: string): Promise<any> {
        const asset = this.assets.find((asset: any) => asset.accountId === accountId);
        return asset;
    }

    updateAsset(asset: any): Promise<void> {
        return Promise.resolve(undefined);
    }

}