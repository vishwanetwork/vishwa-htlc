import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
import BIP32Factory, { BIP32Interface } from 'bip32';
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
bitcoin.initEccLib(ecc);

async function generateP2TRAddress() {
    bitcoin.initEccLib(ecc);
    const network = bitcoin.networks.testnet;
    // From address
    const mnemonic =
        'melt pudding grid secret top differ annual solid laptop estate decrease wisdom';
    // To Address
    // const mnemonic =
    //     'breeze word journey train doll multiply thing escape road prefer favorite donor';
    const path = `m/86'/0'/0'/0/0`;
    const bip32 = BIP32Factory(ecc);
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const rootKey = bip32.fromSeed(seed);
    const childNode = rootKey.derivePath(path);
    // Since internalKey is an xOnly pubkey, we drop the DER header byte
    const childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
    const privateKey = childNode.privateKey;
    const { address, output } = bitcoin.payments.p2tr({
        internalPubkey: childNodeXOnlyPubkey,
        network
    });
    // console.log("address", address)
    // console.log("PublicKey", childNode.publicKey.toString('hex'));
    // console.log("privateKey", privateKey?.toString('hex'))
    console.log({
        address: address,
        publicKey: childNode.publicKey.toString('hex'),
        privateKey: privateKey?.toString('hex')
    })
}

generateP2TRAddress();
