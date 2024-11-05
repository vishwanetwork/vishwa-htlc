import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const network = bitcoin.networks.bitcoin;
const keyPair = ECPairFactory(ecc);
const keyPairInstance = keyPair.makeRandom({ network });
const { address, pubkey } = bitcoin.payments.p2pkh({ pubkey: keyPairInstance.publicKey, network });
const privateKey = keyPairInstance.toWIF();

console.debug('Address:', address);
console.debug('Public key:', pubkey!.toString('hex'));
console.debug('Private key:', privateKey);

// Address: 1LNB1xoTf9wuQdzG1dnwRC44PNkH1T4Ap3
// Public key: 03819919c7c7944e037c53c0da0743a5d610db3220c33506735698aea6c930215e
// Private key: KzkKbAiZLzfJubQBqsVGRACVA558yzsT58sf7eHyack2LmhXvgo1
