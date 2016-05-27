interface IQueryParams
{
    query: string;
    withMetadata: boolean;
	host: string;
	port: number;
}

interface IQuery
{
    prms: IQueryParams;
    result: any[];
    meta: any[];
    status: any[];
}

class Controller
{
    mainQuery: Query = new Query();
    tablesQuery: Query = new Query();
    
    resultChaged: FreeEvent<Promise<IQuery>> = new FreeEvent<Promise<IQuery>>();
	hostChanged: FreeEvent<Promise<IQuery>> = new FreeEvent<Promise<IQuery>>();

    constructor()
    {
        this.connectionUpdate = this.connectionUpdate.bind(this);
        this.queryUpdate = this.queryUpdate.bind(this);
    }

    connectionUpdate(prms: IQueryParams) : void
    {
        this.hostChanged.rise(this.mainQuery.send(
            {
                prms: 
                {
                    host: prms.host,
                    port: prms.port,
                    withMetadata: false,
                    query: "show tables"
                },
                result: null,
                meta: null,
                status: null
            }));    
    }

	queryUpdate(prms: IQueryParams) : void
	{
        this.resultChaged.rise(this.tablesQuery.send(
            {
                prms: prms,
                result: null,
                meta: null,
                status: null
            }));    
	}
    
    stop() : void
    {
        this.mainQuery.abort();
        this.tablesQuery.abort();
                
        let xhr = new XMLHttpRequest();

        xhr.open("GET", "/stop");
        xhr.setRequestHeader("content-type","application/json");
        xhr.send();
    }
}

class Query
{
	xhr: XMLHttpRequest;

    send(q: IQuery) : Promise<IQuery>
    {
        return new Promise<IQuery>(
            (resolve, reject) =>
            {
                this.xhr && (this.xhr.abort());
                this.xhr = new XMLHttpRequest();
                
                let xhr = this.xhr;

                xhr.open("POST", "/makeQuery");
                xhr.setRequestHeader("content-type","application/json");
                
                xhr.onload = (e: Event) =>
                {
                    var obj = JSON.parse(xhr.response);
                    if(obj.errorMsg)
                    {
                        reject(obj.errorMsg);    
                    }
                    else
                    {
                        q.result = obj.rows;     
                        q.meta = obj.meta;     
                        q.status = obj.status;     
                        
                        resolve(q);
                    }
                    
                    this.xhr = null;
                };
                xhr.onerror = (e: any) => 
                {
                    reject(e);

                    this.xhr = null;
                }
                    
                xhr.send(JSON.stringify({
                    statement: q.prms.query,
                    withMetadata: q.prms.withMetadata,
                    host: q.prms.host,
                    port: q.prms.port
                }));
            });
    }
    
    abort() : void
    {
        this.xhr && (this.xhr.abort());
    }
}

var controller: Controller = new Controller();

window.onbeforeunload = (event: BeforeUnloadEvent) =>
{
    controller.stop();
}; 
