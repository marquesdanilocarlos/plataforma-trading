import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/Registry";

export default class ORM {
    @inject("databaseConnection")
    connection!: DatabaseConnection;

    async save (model: Model): Promise<void> {
        const columns = model.columns.map((column) => column.column).join(",");
        const params = model.columns.map((column, index) => `$${index + 1}`).join(",");
        const query = `insert into ${model.schema}.${model.table} (${columns}) values (${params})`;
        const values = model.columns.map((column) => model[column.property]);
        await this.connection.query(query, values);
    }

    async get (model: any, field: string, value: string): Promise<any> {
        const query = `select * from ${model.prototype.schema}.${model.prototype.table} where ${field} = $1`;
        const [data] = await this.connection.query(query, value);
        if (!data) throw new Error("Row not found");
        const obj = new model();
        for (const column of model.prototype.columns) {
            obj[column.property] = data[column.column];
        }
        return obj;
    }
}

export class Model {
    schema!: string;
    table!: string;
    columns!: { column: string, property: string }[]
    [property: string]: any;
}

export function model (schema: string, table: string) {
    return function (target: any) {
        target.prototype.schema = schema;
        target.prototype.table = table;
    }
}

export function column (column: string) {
    return function (target: any, propertyKey: string) {
        target.columns = target.columns || [];
        target.columns.push({ column, property: propertyKey });
    }
}
