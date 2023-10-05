//Setting possible values and suits
const suits = ["♥", "♦", "♣", "♠"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

//Creating a deck of cards
let deck = [];
for (const suit of suits) {
  for (const value of values) {
    deck.push({ value, suit });
  }
}

//Shuffle deck
function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

//Pull a card from deck
function dealCard() {
  return deck.pop();
}

//Calculate Hand Value
function calculateHandValue(hand) {
  let value = 0;
  let aceCount = 0;

  for (const card of hand) {
    const cardValue = card.value;

    if (cardValue === "A") {
      aceCount++;
      value += 11;
    } else if (["J", "Q", "K"].includes(cardValue)) {
      value += 10;
    } else {
      value += parseInt(cardValue);
    }
  }

  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }

  return value;
}

let playerHand = [];
let dealerHand = [];
let playerMoney = 100;
let sessionTopScore = playerMoney;
let localTop = { player: "", score: 100 };
let betAmount;
let playerName;

//When starting a game, it will set the player name by it input, and if there wasn't, will set it to 'Player' by default
function setPlayerName() {
  playerName = document.getElementById("player-name").value;
  if (!playerName) {
    playerName = "Player";
  }
}

updateLocalTop();

//Updating local storage. Player must get more than 100$ (If he is the first to play) or achive more than the leading player
function updateLocalTop() {
  if (localStorage.getItem("localTop")) {
    localTop = JSON.parse(localStorage.getItem("localTop"));
    document.getElementById(
      "leading-player"
    ).innerText = `Best score achieved was ${localTop.score}$ by ${localTop.player}`;
  }
}

//Will move the leader description area from menu to table
function moveLeader() {
  const leaderDescription = document.getElementById("leading-player");
  document.getElementById("table").appendChild(leaderDescription);
}

//Check if player's bet is valid (only numbers, not decimals)
function isValidBet() {
  betAmount = document.getElementById("bet-amount").value;
  if (
    isNaN(betAmount) ||
    betAmount <= 0 ||
    betAmount > playerMoney ||
    betAmount % 1 != 0
  ) {
    document.getElementById("bet-button").disabled = true;
  } else {
    document.getElementById("bet-button").disabled = false;
  }
}

//Restart the game
function restartGame() {
  playerMoney = 100;
  sessionTopScore = playerMoney;
  document.getElementById("restart-button").style.display = "none";
  startGame();
}

//Start a game, will reset the table before
function startGame() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("table").style.display = "block";
  document.getElementById("bet-display").style.display = "none";
  document.getElementById("deal-button").style.display = "none";
  document.getElementById("hit-button").style.display = "none";
  document.getElementById("stand-button").style.display = "none";

  document.getElementById("message").innerHTML = "<br>";
  document.getElementById("deal-button").disabled = true;
  document.getElementById("bet-button").disabled = true;
  document.getElementById("bet-amount").value = "";
  dealtCards = [];
  deck = deck.concat(playerHand, dealerHand);
  playerHand = [];
  dealerHand = [];
  updateUI();
  document.getElementById("player-hand").innerHTML = "";
  document.getElementById("dealer-hand").innerHTML = "";
  if (playerMoney > 1) {
    document.getElementById("bet-amount").style.display = "inline";
    document.getElementById("bet-button").style.display = "inline";
    shuffleDeck();
    document.getElementById(
      "player-money"
    ).innerHTML = `${playerName}'s money: ${playerMoney}$`;
  } else {
    //Game over
    document.getElementById("message").innerHTML = `
    <p>Can't bet anymore! Game over!</p>
    <p>Your best score this game was: ${sessionTopScore}$</p>
  `;
    document.getElementById("restart-button").style.display = "inline";
    document.getElementById("player-money").innerHTML = ``;
  }
}

//Dealing Cards, open options for player
function dealTable() {
  document.getElementById("deal-button").style.display = "inline";
  document.getElementById("hit-button").style.display = "inline";
  document.getElementById("stand-button").style.display = "inline";
  document.getElementById("bet-button").style.display = "none";
  playerMoney -= betAmount;
  playerHand = [dealCard(), dealCard()];
  dealerHand = [dealCard()];
  document.getElementById("hit-button").disabled = false;
  document.getElementById("stand-button").disabled = false;
  document.getElementById("bet-button").disabled = true;
  document.getElementById("bet-amount").style.display = "none";
  document.getElementById("bet-display").style.display = "inline";
  document.getElementById(
    "bet-display"
  ).textContent = `Your bet: ${+document.getElementById("bet-amount").value}$`;
  updateUI();
  if (calculateHandValue(playerHand) === 21) {
    stand();
  }
}

//Player can only choose 'Deal' to end the match
function disableGameButtons() {
  document.getElementById("hit-button").disabled = true;
  document.getElementById("stand-button").disabled = true;
}

//Player pulling a card
function hit() {
  playerHand.push(dealCard());
  updateUI();

  if (calculateHandValue(playerHand) > 21) {
    document.getElementById("message").innerHTML = "Dealer win!";
    document.getElementById(
      "bet-display"
    ).textContent = `${playerName} lose ${+betAmount}$`;
    disableGameButtons();
    document.getElementById("deal-button").disabled = false;
  } else if (calculateHandValue(playerHand) === 21) {
    stand();
  }
}

//The end of a game, dealer will start pulling cards,player can lose/win, updates current and local best score
function stand() {
  disableGameButtons();
  animateDealer();

  function animateDealer() {
    if (calculateHandValue(dealerHand) < 17) {
      dealerHand.push(dealCard());
      updateUI();
      setTimeout(animateDealer, 1000);
    } else {
      const playerScore = calculateHandValue(playerHand);
      const dealerScore = calculateHandValue(dealerHand);
      document.getElementById("deal-button").disabled = false;
      const messageHTML = document.getElementById("message");
      const betDisplayHTML = document.getElementById("bet-display");

      if (dealerScore != 21 && playerScore == 21 && playerHand.length == 2) {
        messageHTML.innerHTML = "Blackjack!!!";
        betDisplayHTML.textContent = `${playerName} win ${betAmount * 2.5}$`;
        playerMoney += betAmount * 2.5;
      } else if (dealerScore > 21 || dealerScore < playerScore) {
        messageHTML.innerHTML = "You win!";
        betDisplayHTML.textContent = `${playerName} win ${betAmount * 2}$`;
        playerMoney += betAmount * 2;
      } else if (dealerScore > playerScore) {
        messageHTML.innerHTML = "Dealer win!";
        betDisplayHTML.textContent = `${playerName} lose ${+betAmount}$`;
      } else {
        messageHTML.innerHTML = "It's a tie!";
        betDisplayHTML.textContent = `${playerName} gain back ${+betAmount}$`;
        playerMoney += +betAmount;
      }

      if (playerMoney > sessionTopScore) {
        sessionTopScore = playerMoney;

        if (sessionTopScore > localTop.score) {
          localTop = { player: playerName, score: sessionTopScore };
          localStorage.setItem("localTop", JSON.stringify(localTop));
          updateLocalTop();
        }
      }
    }
  }
}

//An array to remember which cards had animation
let dealtCards = [];

//Creation of a card by it's value and suit
function createCardElement(card, container) {
  const topNumber = document.createElement("div");
  topNumber.classList.add("number");
  topNumber.textContent = card.value;

  const topSuit = document.createElement("div");
  topSuit.classList.add("suit");
  topSuit.textContent = card.suit;

  const middleSuit = document.createElement("div");
  middleSuit.classList.add("middle-suit");
  middleSuit.textContent = card.suit;

  const bottomNumber = document.createElement("div");
  bottomNumber.classList.add("number");
  bottomNumber.textContent = card.value;

  const bottomSuit = document.createElement("div");
  bottomSuit.classList.add("suit");
  bottomSuit.textContent = card.suit;

  const topSection = document.createElement("div");
  topSection.classList.add("top-left");

  const bottomSection = document.createElement("div");
  bottomSection.classList.add("bottom-right");

  const cardElement = document.createElement("div");
  cardElement.classList.add("card", getColorBySuit(card.suit));

  topSection.appendChild(topNumber);
  topSection.appendChild(topSuit);
  bottomSection.appendChild(bottomNumber);
  bottomSection.appendChild(bottomSuit);

  cardElement.appendChild(topSection);
  cardElement.appendChild(middleSuit);
  cardElement.appendChild(bottomSection);

  if (!dealtCards.includes(card)) {
    cardElement.classList.add("deal-animation");
    dealtCards.push(card);
  }

  container.appendChild(cardElement);
}

//Set card color
function getColorBySuit(suit) {
  if (suit == "♥" || suit == "♦") {
    return "red";
  } else {
    return "black";
  }
}

//Update Table UI
function updateUI() {
  const playerCardsElement = document.getElementById("player-cards");
  const dealerCardsElement = document.getElementById("dealer-cards");
  const playerHandElement = document.getElementById("player-hand");
  const dealerHandElement = document.getElementById("dealer-hand");
  const playerMoneyElement = document.getElementById("player-money");

  playerCardsElement.innerHTML = "";
  dealerCardsElement.innerHTML = "";

  for (const card of playerHand) {
    createCardElement(card, playerCardsElement);
  }

  for (const card of dealerHand) {
    createCardElement(card, dealerCardsElement);
  }
  playerHandElement.textContent = `${playerName}'s hand: ${calculateHandValue(
    playerHand
  )}`;
  dealerHandElement.textContent = `Dealer's hand: ${calculateHandValue(
    dealerHand
  )}`;
  playerMoneyElement.textContent = `${playerName}'s money: $${playerMoney}`;
}

//Events Listeners
document.getElementById("play-button").addEventListener("click", () => {
  setPlayerName();
  moveLeader();
  startGame();
});
document.getElementById("hit-button").addEventListener("click", hit);
document.getElementById("stand-button").addEventListener("click", stand);
document.getElementById("bet-button").addEventListener("click", dealTable);
document.getElementById("deal-button").addEventListener("click", startGame);
document.getElementById("bet-amount").addEventListener("input", isValidBet);
document
  .getElementById("restart-button")
  .addEventListener("click", restartGame);

//Modal of the rules
let modal = document.getElementById("rulesModal");
let openRulesBtn = document.getElementById("rules");
let closeRulesBtn = document.getElementById("close");

openRulesBtn.onclick = function () {
  modal.style.display = "block";
};

closeRulesBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
