var Controller = (function () {
    function Controller() {
        this.mainQuery = new Query();
        this.tablesQuery = new Query();
        this.resultChaged = new FreeEvent();
        this.hostChanged = new FreeEvent();
        this.connectionUpdate = this.connectionUpdate.bind(this);
        this.queryUpdate = this.queryUpdate.bind(this);
    }
    Controller.prototype.connectionUpdate = function (prms) {
        this.hostChanged.rise(this.mainQuery.send({
            prms: {
                host: prms.host,
                port: prms.port,
                withMetadata: false,
                query: "show tables"
            },
            result: null,
            meta: null,
            status: null
        }));
    };
    Controller.prototype.queryUpdate = function (prms) {
        this.resultChaged.rise(this.tablesQuery.send({
            prms: prms,
            result: null,
            meta: null,
            status: null
        }));
    };
    return Controller;
})();
var Query = (function () {
    function Query() {
    }
    Query.prototype.send = function (q) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.xhr && (_this.xhr.abort());
            _this.xhr = new XMLHttpRequest();
            var xhr = _this.xhr;
            xhr.open("POST", "/makeQuery");
            xhr.setRequestHeader("content-type", "application/json");
            xhr.onload = function (e) {
                var obj = JSON.parse(xhr.response);
                if (obj.errorMsg) {
                    reject(obj.errorMsg);
                }
                else {
                    q.result = obj.rows;
                    q.meta = obj.meta;
                    q.status = obj.status;
                    resolve(q);
                }
                _this.xhr = null;
            };
            xhr.onerror = function (e) {
                reject(e);
                _this.xhr = null;
            };
            xhr.send(JSON.stringify({
                statement: q.prms.query,
                withMetadata: q.prms.withMetadata,
                host: q.prms.host,
                port: q.prms.port
            }));
        });
    };
    return Query;
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AutocompleteInput = (function (_super) {
    __extends(AutocompleteInput, _super);
    function AutocompleteInput() {
        _super.call(this);
        this.state = {
            autocomplete: false,
            sugesstions: [],
            selectedValue: null,
            value: null
        };
        this.onKeyDown = this.onKeyDown.bind(this);
    }
    AutocompleteInput.prototype.onKeyDown = function (e) {
        var _this = this;
        var el = e.target;
        switch (e.keyCode) {
            case 13:
                {
                    e.preventDefault();
                    if (this.takeFromList) {
                        this.takeFromList = false;
                        el.value = this.state.selectedValue;
                        this.changeSelection(this.state.selectedValue);
                    }
                    else {
                        var suggestion = el.value;
                        if (!this.history || !this.history.some(function (s) { return s == suggestion; })) {
                            this.history || (this.history = []);
                            this.history.push(suggestion);
                        }
                        this.changeSelection(el.value);
                    }
                    break;
                }
            case 40:
                {
                    e.preventDefault();
                    this.listNavigate(true);
                    break;
                }
            case 38:
                {
                    e.preventDefault();
                    this.listNavigate(false);
                    break;
                }
            case 27:
                {
                    e.preventDefault();
                    this.takeFromList = false;
                    this.setState(function (s, props) {
                        s.autocomplete = false;
                        return s;
                    });
                    break;
                }
            default:
                this.takeFromList = false;
                this.setState(function (s, props) {
                    var suggestion = el.value;
                    s.value = el.value;
                    s.sugesstions = _this.history && _this.history.filter(function (s, i) { return s.indexOf(suggestion) == 0; });
                    s.autocomplete = s.sugesstions && s.sugesstions.length > 0;
                    return s;
                });
                break;
        }
    };
    AutocompleteInput.prototype.listNavigate = function (down) {
        var _this = this;
        this.setState(function (s, props) {
            var curIndex = _this.state.sugesstions.indexOf(s.selectedValue);
            if (down) {
                _this.takeFromList = true;
                s.autocomplete = true;
                if (curIndex < s.sugesstions.length - 1) {
                    s.selectedValue = _this.state.sugesstions[curIndex + 1];
                }
            }
            else {
                if (curIndex > 0) {
                    s.selectedValue = _this.state.sugesstions[curIndex - 1];
                }
            }
            return s;
        });
    };
    AutocompleteInput.prototype.changeSelection = function (val) {
        this.setState(function (s, props) {
            s.autocomplete = false;
            s.selectedValue = null;
            s.value = val;
            return s;
        });
        this.props.onSelect(val);
    };
    AutocompleteInput.prototype.render = function () {
        var _this = this;
        var suggestions = this.state.sugesstions &&
            this.state.sugesstions
                .sort(function (s1, s2) { return s1.localeCompare(s2); })
                .map(function (s, i) {
                return React.createElement("li", {"className": "list-group-item" + (s == _this.state.selectedValue ? " active" : ""), "key": i}, s);
            });
        return (React.createElement("div", {"className": "form-group"}, React.createElement("input", {"type": "text", "className": "form-control", "placeholder": this.props.placeholder, "defaultValue": this.props.value, "onKeyDown": this.onKeyDown}), React.createElement("ul", {"className": this.state.autocomplete && suggestions.length > 0 ? "list-group shadow" : "hidden"}, suggestions)));
    };
    return AutocompleteInput;
})(React.Component);
var FreeEvent = (function () {
    function FreeEvent() {
    }
    FreeEvent.prototype.attach = function (handler) {
        this._handlers || (this._handlers = []);
        this._handlers.push(handler);
        return this;
    };
    FreeEvent.prototype.rise = function (value) {
        if (this._handlers) {
            for (var _i = 0, _a = this._handlers; _i < _a.length; _i++) {
                var h = _a[_i];
                h(value);
            }
        }
        return this;
    };
    return FreeEvent;
})();
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.controller = new Controller();
        this.changeStatement = this.changeStatement.bind(this);
        this.changeHostOrPort = this.changeHostOrPort.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.render = this.render.bind(this);
    }
    Main.prototype.componentDidMount = function () {
        if (this.props.host && this.props.port) {
            this.changeHostOrPort(this.props.host, this.props.port);
        }
    };
    Main.prototype.changeHostOrPort = function (host, port) {
        this.host = host == undefined ? this.host : host;
        this.port = port == undefined ? this.port : port;
        this.controller.connectionUpdate({
            query: null,
            withMetadata: false,
            host: this.host,
            port: this.port
        });
    };
    Main.prototype.changeStatement = function (statement) {
        this.statement = statement;
        this.controller.queryUpdate({
            query: statement,
            withMetadata: true,
            host: this.host,
            port: this.port
        });
    };
    Main.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {"className": "container-fluide"}, React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-md-2"}, React.createElement("div", {"className": "panel panel-default"}, React.createElement("div", {"className": "panel-heading"}, React.createElement("h4", null, "Host")), React.createElement("div", {"className": "panel-body"}, React.createElement("div", {"className": "form-group"}, React.createElement(AutocompleteInput, {"value": this.props.host, "placeholder": "адрес", "onSelect": function (s) { return _this.changeHostOrPort(s); }}), React.createElement(AutocompleteInput, {"value": this.props.port.toString(), "placeholder": "порт", "onSelect": function (s) { return _this.changeHostOrPort(null, parseInt(s)); }})), React.createElement(Table, {"sendQuery": this.controller.hostChanged, "getResult": function (q) { return q.result; }})))), React.createElement("div", {"className": "col-md-8"}, React.createElement("div", {"className": "panel panel-default"}, React.createElement("div", {"className": "panel-heading"}, React.createElement(AutocompleteInput, {"value": this.statement, "placeholder": "текст запроса", "onSelect": this.changeStatement})), React.createElement("div", {"className": "panel-body"}, React.createElement(Table, {"sendQuery": this.controller.resultChaged, "getResult": function (q) { return q.result; }})))), React.createElement("div", {"className": "col-md-2"}, React.createElement("div", {"className": "panel panel-default"}, React.createElement("div", {"className": "panel-heading"}, React.createElement("h4", null, "Meta")), React.createElement("div", {"className": "panel-body"}, React.createElement(Table, {"sendQuery": this.controller.resultChaged, "getResult": function (q) { return q.meta; }}))), React.createElement("div", {"className": "panel panel-default"}, React.createElement("div", {"className": "panel-heading"}, React.createElement("h4", null, "Status")), React.createElement("div", {"className": "panel-body"}, React.createElement(Table, {"sendQuery": this.controller.resultChaged, "getResult": function (q) { return q.status; }})))))));
    };
    return Main;
})(React.Component);
var Table = (function (_super) {
    __extends(Table, _super);
    function Table() {
        _super.call(this);
        this.state = {
            loading: false,
            rows: null,
            errorMsg: null
        };
        this.componentDidMount = this.componentDidMount.bind(this);
        this.setData = this.setData.bind(this);
        this.setError = this.setError.bind(this);
    }
    Table.prototype.componentDidMount = function () {
        var _this = this;
        this.props.sendQuery.attach(function (p) {
            _this.setState(function (s) {
                s.loading = true;
                return s;
            });
            p.then(_this.setData).catch(_this.setError);
        });
    };
    Table.prototype.setError = function (e) {
        this.setState(function (s) {
            s.errorMsg = e;
            s.rows = null;
            s.loading = false;
            return s;
        });
    };
    Table.prototype.setData = function (q) {
        var _this = this;
        this.setState(function (s) {
            s.errorMsg = null;
            s.rows = _this.props.getResult(q);
            s.loading = false;
            return s;
        });
    };
    Table.prototype.render = function () {
        var rows = this.state.rows;
        var lines = [];
        var headerCells = [];
        if (rows) {
            for (var key in rows[0]) {
                var th = React.createElement("td", {"key": headerCells.length}, key);
                headerCells.push(th);
            }
            lines.push(React.createElement("tr", {"key": lines.length}, headerCells));
            for (var _i = 0; _i < rows.length; _i++) {
                var r = rows[_i];
                var lineCells = [];
                for (var key in r) {
                    if (r.hasOwnProperty(key)) {
                        lineCells.push(React.createElement("td", {"key": lineCells.length}, r[key].toString()));
                    }
                }
                lines.push(React.createElement("tr", {"key": lines.length}, lineCells));
            }
        }
        return (React.createElement("div", null, React.createElement("div", {"className": this.state.errorMsg ? "alert alert-danger" : "hidden", "role": "alert"}, React.createElement("span", {"className": "glyphicon glyphicon-exclamation-sign", "aria-hidden": "true"}), React.createElement("span", {"className": "sr-only"}, "Error:"), " " + this.state.errorMsg), this.state.loading ? React.createElement("h1", null, "Загрузка...") :
            React.createElement("table", {"className": "table table-bordered"}, React.createElement("tbody", null, lines))));
    };
    return Table;
})(React.Component);
//# sourceMappingURL=app.js.map