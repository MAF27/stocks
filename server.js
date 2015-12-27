var express = require('express');
var WebSocketServer = require('ws')
	.Server;
var wsport = process.env.PORT || 14163;
var wss = new WebSocketServer({
	port: wsport
});
var initSymbols = ['TSLA', 'NVDA', 'YHOO'];
var app = express();
var ip = process.env.IP || 'localhost';
var port = process.env.PORT || 8080;

app.use(express.static('public'));

wss.on('connection', function(ws) {
	ws.on('message', function(message) {
    if (message) {
      var msg = JSON.parse(message);
      switch (msg.action) {
        case 'add':
          if (initSymbols.indexOf(msg.stock) === -1) {
            initSymbols.push(msg.stock);
            console.log('* New Server State: ', initSymbols);
          }
          break;
          case 'remove':
            if (initSymbols.indexOf(msg.stock) > -1) {
              initSymbols.splice(initSymbols.indexOf(msg.systockmbol), 1);
              console.log('* New Server State: ', initSymbols);
            }
            break;
      }
  		wss.clients.forEach(function(client) {
  			client.send(message);
  		});
    }

	});

  var init = { action: 'init', stocks: initSymbols };
  ws.send(JSON.stringify(init));
});

console.log('Web Socket Server listening on port 3000. initSymbols: ', initSymbols);

app.listen(port, function () {
  console.log('Webserver listening at http://%s:%s', ip, port);
});
