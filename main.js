const { writeFile } = require("fs").promises;
const Web3 = require("web3");
const { randomBytes } = require("crypto");
const Queue = require("queue-promise");

const CONCURRENCY = 40;

async function recordFind(key, account, balance) {
  writeFile(
    "wallets",
    `Key: ${key}, Address: ${account.address}, Balance: ${balance} gwei\n`,
    { flag: "a" }
  );
}

async function checkRandomKey(web3) {
  // Generate a random 32 byte key
  const key = "0x" + randomBytes(32).toString("hex");

  // Fetch the corresponding account
  const account = web3.eth.accounts.privateKeyToAccount(key);

  // Check it's balance
  const balance = await web3.eth.getBalance(account.address);

  // If it has a balance, record it
  if (balance > 0) {
    await recordFind(key, account, balance);
    return true;
  }
  return false;
}

async function main() {
  // Connects to geth on localhost via websocket
  // (start geth with `--ws --ws.api eth,net,web3`)
  const web3 = new Web3("ws://localhost:8546");

  let total = 0;
  let checked = 0;
  let found = 0;

  const queue = new Queue({
    concurrent: CONCURRENCY,
    interval: 0,
    start: true,
  });

  // Print the test rate each second
  const timer = setInterval(() => {
    total += checked;
    console.error(`Checked: ${total} @ ${checked}/s, Found: ${found}`);
    checked = 0;
  }, 1000);

  const exit = () => {
    clearInterval(timer);
    web3.currentProvider.disconnect();
    process.exit();
  };

  process.on("SIGINT", exit);
  queue.on("stop", exit);

  // When a job is completed, start another one
  queue.on("resolve", (hasBalance) => {
    checked++;
    if (hasBalance) {
      found++;
    }
    queue.enqueue(() => checkRandomKey(web3));
  });

  // When a job fails, log it and quit.
  queue.on("reject", (error) => {
    console.error(error);
    exit();
  });

  // Enqueue initial jobs
  for (i = 0; i < CONCURRENCY; i++) {
    queue.enqueue(() => checkRandomKey(web3));
  }
}

main();
