import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const NETWORK = bitcoin.networks.testnet;
const RPC_URL = 'https://go.getblock.io/4512aab0372b4250ad9a033701d687d4';

const privateKeyWIF = 'cVYL4KgRBy93TuHd7NXcUytnos3sip2WqEjBHQyPAA9oKW914WM6';
const inputTxId = '615c131bd0959c656a370d3e526248f94b9eca1de91847d190c0fc6426537c3a';
const inputVout = 34;
const inputAmount = 10000;
const toAddress = 'tb1qp5xz0k73l2ctmnpfvvwz6g692zqa2wcfyr2v90';

const ECPair = ECPairFactory(ecc);

async function sendP2WSHTransaction() {
    const keyPair = ECPair.fromWIF(privateKeyWIF, NETWORK);

    const customScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        bitcoin.crypto.hash160(keyPair.publicKey),
        bitcoin.opcodes.OP_EQUALVERIFY,
        bitcoin.opcodes.OP_CHECKSIG,
    ]);


    const p2wsh = bitcoin.payments.p2wsh({
        redeem: { output: customScript, network: NETWORK },
        network: NETWORK,
    });

    const psbt = new bitcoin.Psbt({ network: NETWORK });

    psbt.addInput({
        hash: inputTxId,
        index: inputVout,
        witnessUtxo: {
            script: p2wsh.output!,
            value: inputAmount,
        },
        witnessScript: customScript,
    });

    const fee = 1000;
    const outputAmount = inputAmount - fee;

    psbt.addOutput({
        address: toAddress,
        value: outputAmount,
    });

    psbt.signInput(0, keyPair);

    const validator = (pubkey: Buffer, msghash: Buffer, signature: Buffer): boolean =>
        ECPair.fromPublicKey(pubkey).verify(msghash, signature);

    if (!psbt.validateSignaturesOfInput(0, validator)) {
        throw new Error('Sign validator failed');
    }

    psbt.finalizeAllInputs();


    const txHex = psbt.extractTransaction().toHex();
    console.log('txHex:', txHex);

    await sendRawTransaction(txHex);
}

async function sendRawTransaction(txHex: string) {
    try {
        const response = await axios.post(
            RPC_URL,
            {
                jsonrpc: '1.0',
                id: 'sendRawTransaction',
                method: 'sendrawtransaction',
                params: [txHex],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('tx ID:', response.data.result);
    } catch (error) {
        console.error('error:', error.response ? error.response.data : error.message);
    }
}

sendP2WSHTransaction();