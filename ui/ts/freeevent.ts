
class FreeEvent<V>
{
	private _handlers: ((value: V) => void)[];

	attach(handler: (value: V) => void) : FreeEvent<V>
	{
		this._handlers || (this._handlers = []);
		
		this._handlers.push(handler);
		
		return this;
	}
	
	rise(value: V) : FreeEvent<V>
	{
		if(this._handlers)
		{
			for (var h of this._handlers) 
			{
				h(value);
			}
		}
		
		return this;
	}
}
