interface ITableProps {
    sendQuery: FreeEvent<Promise<IQuery>>;
    getResult: (res: IQuery) => any[];
}

interface ITableState {
    loading: boolean;
    rows: any[];
    errorMsg: string;
}

class Table extends React.Component<ITableProps, ITableState> 
{
    state: ITableState = {
        loading: false, 
        rows: null,
        errorMsg: null
    };
    
    constructor () 
    {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.setData = this.setData.bind(this);
        this.setError = this.setError.bind(this);
    }
    
    componentDidMount()
    {
        this.props.sendQuery.attach(
            p => 
            {
                this.setState(s => 
                {
                    s.loading = true;
                    return s; 
                });
                
                p.then(this.setData).catch(this.setError);
                
            });
    }  
    
    setError(e: any) : void
    {
        this.setState(s => 
        {
           s.errorMsg = e;
           s.rows = null;
           s.loading = false;
           return s; 
        });
    }
    setData(q: IQuery) : void
    {
        this.setState(s => 
        {
           s.errorMsg = null;
           s.rows = this.props.getResult(q);
           s.loading = false;
           return s; 
        });
    }
    
    render () : JSX.Element
    {
        let rows = this.state.rows; 
        
        var lines = [];
        var headerCells = [];
   
        if(rows)
        {     
            for (var key in rows[0]) 
            {
                var th = <td key={headerCells.length}>{key}</td>;
                headerCells.push(th);
            }
            
            lines.push(<tr key={lines.length}>{headerCells}</tr>);
                
            for (var r of rows)
            {
                var lineCells = [];
                for (var key in r) 
                {
                    if (r.hasOwnProperty(key)) 
                    {
                        lineCells.push(<td key={lineCells.length}>{r[key].toString()}</td>);
                    }
                }
    
                lines.push(<tr key={lines.length}>{lineCells}</tr>)
            }
        }
        
        return (
            <div>
                <div className={this.state.errorMsg ? "alert alert-danger" : "hidden"} role="alert">
                    <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span className="sr-only">Error:</span>
                    {" " + this.state.errorMsg}
                </div>
                { 
                    this.state.loading ? <h1>Загрузка...</h1> :    
                        <table className="table table-bordered">
                            <tbody>
                                {lines}
                            </tbody>
                        </table>
                }
            </div>        
        );
    }
}