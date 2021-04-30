const Web3 = require("web3");
const { randomBytes } = require("crypto");
const Queue = require("queue-promise");
const CONCURRENCY = 100;

async function checkRandomKey(web3) {
  const key = '0x' + randomBytes(32).toString('hex');
  const account = web3.eth.accounts.privateKeyToAccount(key);
  const balance = await web3.eth.getBalance(account.address);
  if (balance > 0) {
    console.log(`${key} ${account.address} => ${balance}`);
  }
  return balance;
}

async function main() {
  const web3 = new Web3('ws://localhost:8546');

  let total = 0;
  let count = 0;

  const queue = new Queue({
    concurrent: CONCURRENCY,
    interval: 0,
    start: true
  });

  const timer = setInterval(
    () => {
      total += count;
      console.error(`${total} @ ${count}/s`);
      count=0;
    },
    1000
  );

  const exit = () => {
    clearInterval(timer);
    web3.currentProvider.disconnect();
    process.exit();
  };

  process.on('SIGINT', exit);
  queue.on('stop', exit);

  queue.on('resolve', balance => {
    if (balance > 0) {
      console.log('wow!');
      queue.stop();
      return;
    }
    count++;
    queue.enqueue(() => checkRandomKey(web3));
  });
  queue.on('reject', error => {
      console.error(error);
      exit();
  });

  for (i = 0; i < CONCURRENCY; i++) {
    queue.enqueue(() => checkRandomKey(web3));
  }
}

main();