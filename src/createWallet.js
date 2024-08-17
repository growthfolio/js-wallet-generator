//importing dependencies:
const bip32 = require('bip32');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');

//defining the test network:
//alter 'testnet' to 'bitcoin' for main network
const network = bitcoin.networks.testnet;

//deterministic HD wallet path:
const path = "m/44'/1'/0'/0/0";

//generating mnemonic for the seed:
let mnemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedSync(mnemonic);

//creating the root of wallet HD:
let root = bip32.fromSeed(seed, network);

//creating account - pvt key, pub key::
let account = root.derivePath(path);

let btcAddress = bitcoin.payments.p2pkh({
    pubkey: account.publicKey,
    network: network,
}).address;

console.log("wallet generated: ")
console.log("address: ", btcAddress);
console.log("private key: ", account.toWIF());
console.log("seed: ", mnemonic);