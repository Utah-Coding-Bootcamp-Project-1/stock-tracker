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
                resolve(result.json());
            } else {
                // How do we warn the user?
                // Display message on view somewhere?
                reject("error");
            }
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

        // Get total price differences
        var totalGain = (stockQuoteInfo.c - pricePaid).toFixed(2);
        // Check if negative or positive
        if(Math.sign(totalGain) >= 0) {
            textColor = "green";
        } else {
            textColor = "red";
        }

        // Get days gain from previous close
        var daysGain = ((stockQuoteInfo.c - stockQuoteInfo.pc) / stockQuoteInfo.pc).toFixed(4);
        // Check if negative or positive
        if(Math.sign(daysGain) >= 0) {
            bgColor = "green";
        } else {
            bgColor = "red";
        }

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
                                + "<td><span class='total-gain text-bold text-" + textColor + "'>" + totalGain + "</span></td>"
                                + "<td><button class='remove-button remove-single' id='" + savedStocks[i].includedTimestamp + "'>Remove</button></td>";
        
        // Append row to body
        tableBodyEl.appendChild(stockRowEl);
    }
}

// Add new stock to localStorage
var addStock = function(stock) {
    // Create newStock object to include in savedStocks array
    var newStock = {
        symbol: "MSFT", // This will need to pull dynamically 
        corporation: "Microsoft", // This will need to pull dynamically 
        pricePaid: 74, // This will need to pull dynamically 
        includedTimestamp: 1111111// Unix timestamp when added (helps to identify stock to edit)
    }
    
    // Add stock to array
    savedStocks.unshift(newStock);

    // Update localStorage to new array of stocks
    localStorage.setItem("stockPortfolio", JSON.stringify(savedStocks));

    // render stocks on page to include newly added stock
    renderSavedStocks();
}



