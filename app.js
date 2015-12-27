var WebSocketServer = require('ws')
	.Server;
var wss = new WebSocketServer({
	port: 3000
});
var initSymbols = ['TSLA', 'NVDA', 'YHOO'];

wss.on('connection', function(ws) {
	ws.on('message', function(message) {
    console.log('* WS.ON: message: ', message);
    if (message) {
      var msg = JSON.parse(message);
      switch (msg.action) {
        case 'add':
          if (initSymbols.indexOf(msg.symbol) === -1) {
            initSymbols.push(msg.symbol);
            console.log('* New Server State: ', initSymbols);
          }
          break;
          case 'remove':
            if (initSymbols.indexOf(msg.symbol) > -1) {
              initSymbols.splice(initSymbols.indexOf(msg.symbol), 1);
              console.log('* New Server State: ', initSymbols);
            }
            break;
      }
  		wss.clients.forEach(function(client) {
  			client.send(message);
  		});
    }

	});

  var init = { action: 'init', symbols: initSymbols };
  console.log('* WS ON: New Client, sending ' + init.symbols);
  ws.send(JSON.stringify(init));
});

console.log('Web Socket Server listening on port 3000. initSymbols: ', initSymbols);
