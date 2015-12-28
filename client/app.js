/* globals AmCharts */
var angular = require('angular');

angular.module('sl', [])
	.controller('slCtrl', ['$http', '$scope', function($http, $scope) {
		var vm = this;
		var host = location.origin.replace(/^http/, 'ws');
		var ws = new WebSocket(host);

		var errFunc = function(err) {
			if (err) {
				console.log('Error getting data for initial set of stocks.');
			}
		};

		var drawChart = function() {
			vm.chart = AmCharts.makeChart('chartdiv', {
				type: 'stock',
				theme: 'dark',
				addClassNames: true,

				pathToImages: './images/',
				dataSets: [], // will be set dynamically

				panels: [{

						title: 'Value',
						percentHeight: 70,
						precision: 2,
						recalculateToPercents: 'never',

						stockGraphs: [{
							id: 'g1',
							showCategoryAxis: true,
							mouseWheelZoomEnabled: true,
							numberFormatter: {
								precision: 2,
								decimalSeparator: '.',
								thousandsSeparator: '\''
							},
							categoryField: 'date',
							dataDateFormat: 'YYYY-MM-DD',
							categoryAxis: {
								parseDates: true
							},

							valueField: 'value',
							comparable: true,
							compareField: 'value',
							balloonText: '[[title]]:<b>[[value]]</b>',
							compareGraphBalloonText: '[[title]]:<b>[[value]]</b>'
			      }],

						stockLegend: {
							periodValueTextComparing: '[[percents.value.close]]%',
							periodValueTextRegular: '[[value.close]]'
						}
			    },

					{
						title: 'Volume',
						percentHeight: 30,
						stockGraphs: [{
							valueField: 'volume',
							type: 'column',
							showBalloon: false,
							fillAlphas: 1
			      }],

						stockLegend: {
							periodValueTextRegular: '[[value.close]]'
						}
			    }
			  ],

				chartScrollbarSettings: {
					graph: 'g1'
				},

				chartCursorSettings: {
					valueBalloonsEnabled: true,
					fullWidth: true,
					cursorAlpha: 0.1,
					valueLineBalloonEnabled: true,
					valueLineEnabled: true,
					valueLineAlpha: 0.5
				},

				periodSelector: {
					position: 'left',
					periods: [{
						period: 'MM',
						selected: true,
						count: 1,
						label: '1 month'
			    }, {
						period: 'YYYY',
						count: 1,
						label: '1 year'
			    }, {
						period: 'YTD',
						label: 'YTD'
			    }, {
						period: 'MAX',
						label: 'MAX'
			    }]
				},

				dataSetSelector: {
					position: 'left'
				},
				'export': {
					'enabled': true
				}
			});
		};

		var drawStock = function(stock, callback) {
			var url = 'https://www.quandl.com/api/v3/datasets/YAHOO/' + stock + '/data.json?api_key=s6jg7uYEzs79xzsdrz_y&start_date=2014-01-01&end_date=2015-12-25&order=asc';
			$http.get(url)
				.then(function(res) {
					var dataSet = [];
					var dataProvider = [];

					res.data.dataset_data.data.forEach(function(item) {
						dataProvider.push({
							date: item[0],
							open: item[1],
							high: item[2],
							low: item[3],
							close: item[4],
							value: item[4],
							volume: item[5]
						});
					});

					dataSet = {
						title: stock,
						compared: true,
						fieldMappings: [{
							fromField: 'value',
							toField: 'value'
					}, {
							fromField: 'volume',
							toField: 'volume'
					}],
						categoryField: 'date',
						dataProvider: dataProvider
					};
					vm.chart.dataSets.push(dataSet);
					vm.chart.validateData();

					callback(false);
				})
				.catch(function(err) {
					// If there's an error, indicate it and stop
					callback(true);
				});
		};

		var addStockToAll = function(stock) {
			if (vm.stocks.indexOf(stock) === -1) {
				vm.stocks.push(stock);
				drawStock(stock, errFunc);
			}
		};

		var removeStockFromAll = function(stock) {
			var idx = vm.stocks.indexOf(stock);
			// If stock is still in list (may not be the case if change happened on this client)
			if (idx > -1) {
				vm.stocks.splice(idx, 1);
				$scope.$apply();
				for (var i = 0; i < vm.chart.dataSets.length; i++) {
					if (vm.chart.dataSets[i].title === stock) {
						vm.chart.dataSets.splice(i, 1);
						vm.chart.validateData();
					}
				}
			}
		};

		var initStocks = function(stocks) {
			vm.stocks = [];
			for (var i = 0; i < stocks.length; i++) {
				addStockToAll(stocks[i]);
			}
		};

		// Stock added on this client
		vm.addStock = function() {
			var stock = vm.newStock.toUpperCase();
			vm.newStock = '';

			// If symbol already on list, notify
			if (vm.stocks.indexOf(stock) > -1) {
				vm.msg = stock + ' is already on the list.';
			} else {
				drawStock(stock, function(err) {
					if (err) {
						vm.msg = 'Apologies, could not add symbol "' + stock + '"';
					} else {
						vm.msg = '';
						// Broadcast to other clients - including myself, thus triggering actions
						vm.stocks.push(stock);
						ws.send(JSON.stringify({
							'action': 'add',
							stock: stock
						}));
					}
				});
			}
		};

		vm.removeStock = function(stock) {
			vm.msg = '';
			ws.send(JSON.stringify({
				'action': 'remove',
				stock: stock
			}));
		};

		ws.onmessage = function(payload) {
			if (payload) {
				var msg = JSON.parse(payload.data);
				// console.log('* ON MESSAGE: ', msg);
				switch (msg.action) {
					case 'init':
						// Load stocks into chart and Angular div
						initStocks(msg.stocks);
						break;
					case 'add':
						addStockToAll(msg.stock);
						break;
					case 'remove':
						removeStockFromAll(msg.stock);
						break;
				}
			}
		};

		drawChart();

}]);
