import { networks, payments } from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';


const privateKey = 'KzkKbAiZLzfJubQBqsVGRACVA558yzsT58sf7eHyack2LmhXvgo1';
// const privateKey = 'cVYL4KgRBy93TuHd7NXcUytnos3sip2WqEjBHQyPAA9oKW914WM6';
// Import wallet via private key in WIF format
const keyPair = ECPairFactory(ecc).fromWIF(privateKey);

const pubkey = keyPair.publicKey;

const { address } = payments.p2pkh({ pubkey, network: networks.bitcoin });

const { address: p2wpkhAddress } = payments.p2wpkh({ pubkey, network: networks.bitcoin });

console.debug('Address:', address);
console.debug('P2WPKH Address:', p2wpkhAddress);
console.debug('Public key:', pubkey.toString('hex'));
console.debug('Private key:', privateKey);