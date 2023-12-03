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

const leadingPlayerHTML = document.getElementById("leading-player");
const tableHTML = document.getElementById("table");
const menuHTML = document.getElementById("menu");
const messageHTML = document.getElementById("message");
const betAmountInput = document.getElementById("bet-amount");
const betDisplayHTML = document.getElementById("bet-display");
const betBtn = document.getElementById("bet-button");
const dealBtn = document.getElementById("deal-button");
const restartBtn = document.getElementById("restart-button");
const hitBtn = document.getElementById("hit-button");
const standBtn = document.getElementById("stand-button");
const playBtn = document.getElementById("play-button");

const playerCardsElement = document.getElementById("player-cards");
const dealerCardsElement = document.getElementById("dealer-cards");
const playerHandElement = document.getElementById("player-hand");
const dealerHandElement = document.getElementById("dealer-hand");
const playerMoneyElement = document.getElementById("player-money");

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
    leadingPlayerHTML.innerText = `Best score achieved was ${localTop.score}$ by ${localTop.player}`;
  }
}

//Will move the leader description area from menu to table
function moveLeader() {
  const leaderDescription = leadingPlayerHTML;
  tableHTML.appendChild(leaderDescription);
}

//Check if player's bet is valid (only numbers, not decimals)
function isValidBet() {
  betAmount = betAmountInput.value;
  if (
    isNaN(betAmount) ||
    betAmount <= 0 ||
    betAmount > playerMoney ||
    betAmount % 1 != 0
  ) {
    betBtn.disabled = true;
  } else {
    betBtn.disabled = false;
  }
}

//Restart the game
function restartGame() {
  playerMoney = 100;
  sessionTopScore = playerMoney;
  restartBtn.style.display = "none";
  startGame();
}

//Start a game, will reset the table before
function startGame() {
  menuHTML.style.display = "none";
  tableHTML.style.display = "block";
  betDisplayHTML.style.display = "none";
  dealBtn.style.display = "none";
  hitBtn.style.display = "none";
  standBtn.style.display = "none";

  messageHTML.innerHTML = "<br>";
  dealBtn.disabled = true;
  betBtn.disabled = true;
  betAmountInput.value = "";
  dealtCards = [];
  deck = deck.concat(playerHand, dealerHand);
  playerHand = [];
  dealerHand = [];
  updateUI();
  playerHandElement.innerHTML = "";
  dealerHandElement.innerHTML = "";
  betAmountInput.max = playerMoney;
  if (playerMoney > 1) {
    betAmountInput.style.display = "inline";
    betBtn.style.display = "inline";
    shuffleDeck();
    playerMoneyElement.innerHTML = `${playerName}'s money: ${playerMoney}$`;
  } else {
    //Game over
    messageHTML.innerHTML = `
    <p>Can't bet anymore! Game over!</p>
    <p>Your best score this game was: ${sessionTopScore}$</p>
  `;
    restartBtn.style.display = "inline";
    playerMoneyElement.innerHTML = ``;
  }
}

//Dealing Cards, open options for player
function dealTable() {
  dealBtn.style.display = "inline";
  hitBtn.style.display = "inline";
  standBtn.style.display = "inline";
  betBtn.style.display = "none";
  playerMoney -= betAmount;
  playerHand = [dealCard(), dealCard()];
  dealerHand = [dealCard()];
  hitBtn.disabled = false;
  standBtn.disabled = false;
  betBtn.disabled = true;
  betAmountInput.style.display = "none";
  betDisplayHTML.style.display = "inline";
  betDisplayHTML.textContent = `Your bet: ${Number(betAmountInput.value)}$`;
  updateUI();
  if (calculateHandValue(playerHand) === 21) {
    stand();
  }
}

//Player can only choose 'Deal' to end the match
function disableGameButtons() {
  hitBtn.disabled = true;
  standBtn.disabled = true;
}

//Player pulling a card
function hit() {
  playerHand.push(dealCard());
  updateUI();

  if (calculateHandValue(playerHand) > 21) {
    messageHTML.innerHTML = "Dealer win!";
    betDisplayHTML.textContent = `${playerName} lose ${+betAmount}$`;
    disableGameButtons();
    dealBtn.disabled = false;
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
      dealBtn.disabled = false;

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
playBtn.addEventListener("click", () => {
  setPlayerName();
  moveLeader();
  startGame();
});
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
betBtn.addEventListener("click", dealTable);
dealBtn.addEventListener("click", startGame);
betAmountInput.addEventListener("input", isValidBet);
restartBtn.addEventListener("click", restartGame);

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
