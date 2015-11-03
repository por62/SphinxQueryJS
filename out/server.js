/// <reference path="typings\express\express.d.ts" />
/// <reference path="typings\body-parser\body-parser.d.ts" />
/// <reference path="typings\mysql\mysql.d.ts" />
var express = require("express");
var bodyParser = require("body-parser");
var mysql_1 = require("mysql");
var Server = (function () {
    function Server() {
        this.port = 8700;
    }
    Server.prototype.run = function () {
        this.app = express();
        this.app
            .use(express.static(__dirname + "/../ui"))
            .use(bodyParser.json())
            .post('/makeQuery', this.querySphinx)
            .listen(this.port);
    };
    Server.prototype.querySphinx = function (req, res) {
        var conn = mysql_1.createConnection({
            host: req.body.host,
            port: req.body.port
        });
        conn.connect();
        var result = {
            rows: [],
            meta: [],
            status: []
        };
        var hasErrors = false;
        var statement = req.body.statement;
        conn.query(statement)
            .on('error', function (err, index) {
            hasErrors = true;
            result.errorMsg = err.message;
        })
            .on('result', function (row, index) {
            if (index == 0)
                result.rows.push(row);
        })
            .on('end', function () {
            if (req.body.withMetadata) {
                conn.query("show meta")
                    .on('result', function (row, index) {
                    if (index == 0)
                        result.meta.push(row);
                })
                    .on('end', function () {
                    conn.query("show status")
                        .on('result', function (row, index) {
                        if (index == 0)
                            result.status.push(row);
                    })
                        .on('end', function () {
                        if (hasErrors)
                            conn.destroy();
                        else
                            conn.end();
                        res.send(result);
                    });
                });
            }
            else {
                if (hasErrors)
                    conn.destroy();
                else
                    conn.end();
                res.send(result);
            }
        });
    };
    return Server;
})();
exports.Server = Server;
