import BIP32Factory from 'bip32';
import { networks, payments } from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from 'bip39';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';

const network = networks.testnet;
// const mnemonic = 'business across today injury rabbit tattoo ramp jaguar guitar wine round theory' // alice
const mnemonic = 'melt pudding grid secret top differ annual solid laptop estate decrease wisdom'; // bob
// const mnemonic = 'pelican monster security shove evoke behave person knock addict motion category moment';
const seed = bip39.mnemonicToSeedSync(mnemonic);
const root = BIP32Factory(ecc).fromSeed(seed, network);
const path = "m/84'/0'/0'/0/0";
const child = root.derivePath(path);
const keyPairInstance = ECPairFactory(ecc).fromPrivateKey(child.privateKey!, { network: network });

const { address, pubkey } = payments.p2pkh({ pubkey: keyPairInstance.publicKey, network: network });

const { address: p2wpkhAddress } = payments.p2wpkh({ pubkey: keyPairInstance.publicKey, network: network });
// const { address: p2trAddress } = payments.p2tr({ internalPubkey: toXOnly(keyPairInstance.publicKey), network: network });

console.debug('Address:', address);
console.debug('P2WPKH Address:', p2wpkhAddress);
// console.debug('P2TR Address:', p2trAddress);
console.debug('Public key:', pubkey!.toString('hex'));
console.debug('Private key:', keyPairInstance.toWIF());