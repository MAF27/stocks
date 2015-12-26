// get walking directions from central park to the empire state building
var http = require("https");
    // url = "https://www.quandl.com/api/v3/datasets/YAHOO/AAPL/metadata.json?api_key=s6jg7uYEzs79xzsdrz_y";
    url = "https://www.quandl.com/api/v3/datasets/YAHOO/AAPL/data.json?api_key=s6jg7uYEzs79xzsdrz_y&column_index=4&start_date=2015-01-01&end_date=2015-12-25&order=asc";
    // url = "http://www.google.com/finance/info?q=NSE:SREN";

// get is a simple wrapper for request()
// which sets the http method to GET
var request = http.get(url, function (response) {
    // data is streamed in chunks from the server
    // so we have to handle the "data" event
    var buffer = "",
        data,
        route;

    response.on("data", function (chunk) {
        buffer += chunk;
    });

    response.on("end", function (err) {
        // finished transferring data
        // dump the raw data
        console.log(buffer);
        // console.log("\n");
        // data = JSON.parse(buffer);
    });
});
