var builder = require('botbuilder');
var restify = require('restify');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();

// set up the menu that allows the users to choose from it
var flavorMenu = {
    "Chocolate Chip - $2.50" : {
        Description: "Chocolate Chip",
        Price: 2.50
    },
    "Vanilla Maple - 2.80": {
        Description: "Vanilla Maple",
        Price: 2.80
    },
    "Lemon Rasberry - 3.50": {
        Description: "Lemon Rasberry",
        Price: 3.50
    }
};

//This is an order taking bot for a cupcakes store
// This bot uses multiple dialogs technique to prompt users
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Welcome to the Simply Cupcakes.");
        session.beginDialog('askForName');
    },
    function (session, results) {
        session.dialogData.name = results.response;
        session.beginDialog('askForFlavor');
    },
    function (session, results) {
        var order = flavorMenu[results.response.entity];
        session.dialogData.flavor = order;
        session.beginDialog('askForOrderNumber');
    },
    /*
    function (session, results) {
        session.dialogData.orderNumber = results.response;
        session.beginDialog('askForOtherOrder');
    },
    function (session, results) {
        session.dialogData.reorder = results.response;
        if(session.dialogData.reorder == "yes" || "Yes") {
            session.beginDialog('askForFlavor');
        }
        else {
            session.send(`Ok!`);
        }      
    },
    */

    // Process request, calculates total and display order detail
    function (session, results) {
        session.dialogData.orderNumber = results.response;

        var total = (session.dialogData.orderNumber * session.dialogData.flavor.Price).toFixed(2);

        session.send(`Hello ${session.dialogData.name}! 
        You have ordered ${session.dialogData.orderNumber} 
        ${session.dialogData.flavor.Description} flavor cupcakes!
        The total would be $${total}`);
    }
]).set('storage', inMemoryStorage); // Register in-memory storage 

// start the dialog that prompts for user's name
bot.dialog('askForName', [
    function (session, args, next) {
        builder.Prompts.text(session, "Hello there. What's your name?");       
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
])

// Dialog to ask for cupcake flavor
bot.dialog('askForFlavor', [
    function (session) {
        builder.Prompts.choice(session, "What flavor of cupcake would you like to order? Enter number:", flavorMenu);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
])
 
// Final Dialog to ask for number of cupcakes to purchase
bot.dialog('askForOrderNumber', [
    function (session) {
        builder.Prompts.text(session, "How many would you like?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);
/*
bot.dialog('askForOtherOrder', [
    function (session) {
        builder.Prompts.text(session, "Would you like to place another order? Yes/No");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);
*/
