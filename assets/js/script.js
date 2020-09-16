// Grab needed DOM Objects
var tableBodyEl = document.getElementById("saved-stock-list");
var searchInputEl = document.getElementById('searchTerm');
var searchFormEl = document.getElementById('searchForm');
var tickerName = document.getElementById('modal-ticker-name')
var tickerCost = document.getElementById('cost')
var tickerHigh = document.getElementById('high')
var tickerLow = document.getElementById('low')
var tickerOpen = document.getElementById('open')
var tickerClose = document.getElementById('close')
var modalImages = document.getElementById('modal-images')
var modalArticles = document.getElementById('modal-articles')

// Load saved stocks from localStorage and parse to object
var savedStocks = JSON.parse(localStorage.getItem("stockPortfolio")) || [];

// Find Stock By symbol
var getStockInfo = function (reqType, symbol) {
    // Determine type of call
    if (reqType === "company-info") {
        var url = "https://finnhub.io/api/v1/stock/profile2"; // Company information
    } else {
        // stock-quote
        var url = "https://finnhub.io/api/v1/quote"; // Stock quote details
    }
    // Perform fetch api call to get company info by symbol
    return new Promise(function (resolve, reject) {
        fetch(url + "?symbol=" + symbol + "&token=btc3din48v6p15lfr1ag")
            .then(function (result) {
                if (result.ok) {
                    resolve(result.json());
                } else {
                    // How do we warn the user?
                    // Display message on view somewhere?
                    reject("error");
                }
            })
            .catch(function (error) {
                // NEED A WAY TO LET THE USER KNOW WITHOUT ALERTS, PROMPTS, or LOGS
                reject("error");
            });
    })
}

// Search for related news articles
var getRelatedArticles = function (searchTerm) {
    //var url = proxyUrl + "https://cors-anywhere.herokuapp.com/https://newsapi.org/v2/top-headlines?q=" + searchTerm + "&apiKey=92bae84730364e2c976c27872f8a9fa5";
    var url = "https://gnews.io/api/v4/search?max=5&lang=en&q=" + searchTerm + "&token=0efe5784f39c90ff76da20274ced077a";

    return new Promise(function (resolve, reject) {
        fetch(url)
            .then(function (result) {
                if (result.ok) {

                    resolve(result.json());
                } else {
                    reject("error");
                }
            })
            .catch(function (error) {
                reject("error");
            });
    });
}

// render saved stocks in document
var renderSavedStocks = async function () {
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
        if (Math.sign(totalGain) >= 0) {
            textColor = "green";
        } else {
            textColor = "red";
        }

        // Get days gain from previous close
        var daysGain = ((stockQuoteInfo.c - stockQuoteInfo.pc) / stockQuoteInfo.pc).toFixed(4);
        // Check if negative or positive
        if (Math.sign(daysGain) >= 0) {
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
                                + "<td class='" + bgColor + "'><span class='days-gain'>" + daysGain + "%</span></td>"
                                + "<td><span class='total-gain text-bold text-" + textColor + "'>" + totalGain + "</span></td>"
                                + "<td><button class='remove-button remove-single' id='" + savedStocks[i].includedTimestamp + "'>Remove</button></td>";
        
        // Append row to body
        tableBodyEl.appendChild(stockRowEl);
    }
}

// Add new stock to localStorage
var addStock = function (stock) {
    // Create newStock object to include in savedStocks array
    var newStock = {
        symbol: "MSFT", // This will need to pull dynamically 
        corporation: "Microsoft", // This will need to pull dynamically 
        pricePaid: 74, // This will need to pull dynamically 
        id: savedStocks.length
    }

    // Add stock to array
    savedStocks.unshift(newStock);

    // Update localStorage to new array of stocks
    localStorage.setItem("stockPortfolio", JSON.stringify(savedStocks));

    // render stocks on page to include newly added stock
    renderSavedStocks();
}

// Remove all stocks from saved list
var removeAllStocks = function() {
    // set savedStocks to empty array
    savedStocks = [];

    // Update localStorage to new array of stocks
    localStorage.setItem("stockPortfolio", JSON.stringify(savedStocks));
}

// Remove single stock from saved list
var removeSingleStock = function(stockID) {
    // Remove stock from array
    savedStocks.splice(stockID, 1);

    // Loop through and reassign id
    for (var i = 0; i < savedStocks.length; i++) {
        savedStocks[i].id = i;
    }

    // Update localStorage to new array of stocks
    localStorage.setItem("stockPortfolio", JSON.stringify(savedStocks));
}

// Open stock details modal
var viewStockDetails = async function (symbol) {
    // Show modal
    $('.ui.modal').modal('show');

    // retrieve company name
    var compInfo = await getStockInfo("company-info", symbol);
    console.log(compInfo);

    // display company name in modal
    tickerName.innerText = compInfo['name'] + " (" + compInfo['ticker'] + ")";

    // replace white space with '+' to use in related article api call
    var companyName = compInfo.name.split(' ').join('+');
    console.log(companyName);

    // retrieve stock quote
    var stockQuote = await getStockInfo("stock-quote", symbol);
    console.log(stockQuote);

    // put ticker values into table
    tickerCost.innerText = stockQuote['c'];
    tickerHigh.innerText = stockQuote['h'];
    tickerLow.innerText = stockQuote['l'];
    tickerOpen.innerText = stockQuote['o'];
    tickerClose.innerText = stockQuote['pc'];

    // retrieve related news articles
    var relatedArticles = await getRelatedArticles(companyName); // compInfo.name
    console.log(relatedArticles);
}

// get value in search field when the search button/return is used
function formSubmitHandler(event) {
    //prevent refreshing page
    event.preventDefault();

    //get value from search field and trim it
    var searchTerm = searchInputEl.value.trim();
    console.log(searchTerm);

    //call function to get info from api and display it in modal
    viewStockDetails(searchTerm);
}


searchFormEl.addEventListener("submit", formSubmitHandler);