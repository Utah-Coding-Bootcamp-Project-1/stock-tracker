// Grab needed DOM Objects
var tableEl = document.getElementById('saved-stock-table');
var tableBodyEl = document.getElementById('saved-stock-list');
var tableFooterEl = document.getElementById('saved-stock-summary');
var searchInputEl = document.getElementById('searchTerm');
var searchFormEl = document.getElementById('searchForm');
var tickerName = document.getElementById('modal-ticker-name');
var tickerCost = document.getElementById('cost');
var tickerHigh = document.getElementById('high');
var tickerLow = document.getElementById('low');
var tickerOpen = document.getElementById('open');
var tickerClose = document.getElementById('close');
var addButtonEl = document.getElementById('addButton');
var closeButtonEl = document.getElementById('closeButton');
var refreshButtonEl = document.getElementById('refresh-button');
var modalGraphEl = document.getElementById('modal-graph');
var modalNews = document.getElementById('modal-news');
var mainErrorMessageEl = document.getElementById("main-error-message");
var modalErrorMessageEl = document.getElementById("modal-error-message");

// Load saved stocks from localStorage and parse to object
var savedStocks = JSON.parse(localStorage.getItem("stockPortfolio")) || [];


// Display error message
var displayErrorMessage = function (obj, message) {
    // Clear previous error messages
    clearErrorMessages();

    // Show error message
    obj.innerHTML = "<div class='header'>"
                    + message 
                    + "</div>";

    $(obj).transition('fade up');
}


// clear error messages 
var clearErrorMessages = function () {
    // clear all error messages
    mainErrorMessageEl.innerHTML = "";
    mainErrorMessageEl.className = "ui negative message hidden";
    mainErrorMessageEl.style = "display:none";
    modalErrorMessageEl.innerHTML = "";
    modalErrorMessageEl.className = "ui negative message hidden";
    mainErrorMessageEl.style = "display:none";
}

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
                    // display error message and prevent modal popup
                    if(result.status === 429) {
                        displayErrorMessage(mainErrorMessageEl, "Reached limit of calls to Finnhub.io api. Please wait a minute and try again.");
                    } else {
                        displayErrorMessage(mainErrorMessageEl, "Unable to find company info using the provided stock symbol.");
                    }
                    // Reject result
                    reject("error");
                }
            })
            .catch(function (error) {
                // display error message and prevent modal popup
                displayErrorMessage(mainErrorMessageEl, "Unable to find company info using the provided stock symbol.");
                // Reject result
                reject("error");
            });
    })
}

// Search for related news articles
var getRelatedArticles = function (searchTerm) {
    // Tokens
    // var token = "0efe5784f39c90ff76da20274ced077a";
    // var token = "a5663e2b0a2d81f5f978eab1f9eb2415"
    // var token = "a09f193a45eebc6dbb36b80db7999354"
    var token = "0efe5784f39c90ff76da20274ced077a";
    var url = "https://gnews.io/api/v4/search?max=5&lang=en&q=" + searchTerm + "&token=" + token;

    return new Promise(function (resolve, reject) {
        fetch(url)
            .then(function (result) {
                if (result.ok) {
                    resolve(result.json());
                } else {
                    // dispaly error message and reject
                    displayErrorMessage(modalErrorMessageEl, "No related articles found.");
                    reject("error");
                }
            })
            .catch(function (error) {
                // dispaly error message and reject
                displayErrorMessage(modalErrorMessageEl, "No related articles found.");
                reject("error");
            });
    });
}

// Check if any stocks in array and hide/show elements
var toggleHiddenElements = function () {
    // hide/show add stock message and clear all button
    if (savedStocks.length > 0) {
        // hide add stock message 
        document.getElementById("add-stock-message").className = "hidden";
        document.getElementById("clear-all").className = "remove-button";
    } else {
        document.getElementById("add-stock-message").className = "";
        document.getElementById("clear-all").className = "remove-button hidden";
    }
}

// render saved stocks in document
var renderSavedStocks = async function () {
    // Destroy elements in parent object
    tableBodyEl.innerHTML ="";
    tableFooterEl.innerHTML = "";
    
    // create varaible to summarize table rows in footer
    var sPricePaid = 0;
    var sCurrentPrice = 0;
    var sPreviousClose = 0;

    // Loop through savedStocks and add as rows to table body
    for (var i = 0; i < savedStocks.length; i++) {
        // Perform fetch api call to get company info by symbol
        var symbol = savedStocks[i].symbol;
        var pricePaid = parseFloat(savedStocks[i].pricePaid);
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
        stockRowEl.id = "stock-" + savedStocks[i].timestampAdded;

        // Add row contents
        stockRowEl.innerHTML = "<td><span class='view-stock-details' data-symbol='" + symbol + "'>" + symbol + "</span></td>"
                                + "<td><span class='view-stock-details' data-symbol='" + symbol + "'>" + savedStocks[i].corporation + "</span></td>"
                                + "<td>" 
                                + "<span class='mobile-table'>Price Paid:</span>" 
                                +
                                "<input class='price-paid input-group-field' type='number' value='" + pricePaid.toFixed(2) +"' data-stock-id='" + savedStocks[i].timestampAdded + "' step='0.01'>" + 
                                "</td>" 
                                + "<td>" + "<span class='mobile-table'>Current Price:</span>" + stockQuoteInfo.c.toFixed(2)  + "</td>"
                                + "<td class='bg-" + bgColor + "'>"
                                + "<span class='mobile-table'>Days Gain:</span>"
                                + "<span class='days-gain'>" + daysGain + "%</span></td>"
                                + "<td><span class='mobile-table'>Total Gain:</span>"
                                + "<span class='total-gain text-bold text-" + textColor + "'>" + totalGain + "</span></td>"
                                + "<td><button class='remove-button remove-single' id='" + savedStocks[i].timestampAdded + "'>Remove</button></td>";
        stockRowEl.className = "stock-table-mobile";
        
        // update summary fields
        sPricePaid = sPricePaid + pricePaid;
        sCurrentPrice = sCurrentPrice + stockQuoteInfo.c;
        sPreviousClose = sPreviousClose + stockQuoteInfo.pc;
        
        // Append row to body
        tableBodyEl.appendChild(stockRowEl);
    }

    // Add sumamry to table footer
    tableFooterEl.innerHTML = "<tr><td colspan='2'>Portfolio Summary</td>"
                                + "<td>" + "<span class='mobile-table'>Price Paid: </span>" + sPricePaid.toFixed(2) + "</td>"
                                + "<td>" + "<span class='mobile-table'>Current Price: </span>" + sCurrentPrice.toFixed(2) + "</td>"
                                + "<td>" + "<span class='mobile-table'>Days Gain: </span>" + ((sCurrentPrice - sPreviousClose) / sPreviousClose).toFixed(4) + "%</td>"
                                + "<td>" + "<span class='mobile-table'>Total Gain: </span>" + (sCurrentPrice - sPricePaid).toFixed(2) + "</td>"
                                + "<td></td>";


    // hide/show elements based on savedStock array
    toggleHiddenElements();
}

// Add new stock to localStorage
var addStock = function (stock) {
    // Add stock to array
    savedStocks.unshift(stock);

    // Update localStorage to new array of stocks
    localStorage.setItem("stockPortfolio", JSON.stringify(savedStocks));

    // render stocks on page to include newly added stock
    renderSavedStocks();
}


// Remove all stocks from saved list
var removeAllStocks = function () {
    // set savedStocks to empty array
    savedStocks = [];

    // Update localStorage to new array of stocks
    localStorage.setItem("stockPortfolio", JSON.stringify(savedStocks));

    // Render Saved Stocks
    renderSavedStocks();
}

// Remove single stock from saved list
var removeSingleStock = function (stockID) {
    // Remove stock row from table
    document.getElementById("stock-" + stockID).remove();
    var removeStock = -1;

    // Loop through and grab index of stock to remove
    for (var i = 0; i < savedStocks.length; i++) {
        if (savedStocks[i].timestampAdded == stockID) {
            // Add stock to new array
            removeStock = i;
        }
    }
    console.log(removeStock);

    // Remove stock from array
    if (removeStock >= 0) {
        savedStocks.splice(removeStock, 1);
    }

    // hide/show elements based on savedStock array
    toggleHiddenElements();

    // Update localStorage to new array of stocks
    localStorage.setItem("stockPortfolio", JSON.stringify(savedStocks));
}

// Open stock details modal
var viewStockDetails = async function (symbol, addBtn) {
    // Clear any error messages
    clearErrorMessages();

    // Remove previous content
    modalNews.innerHTML = "";
    modalGraphEl.innerHTML = "";

    // retrieve company name
    var compInfo = await getStockInfo("company-info", symbol);

    // Check if company info was returned
    if(!compInfo.name) {
        // display error message and prevent modal popup
        displayErrorMessage(mainErrorMessageEl, "Unable to find company info using the provided stock symbol.");
        return;
    }

    // format company name
    var companyNameTicker = compInfo['name'] + " (" + compInfo['ticker'] + ")";

    // display company name in modal
    tickerName.innerText = companyNameTicker

    // Companyh name
    var companyName = compInfo.name;

    // check if companyName contains spaces, replace with '+'
    if(companyName.includes(' ')) {
        companyName.split(' ').join('+');
    } 

    // check if company name contains '.' and replace with '+'
    if(companyName.includes('.')) {
        companyName = companyName.replace(".", "+");
    }

    // retrieve stock quote
    var stockQuote = await getStockInfo("stock-quote", symbol);

    // Check if valid stock quote was returned
    if(!stockQuote.c) {
        // display error message and prevent modal popup
        displayErrorMessage(mainErrorMessageEl, "Unable to find company info using the provided stock symbol.");
        return;
    }

    // Show modal
    $('.ui.modal').modal('show');
    if (!addBtn) {
        addButtonEl.className = "ui green button hidden";
    } else {
        addButtonEl.className = "ui green button";
    }

    // put ticker values into table
    tickerCost.innerText = stockQuote['c'];
    tickerHigh.innerText = stockQuote['h'];
    tickerLow.innerText = stockQuote['l'];
    tickerOpen.innerText = stockQuote['o'];
    tickerClose.innerText = stockQuote['pc'];

    // save ticker values to global var
    window.newStock = {
        symbol: symbol, 
        corporation: companyNameTicker, 
        pricePaid: stockQuote['c'], 
        timestampAdded: Date.now()
    }

    // insert stock graph iframe
    // <iframe frameBorder='0' scrolling='no' width='800' height='420' src='https://api.stockdio.com/visualization/financial/charts/v1/HistoricalPrices?app-key=9FF1A978F5E24F84B3825CC1B09B2928&symbol=TSLA&dividends=true&splits=true&showLastPrice=false&palette=Financial-Light'></iframe>

    var stockGraph = document.createElement("div");
    
    stockGraph.innerHTML = "<iframe frameBorder='0' scrolling='no' width='100%' height='420' src='https://api.stockdio.com/visualization/financial/charts/v1/HistoricalPrices?app-key=9FF1A978F5E24F84B3825CC1B09B2928&symbol=" +
                            compInfo['ticker'] +
                            "&dividends=true&splits=true&showLastPrice=false&palette=Financial-Light'></iframe>";

    modalGraphEl.appendChild(stockGraph);

    // retrieve related news articles
    var relatedArticles = await getRelatedArticles(companyName); // compInfo.name
    
    if(relatedArticles.totalArticles > 0) {
         // display related articles and images
        for (i=0; i < 3; i++) {
            // Add new row 
            var modalNewsRow = document.createElement("section")
            modalNewsRow.className = "row middle aligned";

            // Add news article image
            var modalNewsImg = document.createElement("section");
            modalNewsImg.className = "six wide column";
            modalNewsImg.innerHTML = '<a href="' + relatedArticles.articles[i].url + '" target="_blank">' + '<img class= "ui rounded image" src= "' + relatedArticles.articles[i].image + '" width = 300>' + '</a>';
            
            // Add news article text
            var modalNewsArticle = document.createElement("section");
            modalNewsArticle.className = "ten wide column";
            modalNewsArticle.innerHTML = '<a href="' + relatedArticles.articles[i].url + '" target="_blank" class="article-text"><div class="ui row article-titles">'
                             + '<h5>' + relatedArticles.articles[i].title + '</h5></div>' 
                             + relatedArticles.articles[i].description + '</a>';
            
            // Append article info to container
            modalNewsRow.appendChild(modalNewsImg); 
            modalNewsRow.appendChild(modalNewsArticle);

            modalNews.appendChild(modalNewsRow);
        };
    } else {
        // display error message
        displayErrorMessage(modalErrorMessageEl, "No related articles found.");
    }
};

// get value in search field when the search button/return is used
function formSubmitHandler(event) {
    //prevent refreshing page
    event.preventDefault();

    //get value from search field and trim it
    var searchTerm = searchInputEl.value.trim().toUpperCase();

    // clear out search input for next search
    searchInputEl.value = "";

    //call function to get info from api and display it in modal
    viewStockDetails(searchTerm, true);
}

// saved stock table handler function
var tableStockHandler = function (event) {
    //prevent refreshing page
    event.preventDefault();

    // Grab clicked target
    var clickedItem = event.target;

    // perform function based on target clicked
    if (clickedItem.className.includes("remove-single")) {
        // Remove Single Stock
        removeSingleStock(clickedItem.id);
    } else if (clickedItem.id === "clear-all") {
        // Remove all stocks
        removeAllStocks();
    } else if (clickedItem.className.includes("view-stock-details")) {
        // view selected stocks details in modal
        viewStockDetails(clickedItem.getAttribute("data-symbol"), false);
    }
}

// Add button handler function
var addButtonHandler = function () {
    if (typeof newStock !== 'undefined') {
        addStock(newStock);
        $('.ui.modal').modal('hide');
    }
}

// hide the modal when close button is clicked
var closeButtonHandler = function () {
    $('.ui.modal').modal('hide');
    clearErrorMessages();
}

// Add change event listener to price paid input fields
var editStockHandler = function(event) {
    // Grab changed target
    var changedItem = event.target;

    // Determine if changed item is price paid input field
    if(changedItem.className.includes("price-paid")) {
        // Grab values from target element
        var changedStockId = changedItem.getAttribute("data-stock-id");
        var newPriceValue = changedItem.value;

        // Find stock in array and update value
        for(var i = 0; i < savedStocks.length; i++) {
            if(changedStockId == savedStocks[i].timestampAdded) {
                savedStocks[i].pricePaid = newPriceValue;
            }
        }

        // Update localStorage
        localStorage.setItem("stockPortfolio", JSON.stringify(savedStocks));

        // Render Saved Stocks
        renderSavedStocks();
    }
}


// Event listeners
tableBodyEl.addEventListener("change", editStockHandler);
tableEl.addEventListener("click", tableStockHandler);
addButtonEl.addEventListener("click", addButtonHandler)
closeButtonEl.addEventListener("click", closeButtonHandler);
searchFormEl.addEventListener("submit", formSubmitHandler); 
refreshButtonEl.addEventListener("click", renderSavedStocks);

// Render stocks on page load
renderSavedStocks();