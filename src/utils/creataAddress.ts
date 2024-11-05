import * as bitcoin from 'bitcoinjs-lib';
// import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
bitcoin.initEccLib(ecc);
export function createAddress(params: any): any {
    const { seedHex, receiveOrChange, addressIndex, network, method } = params
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(Buffer.from(seedHex, 'hex'));
    let path = "m/44'/0'/0'/0/" + addressIndex + '';
    if (receiveOrChange === '1') {
        path = "m/44'/0'/0'/1/" + addressIndex + '';
    }
    if (method === 'p2tr') {
        path = "m/86'/0'/0'/" + addressIndex + '';
    }
    const child = root.derivePath(path);
    let address: string = '';
    switch (method) {
        case "p2pkh":
            const p2pkhAddress = bitcoin.payments.p2pkh({
                pubkey: child.publicKey,
                network: bitcoin.networks[network]
            });
            address = p2pkhAddress.address!
            break
        case "p2wpkh":
            const p2wpkhAddress = bitcoin.payments.p2wpkh({
                pubkey: child.publicKey,
                network: bitcoin.networks[network]
            });
            address = p2wpkhAddress.address!
            break
        case "p2sh":
            const p2shAddress = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({
                    pubkey: child.publicKey,
                    network: bitcoin.networks[network]
                }),
            });
            address = p2shAddress.address!
            break
        case "p2tr":
                const p2trAddress = bitcoin.payments.p2tr({
                    redeem: bitcoin.payments.p2wpkh({
                        pubkey: child.publicKey,
                        network: bitcoin.networks[network]
                    }),
                });
                address = p2trAddress.address!
                break
        default:
            console.log("This way can not support")
    }

    return {
        address,
        privateKey: Buffer.from(child.privateKey!).toString('hex'),
        publicKey: Buffer.from(child.publicKey).toString('hex'),
    };
}