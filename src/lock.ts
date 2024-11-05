import * as bitcoin from 'bitcoinjs-lib';
// import * as bip32 from 'bip32';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as rpcUnisats from "./utils/rpcUnisats";
bitcoin.initEccLib(ecc);

import { broadcastTransaction, sendRawTransaction } from './utils/sendTransaction';
// staker
// Address: n11dm7iTvso2Hr6zpXMNNbUgvia8dnfYJT
// P2WPKH Address: tb1q6ht0khzvmdf37r59nvm3l679zuta3nsymvmqmd
// Public key: 0228168d2c63be9fbc1305adcf691601a41861f499c4e876de45e567741936e174
// Private key: cVYL4KgRBy93TuHd7NXcUytnos3sip2WqEjBHQyPAA9oKW914WM6

const lockToP2WSH = async (p2wshAddress: string, amount: number) => {
    const ECPair = ECPairFactory(ecc);
    const testnet = bitcoin.networks.testnet;

    const wif = "cVYL4KgRBy93TuHd7NXcUytnos3sip2WqEjBHQyPAA9oKW914WM6";

    const keyPair = ECPair.fromWIF(wif, testnet);
    // const customScript = bitcoin.script.compile([
    //     bitcoin.opcodes.OP_HASH160,
    //     bitcoin.crypto.hash160(Buffer.from('my_custom_data')),
    //     bitcoin.opcodes.OP_EQUAL
    // ]);
    // TODO test script
    const customScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_ADD,
        bitcoin.script.number.encode(11),
        bitcoin.opcodes.OP_EQUAL
    ]);
    // const customDataHash = bitcoin.crypto.hash160(Buffer.from('my_custom_data'));

    // const customScript = bitcoin.script.compile([
    //     bitcoin.opcodes.OP_DUP,
    //     bitcoin.opcodes.OP_HASH160,
    //     bitcoin.crypto.hash160(keyPair.publicKey),
    //     bitcoin.opcodes.OP_EQUALVERIFY,
    //     bitcoin.opcodes.OP_HASH160,
    //     customDataHash,                            
    //     bitcoin.opcodes.OP_EQUAL                    
    // ]);


    const p2wsh = bitcoin.payments.p2wsh({
        redeem: { output: customScript, network: testnet },
        network: testnet,
    });
    console.log("p2wsh.address", p2wsh.address)

    const psbt = new bitcoin.Psbt({ network: testnet });
    const fee = 100000;
    const utxos = await rpcUnisats.getAddressUtxos(p2wshAddress);
    console.log("utxos", utxos)
    let inputAmount = 0;
    for (const utxo of utxos) {
        psbt.addInput({
            hash: utxo.txid,      // UTXO的txid
            index: utxo.vout,
            witnessUtxo: { 
                script: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: testnet }).output!, 
                value: utxo.satoshi
            }
        });
        inputAmount += utxo.satoshi;
        if (inputAmount >= fee + amount) {
            break;
        }
    }

    psbt.addOutput({
        address: p2wsh.address!,
        value: amount
    });
    const changeAmount = inputAmount - amount - fee;

    if (changeAmount < 0) {
        console.log('btcBridge::sentOutgoingBTC Not enough funds to cover the transaction');
        return;
    }
    if (changeAmount > 0) {
        psbt.addOutput({ address: p2wshAddress, value: changeAmount });
    }

    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();

    const txHex = psbt.extractTransaction().toHex();
    console.log('Lock Transaction Hex:', txHex);

    await sendRawTransaction(txHex);
};

lockToP2WSH("tb1q6ht0khzvmdf37r59nvm3l679zuta3nsymvmqmd", 100000);

