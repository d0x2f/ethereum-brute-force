# Ethereum Random Private Key Brute Force Searcher

This small project will continuously generate random ethereum private keys and log any that have a balance on the ethereum mainnet.

In other words, this project will stress test your CPU and not find any ethereum.

## To Run

You must have a fully synchronised geth node for this script to run against.

It should preferably be running on localhost to reduce latency as much as possible.

It will be very slow running against a `--syncmode light` node to the point where it could be faster refreshing the page at https://keys.lol.

To install dependencies run:

```sh
$ npm install
```

And to start the script run:

```sh
$ npm start
```

You'll see output like the following:

```sh
$ node main.js
Checked: 722 @ 722/s, Found: 0
Checked: 1562 @ 840/s, Found: 0
Checked: 2422 @ 860/s, Found: 0
Checked: 3342 @ 920/s, Found: 0
Checked: 4262 @ 920/s, Found: 0
Checked: 5192 @ 930/s, Found: 0
Checked: 6142 @ 950/s, Found: 0
```

If any accounts with balance are found (they won't be), you can see them logged the 'wallets' file:

```
$ cat wallets
cat: wallets: No such file or directory
```

## Indicative Performance

When I run this on my PC (i7-6700K), I get a check rate of around 1500/s.

On an n2-standard-4 GCP instance I see ~1000/s.

I haven't tried but you may be able to run multiple instances of the process to improve the check rate since nodejs is single threaded.
