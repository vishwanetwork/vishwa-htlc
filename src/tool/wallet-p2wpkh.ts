import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';

const network = bitcoin.networks.testnet;
const mnemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedSync(mnemonic);
const root = bip32.BIP32Factory(ecc).fromSeed(seed, network);

const path = "m/44'/0'/0'/0/0";
const child = root.derivePath(path);
const keyPairInstance = ECPairFactory(ecc).fromPrivateKey(child.privateKey!, { network });
const { address, pubkey } = bitcoin.payments.p2wpkh({ pubkey: keyPairInstance.publicKey, network });
const privateKey = keyPairInstance.toWIF();

console.debug('Address:', address);
console.debug('Public key:', pubkey!.toString('hex'));
console.debug('Private key:', privateKey);
console.debug('Mnemonic:', mnemonic);

// Address: tb1qp5xz0k73l2ctmnpfvvwz6g692zqa2wcfyr2v90
// Public key: 03bfc34e31d5df97cc5e9db68b41b321c01b87003ae462cc5f50e17d13c4daeeb9
// Private key: cRabqFL7MgDXAENoxmHVEo4DVYVotQDgXYGTJ4VZGcZtCeFErXNx
// Mnemonic: breeze word journey train doll multiply thing escape road prefer favorite donor
