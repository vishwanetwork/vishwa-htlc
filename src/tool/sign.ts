import * as bitcoin from 'bitcoinjs-lib';
import { sign, verify } from 'bitcoinjs-message';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// Private key in WIF format
const privateKey = 'KzkKbAiZLzfJubQBqsVGRACVA558yzsT58sf7eHyack2LmhXvgo1';
// Import wallet via private key in WIF format
const keyPair = ECPairFactory(ecc).fromWIF(privateKey);
// Sign message
const message = 'Hello, World!';
const signature = sign(message, keyPair.privateKey!, keyPair.compressed);
console.debug('Signature:', signature.toString('base64'));
// Get address
const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoin.networks.bitcoin });
// Verify signature
const verified = verify(message, address!, signature);
console.debug('Verified: ', verified);