interface IMainState {
}
 
interface IMainProps 
{
 	host: string; // = "rdksphinx-v";
	port: number; // = 9307;
}

class Main extends React.Component<IMainProps, IMainState> 
{
    statement: string;
 	host: string;
	port: number;
    
    controller: Controller = new Controller();
    
    constructor () {
        super();
        this.changeStatement = this.changeStatement.bind(this);
        this.changeHostOrPort = this.changeHostOrPort.bind(this);
        this.componentDidMount  = this.componentDidMount .bind(this);
        this.render = this.render.bind(this);
    }
    componentDidMount () : void
    {
        if(this.props.host && this.props.port)
        {
            this.changeHostOrPort(this.props.host, this.props.port);
        }
    }
    changeHostOrPort(host?: string, port?: number) : void
    {
        this.host = host == undefined ? this.host : host;
        this.port = port == undefined ? this.port : port;
        
        this.controller.connectionUpdate(
            {
                query: null,
                withMetadata: false,
                host: this.host,
                port: this.port    
            });
    }
    changeStatement (statement: string) 
    {
        this.statement = statement;
        
        this.controller.queryUpdate(
            {
                query: statement,
                withMetadata: true,
                host: this.host,
                port: this.port    
            });
    }
            
    render () : JSX.Element
    {
        return (
            <div className="container-fluide">
                <div className="row">
                    <div className="col-md-2">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h4>Host</h4>
                            </div>
                            <div className="panel-body">
                                <div className="form-group">
                                    <AutocompleteInput value={this.props.host} placeholder="адрес" onSelect={s => this.changeHostOrPort(s)}/>
                                    <AutocompleteInput value={this.props.port.toString()} placeholder="порт" onSelect={s => this.changeHostOrPort(null, parseInt(s))}/>
                                </div>
                                <Table sendQuery={this.controller.hostChanged} getResult={q => q.result}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <AutocompleteInput value={this.statement} placeholder="текст запроса" onSelect={this.changeStatement}/>
                            </div>
                            <div className="panel-body">
                                <Table sendQuery={this.controller.resultChaged} getResult={q => q.result}/>
                            </div>
                        </div>    
                    </div>           
                    <div className="col-md-2">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h4>Meta</h4>
                            </div>
                            <div className="panel-body">
                                <Table sendQuery={this.controller.resultChaged} getResult={q => q.meta}/>
                            </div>
                        </div>
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h4>Status</h4>
                            </div>
                            <div className="panel-body">
                                <Table sendQuery={this.controller.resultChaged}  getResult={q => q.status}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}