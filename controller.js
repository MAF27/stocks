/* globals angular, AmCharts */
angular.module('sl', [])
	.controller('slCtrl', ['$http', function($http) {
		var vm = this;

		vm.symbols = ['TSLA', 'NVDA', 'YHOO', 'AAPL'];

		vm.makeChart = function() {
			vm.chart = AmCharts.makeChart('chartdiv', {
				type: 'stock',
				'theme': 'light',

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

		var setStock = function(symbol) {
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

				});
		};

		vm.makeChart();

		// Load Stocks
		for (var i = 0; i < vm.symbols.length; i++) {
			setStock(vm.symbols[i]);
		}
}]);
