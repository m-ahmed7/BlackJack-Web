//declaring suits and values in array
var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
var values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var deck = new Array();
var players = new Array();

// initialize deck of cards with all 52 cards
function createDeck() {
    deck = new Array();
    for (var i = 0; i < values.length; i++) {
        for (var x = 0; x < suits.length; x++) {
            var scores = parseInt(values[i]);
            if (values[i] == "J" || values[i] == "Q" || values[i] == "K")
                scores = 10;
            if (values[i] == "A")
                scores = 11;
            var card = { Value: values[i], Suit: suits[x], Scores: scores };
            deck.push(card);
        }
    }
}

// initializing players
function createPlayers(num, defaultName) {
    players = new Array();
    for (var i = 1; i <= num; i++) {
        var hand = new Array();
        var playerName = (i === 1) ? defaultName : 'Player ' + i;
        var player = { Name: playerName, ID: i, Points: 0, Hand: hand };
        players.push(player);
    }
}

function createPlayersUI() {
    document.getElementById('players').innerHTML = '';
    for (var i = 0; i < players.length; i++) {
        var div_player = document.createElement('div');
        var div_playerid = document.createElement('div');
        var div_hand = document.createElement('div');
        var div_points = document.createElement('div');
        div_points.className = 'points';
        div_points.id = 'points_' + i;
        div_player.id = 'player_' + i;
        div_player.className = 'player';
        div_hand.id = 'hand_' + i;
        div_playerid.innerHTML = 'Player ' + players[i].ID;
        div_player.appendChild(div_playerid);
        div_player.appendChild(div_hand);
        div_player.appendChild(div_points);
        document.getElementById('players').appendChild(div_player);
    }
}

//shuffling all the cards in the deck as they were initialized orderly
function shuffle() {
    for (var i = 0; i < 500; i++) {
        var location1 = Math.floor((Math.random() * deck.length));
        var location2 = Math.floor((Math.random() * deck.length));
        var tmp = deck[location1];
        deck[location1] = deck[location2];
        deck[location2] = tmp;
    }
}

// function called when clicked deal (starts game)
function begin() {
    var playerName = "Player 1";
    // update the player name in the array
    players[0].Name = playerName;
    // reset totalScore for player
    for (var i = 0; i < players.length; i++) {
        players[i].totalScore = 0;
    }
    startblackjack();
}

var handnumber = 0;
// starts the game calling other functions
function startblackjack() {
    document.getElementById("status").style.display = "none";
    // deal 2 cards to every player
    currentPlayer = 0;
    createDeck();
    shuffle();
    // pass the default name to createPlayers function
    createPlayers(2, localStorage.getItem("loggedInUsername"));
    createPlayersUI();
    dealHands();
    document.getElementById('player_' + currentPlayer).classList.add('active');
    handnumber = handnumber + 1;
    document.getElementById('hn').innerHTML = handnumber;
}

// deals cards 2 to each player
function dealHands() {
    for (var i = 0; i < 2; i++) {
        for (var x = 0; x < players.length; x++) {
            var card = deck.pop();
            players[x].Hand.push(card);
            renderCard(card, x);
            updatePoints();
        }
    }
    updateDeck();
}

function renderCard(card, player) {
    var hand = document.getElementById('hand_' + player);
    hand.appendChild(getCardUI(card));
}

// card design
function getCardUI(card) {
    var el = document.createElement('div');
    var icon = '';
    if (card.Suit == 'Hearts')
        icon = '&hearts;';
    else if (card.Suit == 'Spades')
        icon = '&spades;';
    else if (card.Suit == 'Diamonds')
        icon = '&diams;';
    else
        icon = '&clubs;';
    el.className = 'card';
    el.innerHTML = card.Value + '<br/>' + icon;
    return el;
}


// returns the number of points that a player has in hand
function getPoints(player) {
    var points = 0;
    for (var i = 0; i < players[player].Hand.length; i++) {
        points += players[player].Hand[i].Scores;
    }
    players[player].Points = points;
    return points;
}

function updatePoints() {
    for (var i = 0; i < players.length; i++) {
        getPoints(i);
        document.getElementById('points_' + i).innerHTML = players[i].Points;
    }
}

// deals another card to the playe
function hitMe() {
    // pop a card from the deck to the current player
    // check if current player new points are over 21
    var card = deck.pop();
    players[currentPlayer].Hand.push(card);
    renderCard(card, currentPlayer);
    updatePoints();
    updateDeck();
    check();
}

// ends your turn
function stay() {
    // move on to next player, if any
    if (currentPlayer != players.length - 1) {
        document.getElementById('player_' + currentPlayer).classList.remove('active');
        currentPlayer += 1;
        document.getElementById('player_' + currentPlayer).classList.add('active');
        while ((players[1].Points < players[0].Points) && (players[1].Points < 18)) {
            hitMe();
        }
    }
    end()
}

var totalScore = 0;
var p1Score = 0;
var p2Score = 0;
var handwin = 0;
var handloss = 0;
var p1busted = 0;
var p2busted = 0;
var draw = 0;
var handscore = 0;

// outputs result of the hand
function end() {
    p1Score = players[0].Points;
    p2Score = players[1].Points;
    var penalty = 10;
    var drawpoints = 5;
    var winbonus = 10;
    var losspen = 5;
    
    if (p2Score > 21) {
        document.getElementById('status').innerHTML = 'Player-2 got Busted. Player-1 Wins!';
        p2busted = p2busted + 1;
        handwin = handwin + 1;
        document.getElementById('hw').innerHTML = handwin;
    }
    else if (p1Score > 21) {
        document.getElementById('status').innerHTML = 'Player-1 got Busted';
        p1busted = p1busted + 1;
        document.getElementById('b1').innerHTML = p1busted;
    }
    else if (p1Score == p2Score) {
        document.getElementById('status').innerHTML = 'Hand Draw';
        draw = draw + 1;
        document.getElementById('hd').innerHTML = draw;
    }
    else if (p1Score > p2Score) {
        document.getElementById('status').innerHTML = 'Player-1 Wins the Hand';
        handscore = handscore + (p1Score - p2Score)
        handwin = handwin + 1;
        document.getElementById('hw').innerHTML = handwin;
    }
    else if (p2Score > p1Score) {
        document.getElementById('status').innerHTML = 'Player-2 Wins the Hand';
        handloss = handloss + 1;
    }

    // updates the score during game
    totalScore = (draw * drawpoints) + (p2busted * penalty)
        + (handscore * winbonus) - (p1busted * penalty) - (handloss * losspen);
    document.getElementById('scorecount').innerHTML = totalScore;
    // call the function to update leaderboard
    updateLeaderboardOnGameEnd(players[0].Name, totalScore);
    document.getElementById("status").style.display = "inline-block";
}

// checks if score is abivve 21 to end game
function check() {
    if (players[currentPlayer].Points > 21) {
        end();
    }
}

function updateDeck() {
    document.getElementById('deckcount').innerHTML = deck.length;
}

window.addEventListener('load', function () {
    createDeck();
    shuffle();
    createPlayers(1);
    updateLeaderboard();
});

// storing registration details in local storage and validating when logginng in
function register() {
    var email = document.getElementById('email').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var passcheck = document.getElementById('repassword').value;
    var color = document.getElementById('color').value;
    if ((email != "") && (username != "") && (password != "") && (color != "")) {
        // password validation
        var passPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
        if (!passPattern.test(password)) {
            alert("Password must contain at least one number, one uppercase, one lowercase letter, and be at least 6 characters long.");
        }
        if (!email.includes('@') || !email.includes('.bj')) {
            alert("Please enter a valid email address");
        }
        if (password != passcheck) {
            alert('Passwords Do Not Match');
        }
        if (passcheck == password && email.includes('@') && email.includes('.bj')) {
            //creating an object to store details
            var regDetails = {
                username: username,
                password: password,
                email: email,
                color: color,
                score: 0
            };
            // object to JSON string conversion
            var userDataStr = JSON.stringify(regDetails);
            // store user details locally 
            localStorage.setItem("userData", userDataStr);
            // redirect to login page
            window.location.href = 'registered.html';
        }
    } else alert('Fill in all Details');

}

//check for details in local storage to allow log in
function login() {
    var loginUsername = document.getElementById('loginUsername').value;
    var loginPassword = document.getElementById('loginPassword').value;
    // get user details from local storage
    var storedData = localStorage.getItem("userData");
    // check if data is present in local storage
    if (storedData) {
        // parsing the JSON string to object
        var storedDetails = JSON.parse(storedData);
        var holdUsername = storedDetails.username;
        var holdPassword = storedDetails.password;
        if (loginUsername == holdUsername && loginPassword == holdPassword) {
            newUser = [holdUsername, totalScore];
            updateLeaderboardOnLogin(holdUsername, totalScore);
            window.location.href = "loggedin.html?username=" + encodeURIComponent(holdUsername);
        } else {
            alert('Invalid username or password');
        }
    } else {
        alert('Register yourself first');
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the username from the URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    var username = urlParams.get('username');
    // Display the username on the page
    document.getElementById('displayUsername').textContent = username;
});

var newUser = []
var scoresArray = [
    ["dummy1", 150],
    ["dummy2", 200],
    ["dummy1", 180],
    ["dummy3", 220],
    ["dummy2", 160],
    ["dummy2", 250],
    ["dummy4", 220]
];
function updateLeaderboard() {
    // Check if the current page has the specified ID
    if (document.body.id === "userScoresPage") {
        // Retrieve the leaderboard data from local storage
        var leaderboardData = localStorage.getItem("leaderboardData");
        // Check if leaderboard data is present
        if (leaderboardData) {
            // Parse the JSON string to an array
            var scoresArray = JSON.parse(leaderboardData);
            // Create and append the table to the body
            var table = document.createElement('table');
            var headerRow = table.insertRow(0);
            headerRow.innerHTML = '<th>UserID</th><th>High Score</th>';
            for (var i = 0; i < scoresArray.length; i++) {
                var row = table.insertRow();
                row.innerHTML = '<td>' + scoresArray[i][0] + '</td><td>' + scoresArray[i][1] + '</td>';
            }
            document.body.appendChild(table);
        }
    }
}

// updates the leaderboard on login (with username and score 0)
function updateLeaderboardOnLogin(username, score) {
    // get the leaderboard data from local storage
    var leaderboardData = localStorage.getItem("leaderboardData");
    // checks if leaderboard data is present
    if (leaderboardData) {
        // Parse the JSON string to an object
        var leaderboardArray = JSON.parse(leaderboardData);
        // add the new user's data to the array
        leaderboardArray.push([username, score]);
        // update the local storage with the modified array
        localStorage.setItem("leaderboardData", JSON.stringify(leaderboardArray));
    } else {
        // if no data is present, create a new array with user's data
        var newLeaderboardArray = [[username, score]];
        localStorage.setItem("leaderboardData", JSON.stringify(newLeaderboardArray));
    }
}

// updates the leaderboard to add scores
function updateLeaderboardOnGameEnd(username, score) {
    // get the data from local storage
    var leaderboardData = localStorage.getItem("leaderboardData");
    // if data is present
    if (leaderboardData) {
        // Parse the JSON string to an array
        var leaderboardArray = JSON.parse(leaderboardData);
        // find the index of the user
        var userIndex = leaderboardArray.findIndex(function (element) {
            return element[0] === username;
        });
        // if the user found update score else add a new entry
        if (userIndex !== -1) {
            leaderboardArray[userIndex][1] = Math.max(leaderboardArray[userIndex][1], score);
        } else {
            leaderboardArray.push([username, score]);
        }
        // update the local storage
        localStorage.setItem("leaderboardData", JSON.stringify(leaderboardArray));
    } else {
        // if no data is present create a new array with the user's data
        var newLeaderboardArray = [[username, score]];
        localStorage.setItem("leaderboardData", JSON.stringify(newLeaderboardArray));
    }
}

// to clear the leaderboard data
function clearLeaderboard() {
    localStorage.removeItem("leaderboardData");
    updateLeaderboard();
}