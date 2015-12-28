var express = require('express');
var WebSocketServer = require('ws')
	.Server;
var initSymbols = ['TSLA', 'NVDA', 'YHOO'];
var app = express();
var port = process.env.PORT || 5000;

app.use(express.static('public'));
var server = app.listen(port, function () {
  console.log('Webserver listening at port %s', port);
});
var wss = new WebSocketServer({
	server: server
});

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

console.log('Web Socket Server started initSymbols %s ', initSymbols);
