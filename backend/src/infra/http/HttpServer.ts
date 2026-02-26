import express, { Request, Response, Express } from "express";
import cors from "cors";

export default interface HttpServer {
    route (method: "get" | "post", url: string, callback: Function): void;
    listen (port: number): void;
}

export class ExpressAdapter implements HttpServer {
    app: Express;

    constructor () {
        this.app = express();
        this.app.use(cors());
        this.app.use(express.json());
    }

    route(method: "get" | "post", url: string, callback: Function): void {
        this.app[method](url, async (req: Request, res: Response) => {
            try {
                const output = await callback(req.params, req.body);
                res.json(output);
            } catch (e: any) {
                res.status(422).json({
                    message: e.message
                });
            }
        });
    }

    listen(port: number): void {
        this.app.listen(port);
    }

}
