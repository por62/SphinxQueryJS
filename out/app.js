var server_1 = require("./server");
var childProcess = require("child_process");
function open(url) {
    // http://stackoverflow.com/q/1480971/3191, but see below for Windows.
    var command = process.platform === "win32" ? "cmd" :
        process.platform === "darwin" ? "open" :
            "xdg-open";
    var args = [url];
    if (process.platform === "win32") {
        // On Windows, we really want to use the "start" command. But, the rules regarding arguments with spaces, and
        // escaping them with quotes, can get really arcane. So the easiest way to deal with this is to pass off the
        // responsibility to "cmd /c", which has that logic built in.
        //
        // Furthermore, if "cmd /c" double-quoted the first parameter, then "start" will interpret it as a window title,
        // so we need to add a dummy empty-string window title: http://stackoverflow.com/a/154090/3191
        //
        // Additionally, on Windows ampersand needs to be escaped when passed to "start"
        url = url.replace(/&/g, '^&');
        args = ["/c", "start", '""'].concat(url);
    }
    childProcess.execFile(command, args);
}
var npm = childProcess.spawn('npm.cmd', ['install']);
npm.on('close', function (code) {
    console.log("npm install exited with code " + code);
    open('http://localhost:8700/');
    var svc = new server_1.Server();
    svc.run();
});
