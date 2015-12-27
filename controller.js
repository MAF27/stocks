/* globals angular, AmCharts */
angular.module('sl', [])
	.controller('slCtrl', ['$http', function($http) {
		var vm = this;

		vm.symbols = ['TSLA', 'NVDA', 'YHOO'];
		// vm.symbols = ['TSLA', 'NVDA', 'YHOO', 'AAPL'];

		var makeChart = function() {
			vm.chart = AmCharts.makeChart('chartdiv', {
				type: 'stock',
				theme: 'dark',

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

		var setStock = function(symbol, callback) {
			var url = 'https://www.quandl.com/api/v3/datasets/YAHOO/' + symbol + '/data.json?api_key=s6jg7uYEzs79xzsdrz_y&start_date=2014-01-01&end_date=2015-12-25&order=asc';
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
						title: symbol,
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

		vm.addSymbol = function() {
			var s = vm.s.toUpperCase();
			vm.s = '';

			// If symbol already on list, notify
			if (vm.symbols.indexOf(s) > -1) {
				vm.msg = 'Symbol "' + s + '" is already on the list.';
			} else {
				setStock(s, function(err) {
					if (err) {
						vm.msg = 'Apologies, could not add symbol "' + s + '"';
					} else {
						vm.msg = 'Added symbol "' + s + '"';
						vm.symbols.push(s);
					}
				});
			}
		};

		vm.removeSymbol = function(stock) {
			var idx = vm.symbols.indexOf(stock);
			vm.symbols.splice(idx, 1);

			// Remove stock from datasets array
			for (var i = 0; i < vm.chart.dataSets.length; i++) {
				if (vm.chart.dataSets[i].title === stock) {
					vm.chart.dataSets.splice(idx, 1);
					vm.chart.validateData();
				}
			}
		};

		var errFunc = function(err) {
			if (err) {
				console.log('Error getting data for initial set of stocks.');
			}
		};

		makeChart();

		// Load Stocks
		for (var i = 0; i < vm.symbols.length; i++) {
			setStock(vm.symbols[i], errFunc);
		}
}]);
