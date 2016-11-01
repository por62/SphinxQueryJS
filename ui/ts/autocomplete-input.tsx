interface IAutoInputProps {
    value: string;
    placeholder: string;
    onSelect: (s:string) => void;
}

interface IAutoInputState {
    autocomplete: boolean;
    sugesstions: string[];
    selectedValue: string;
    value: string;
}

class AutocompleteInput extends React.Component<IAutoInputProps, IAutoInputState> 
{
    takeFromList: boolean;
    history: string[];

    state: IAutoInputState = { 
        autocomplete: false,
        sugesstions: [],
        selectedValue: null,
        value: null
    };
    
    constructor () 
    {
        super();
        this.onKeyDown = this.onKeyDown.bind(this);
    }
    
    onKeyDown(e: React.KeyboardEvent)
    {
        let el : HTMLInputElement = e.target as HTMLInputElement;
        
        switch (e.keyCode) 
        {
            case 13:
            {
                e.preventDefault();
                
                if(this.takeFromList)
                {
                    this.takeFromList = false;
                    el.value = this.state.selectedValue;    
                    this.changeSelection(this.state.selectedValue);
                }
                else
                {            
                    let suggestion = el.value;
                    if(!this.history || !this.history.some(s => s == suggestion))
                    {
                        this.history || (this.history = []); 
                        this.history.push(suggestion);
                    }
                    
                    this.changeSelection(el.value);
                }    
                break;
            }
            
            case 40: //Down
            {
                e.preventDefault();
                this.listNavigate(true);
                    
                break;
            }
            
            case 38: //Up
            {
                e.preventDefault();
                this.listNavigate(false);
                break; 
            }
                        
            case 27: //Esc
            {
                e.preventDefault();
                this.takeFromList = false;
                
                this.setState((s, props) =>
                {
                    s.autocomplete = false;
                    return s; 
                });    
                break;    
            }
            
            default:
                this.takeFromList = false;
                this.setState((s, props) =>
                {
                    let suggestion = el.value;
                    
                    s.value = el.value;
                    s.sugesstions = this.history && this.history.filter(
                        (s: string, i: number) => s.indexOf(suggestion) == 0);
                    
                    s.autocomplete = s.sugesstions && s.sugesstions.length > 0;

                    return s; 
                });    
                break;
        }
    }
    listNavigate(down: boolean) : void
    {
        this.setState((s, props) =>
        {
            let curIndex = this.state.sugesstions.indexOf(s.selectedValue);
            
            if(down)
            {
                this.takeFromList = true;
                s.autocomplete = true;
                
                if(curIndex < s.sugesstions.length - 1)
                {
                    s.selectedValue = this.state.sugesstions[curIndex + 1];
                }    
            }
            else
            {
                if(curIndex > 0)
                {
                    s.selectedValue = this.state.sugesstions[curIndex - 1];
                }
            }
            
            return s; 
        });

    }
    
    changeSelection(val: string) : void
    {
        this.setState((s, props) =>
        {
            s.autocomplete = false;
            s.selectedValue = null;
            s.value = val;
            
            return s; 
        });

        this.props.onSelect(val);
    }
    render () : JSX.Element
    {
        let suggestions = this.state.sugesstions && 
            this.state.sugesstions
                .sort((s1, s2) => s1.localeCompare(s2))
                .map((s: string, i: number) => 
                    <li className={"list-group-item" + (s == this.state.selectedValue ? " active" : "")} key={i}>{s}</li>);
        
        return (
            <div className="form-group">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder={this.props.placeholder}
                    defaultValue={this.props.value} 
                    onKeyDown={this.onKeyDown}
                    />
                <ul 
                    className={ this.state.autocomplete && suggestions.length > 0 ? "list-group shadow" : "hidden"}
                    >
                    { suggestions }
                </ul>
            </div>        
        );
    }
}