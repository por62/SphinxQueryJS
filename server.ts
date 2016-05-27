/// <reference path="typings\express\express.d.ts" />
/// <reference path="typings\body-parser\body-parser.d.ts" />
/// <reference path="typings\mysql\mysql.d.ts" />

import * as http from "http";
import * as express from "express";
import * as bodyParser from "body-parser";
import { IConnection, createConnection, IError } from "mysql";
 
export class Server
{
	port: number = 8700;
	app: express.Application;
	httpServer: http.Server;
	
	run() : void
	{
		this.app = express();
		
		this.httpServer = this.app
			.use(express.static(__dirname + "/../ui"))
			.use(bodyParser.json())
			.post('/makeQuery', this.querySphinx)
			.get('/stop', () => this.httpServer && this.httpServer.close())
		 	.listen(this.port);
	}

	querySphinx(req : express.Request, res : express.Response) : void
	{
		var conn: IConnection = createConnection({
			host: req.body.host,
			port: req.body.port
		});
		
		conn.connect();
		
		let result : any = {
			rows: [],
			meta: [],
			status: []
		};

		let hasErrors: boolean = false;
		
		let statement: string = req.body.statement;
		
		conn.query(statement)
			.on('error', (err: IError, index: number) =>
			{
				hasErrors = true;
				result.errorMsg = err.message;
			})
			.on('result', (row: any, index: number) =>
			{
				if(index == 0) result.rows.push(row);
			})
			.on('end', () => 
			{
				if(req.body.withMetadata)
				{
					conn.query("show meta")
						.on('result', (row: any, index: number) =>
						{
							if(index == 0) result.meta.push(row);
						})
						.on('end', () => 
						{
							conn.query("show status")
								.on('result', (row: any, index: number) =>
								{
									if(index == 0) result.status.push(row);
								})
								.on('end', () => 
								{
									if(hasErrors) conn.destroy();	
									else conn.end();
									
									res.send(result);
								});
						});
				}
				else 
				{
					if(hasErrors) conn.destroy();	
					else conn.end();
					
					res.send(result);
				} 
				
			});
			
	}
}