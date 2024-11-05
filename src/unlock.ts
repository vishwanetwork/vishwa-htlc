import * as bitcoin from 'bitcoinjs-lib';
// import * as bip32 from 'bip32';
// import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as rpcUnisats from "./utils/rpcUnisats";
import { witnessStackToScriptWitness } from "./utils/witness_stack_to_script_witness"
bitcoin.initEccLib(ecc);

import { broadcastTransaction, sendRawTransaction } from './utils/sendTransaction';

const unlockFromP2WSH = async (targetAddress: string, amount: number) => {
    const testnet = bitcoin.networks.testnet;

    // Create a custom script that matches the locking script
    // const customScript = bitcoin.script.compile([
    //     bitcoin.opcodes.OP_HASH160,
    //     bitcoin.crypto.hash160(Buffer.from('my_custom_data')),
    //     bitcoin.opcodes.OP_EQUAL
    // ]);
    const customScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_ADD,
        bitcoin.script.number.encode(11),
        bitcoin.opcodes.OP_EQUAL
    ]);

    // 生成 P2WSH 地址对象
    const p2wsh = bitcoin.payments.p2wsh({
        redeem: { output: customScript, network: testnet },
        network: testnet,
    });

    const p2wshAddr = p2wsh.address ?? "";
    console.log(`Address: ${p2wshAddr}`);

    // Create PSBT and add P2WSH input and P2WPKH output
    const psbt = new bitcoin.Psbt({ network: testnet });
    const fee = 500;
    const utxos = await rpcUnisats.getAddressUtxos(p2wshAddr);
    let inputAmount = 0;
    for (const utxo of utxos) {
        // console.log("utxo", utxo);
        psbt.addInput({
            hash: utxo.txid, 
            index: utxo.vout,
            witnessUtxo: {
                script: p2wsh.output!,
                value: utxo.satoshi
            },
            witnessScript: customScript
        });
        inputAmount += utxo.satoshi;
        if (inputAmount >= amount + fee) break;
    }

    psbt.addOutput({
        address: targetAddress,
        value: amount
    });
   
    // Change output, if there is any remaining amount
    const changeAmount = inputAmount - amount - fee;
    if (changeAmount > 0) {
        psbt.addOutput({
            address: p2wshAddr,
            value: changeAmount
        });
    }

    const finalizeInput = (_inputIndex: number, input: any) => {
        const redeemPayment = bitcoin.payments.p2wsh({
            redeem: {
                input: bitcoin.script.compile([
                    bitcoin.script.number.encode(3),
                    bitcoin.script.number.encode(8)
                ]),
                output: input.witnessScript
            }
        });

        const finalScriptWitness = witnessStackToScriptWitness(
            redeemPayment.witness ?? []
        );

        return {
            finalScriptSig: Buffer.from(""),
            finalScriptWitness
        }
    }

    // 自定义 finalizeInput 来添加 witness 数据
    psbt.finalizeInput(0, finalizeInput);

    // 获取交易Hex编码
    const txHex = psbt.extractTransaction().toHex();
    console.log(`Unlock Transaction Hex: ${txHex}`);

    await sendRawTransaction(txHex);
};

unlockFromP2WSH("tb1q5x0j6xuc0fkj2x6pjra8kydutj9h2p8lgyh9le", 10000);