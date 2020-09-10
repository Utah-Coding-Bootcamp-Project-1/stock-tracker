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
    return new Promise(function(resolve,reject) {
        fetch(url + "?symbol=" + symbol + "&token=btc3din48v6p15lfr1ag")
        .then(function(result) {
            if (result.ok) {
                return result.json();
            } else {
                // How do we warn the user?
                // Display message on view somewhere?
                reject("error");
            }
        })
        .then(function(result) {
            // return result
            resolve(result);
        })
        .catch(function(error) {
            // NEED A WAY TO LET THE USER KNOW WITHOUT ALERTS, PROMPTS, or LOGS
            reject("error");
        });
    })
}


// render saved stocks in document
var renderSavedStocks = async function() {
    // Destroy elements in parent object
    tableBodyEl.innerHTML = "";
    

    // Loop through savedStocks and add as rows to table body
    for (var i = 0; i < savedStocks.length; i++) {
        // Perform fetch api call to get company info by symbol
        var symbol = savedStocks[i].symbol;
        var pricePaid = parseInt(savedStocks[i].pricePaid);
        var bgColor, textColor = "";
         
        // Lookup stock prices
        var stockQuoteInfo = await getStockInfo("stock-quote", symbol);
        console.log(stockQuoteInfo);

        // Get price differences
        var totalGain = (stockQuoteInfo.c - pricePaid).toFixed(2);
        if(Math.sign(totalGain) >= 0) {
            bgColor = "green";
        } else {
            bgColor = "red";
        }
        var daysGain = ((stockQuoteInfo.c - stockQuoteInfo.pc) / stockQuoteInfo.pc).toFixed(4);

        // Create table row
        var stockRowEl = document.createElement("tr");

        // Add row contents
        stockRowEl.innerHTML = "<td>" + symbol + "</td>"
                                + "<td>" + savedStocks[i].corporation + "</td>"
                                + "<td>" + 
                                   "<input class='price-paid input-group-field' type='number' value=" + pricePaid.toFixed(2) +">" + 
                                  "</td>"
                                + "<td>" + stockQuoteInfo.c.toFixed(2)  + "</td>"
                                + "<td><span class='days-gain bg-" + bgColor + "'>" + daysGain + "%</span></td>"
                                + "<td><span class='total-gain text-bold text-green'>" + totalGain + "</span></td>"
                                + "<td><a class='clear button alert' id='" + savedStocks[i].includedTimestamp + "'>Remove</a></td>";
        
        // Append row to body
        tableBodyEl.appendChild(stockRowEl);
    }
    
    //console.log(savedStocks);
}

// Remove all saved stocks
var removeAllSavedStocks = function() {

}

// Remove saved stock
var removeSavedStock = function(ts) {
    // Loop through array of savedStocks and remove the stock with the given timestamp
    for (var i = 0; i < savedStocks.length; i++) {
        if(savedStocks[i].includedTimestamp === ts) {
            // remove stock from array
        }
    }

    // Render stocks on page
    renderSavedStocks();
}

// Edit existing saved stock
var editSavedStock = function(ts, newPrice) {
    
}


// Add new stock to localStorage
var addStock = function(stock) {
    // Create newStock object to include in savedStocks array
    var newStock = {
        symbol: "AAPL", // This will need to pull dynamically 
        corporation: "Apple", // This will need to pull dynamically 
        pricePaid: 200, // This will need to pull dynamically 
        includedTimestamp: 5555555555 // Unix timestamp when added (helps to identify stock to edit)
    }
    
    // Add stock to array
    savedStocks.unshift(newStock);

    // Update localStorage to new array of stocks
    localStorage.setItem("stockPortfolio", JSON.stringify(savedStocks));

    // render stocks on page to include newly added stock
    renderSavedStocks();
}


// View stock details - Opens modal
var viewStockDetails = function(symbol) {

    // Lookup Company Info
    getStockInfo("company-info", symbol);

    // Lookup Stock Quote
    getStockInfo("stock-quote", symbol);

    // Lookup Company Related News

    // Open Modal and Display Content

}


// Handle listeners for items clicked
var clickEventHandler = function(event) {
    event.preventDefault();

    var itemClicked = event.target;

    if(itemClicked.id === "remove-stock") {
        // remove stock event
    } else if (itemClicked.id === "edit-stock") {
        // edit stock
    }
}

// Event Listeners