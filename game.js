import readline from "readline";
import chalk from "chalk";

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

function storeInit() {
  let steps = 25;
  let showInventory = false;
  let messageQueue = [];

  return {
    increment: (value) => (steps = steps + value),
    decrement: (value) => (steps = steps - value),
    getSteps: () => steps,
    toggleInventory: () => (showInventory = !showInventory),
    inventory: () => showInventory,
    setMessage: (message) => messageQueue.push(message),
    getMessage: () => messageQueue[messageQueue.length - 1] || "",
  };
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const worldEntities = {
  1: "tree",
  2: "food",
  3: "house",
  4: "water",
  5: "player",
  6: "enemy",
  7: "chest",
  8: "key",
  9: "door",
};

function biasedRandom() {
  // Create an array with more 0s than other numbers
  const numbers = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 4, 6, 6, 6, 6, 6, 7, 7, 8, 9,
  ];

  // Select a random index from the array
  const index = Math.floor(Math.random() * numbers.length);

  // Return the number at that index
  return numbers[index];
}

function generateWorld(size = 20) {
  const world = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const randomNum = biasedRandom();
      row.push(randomNum);
    }
    world.push(row);
  }
  const randomNum = Math.floor(Math.random() * size);
  world[randomNum][randomNum] = 5;
  return world;
}

const gameGrid = generateWorld();
const worldObjectsGrid = generateWorld();

function findPlayer() {
  for (let y = 0; y < gameGrid.length; y++) {
    let x = gameGrid[y].indexOf(5);
    if (x !== -1) {
      return { x, y };
    }
  }
  return null;
}

function printGrid() {
  for (let y = 0; y < gameGrid.length; y++) {
    let row = "";
    for (let x = 0; x < gameGrid[y].length; x++) {
      if (gameGrid[y][x] === 5) {
        row += chalk.magenta.bgBlack("5") + " ";
      } else if (worldObjectsGrid[y][x] !== 0) {
        row += chalk.yellow("? ");
      } else {
        row += chalk.gray("0 ");
      }
    }
    console.log(row);
  }
}

function movePlayer(key) {
  let { x, y } = findPlayer();

  if (store.getSteps() !== 0) {
    if (key.name === "left" && x > 0) {
      gameGrid[y][x] = 0;
      gameGrid[y][x - 1] = 5;
      store.decrement(1);
    } else if (key.name === "right" && x < gameGrid[0].length - 1) {
      gameGrid[y][x] = 0;
      gameGrid[y][x + 1] = 5;
      store.decrement(1);
    } else if (key.name === "up" && y > 0) {
      gameGrid[y][x] = 0;
      gameGrid[y - 1][x] = 5;
      store.decrement(1);
    } else if (key.name === "down" && y < gameGrid.length - 1) {
      gameGrid[y][x] = 0;
      gameGrid[y + 1][x] = 5;
      store.decrement(1);
    }
  }
}

function fightEnemy() {
  let { x, y } = findPlayer();
  const key = worldObjectsGrid[y][x];
  const enemy = worldEntities[key];

  switch (key) {
    case 6:
      store.setMessage(`You are fighting a ${enemy}!`);
      if (Math.random() > 0.5) {
        store.setMessage(`You killed the ${enemy}!`);
        store.increment(generateRandomNumber(0, 5));
        worldObjectsGrid[y][x] = 0;
      } else {
        store.setMessage(`The ${enemy} damaged you!`);
        store.decrement(generateRandomNumber(0, 5));
        const steps = store.getSteps();
        if (steps <= 0) store.setMessage("\n You died from the enemy attack!");
      }
      return;
    default:
      store.setMessage("There is no enemy to fight");
      return;
  }
}

function pickUpItem() {
  let { x, y } = findPlayer();
  const key = worldObjectsGrid[y][x];
  const item = worldEntities[key];

  switch (key) {
    case 0:
      store.setMessage("Nothing to pick up");
      return;
    case 6:
      store.setMessage(
        "You can't pick up an enemy you idiot! It attacked you!"
      );
      store.decrement(2);
      return;
    default:
      store.setMessage(`You picked up ${item}!`);
      worldObjectsGrid[y][x] = 0;
      return;
  }
  // store.addInventory(worldEntity);
}

const store = storeInit();

process.stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name === "c") {
    process.exit();
  } else if (key.name === "i") {
    store.toggleInventory();
  } else if (key.name === "p") {
    pickUpItem();
  } else if (key.name === "f") {
    fightEnemy();
  } else {
    movePlayer(key);
  }
});

function printGameMessage() {
  const { x, y } = findPlayer();
  const worldEntity = worldObjectsGrid[y][x];
  console.log("\n");
  if (store.getSteps() < 0) {
    console.log(store.getMessage());
  } else if (store.getSteps() === 0) {
    console.log("You DIED from hunger and thirst! Game over!");
  } else {
    console.log("Steps: ", store.getSteps());
    console.log(`Player position: x: ${x} y: ${y}`);
    console.log("You have found : ", worldEntities[worldEntity] || "nothing");
    console.log("Message: " + store.getMessage() || "");
  }
}

setInterval(() => {
  console.clear();
  console.log("\n" + chalk.black.bgGreen("     You are not going to make it!     ") + "\n");
  printGrid();
  printGameMessage();

  if (store.inventory()) {
    console.log("Inventory: ");
  }
}, 50);
