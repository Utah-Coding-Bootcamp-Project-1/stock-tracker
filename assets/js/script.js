// Grab needed DOM Objects
var tableBodyEl = document.getElementById("saved-stock-list");

// Load saved stocks from localStorage and parse to object
var savedStocks = JSON.parse(localStorage.getItem("stockPortfolio")) || [];

// Find Stock By symbol
var getStockInfo = function(reqType, symbol) {
    // Determine type of call
    if(reqType === "company-info") {
        var url = "https://finnhub.io/api/v1/stock/profile2"; // Company information
    } else {
        var url = "https://finnhub.io/api/v1/quote"; // Stock quote details
    }
    // Perform fetch api call to get company info by symbol
    fetch(url + "?symbol=" + symbol + "&token=btc3din48v6p15lfr1ag")
    .then(function(result) {
        if (result.ok) {
            return result.json();
        } else {
            // How do we warn the user
            // Display message on view somewhere
            console.log("Something went wrong with getCompanyInfo");
        }
    })
    .then(function(result) {
        // return result
        console.log(result);
        return result;
    })
    .catch(function(error) {
        // NEED A WAY TO LET THE USER KNOW WITHOUT ALERTS, PROMPTS, or LOGS
        console.log(error);
    });
}
