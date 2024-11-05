import * as bitcoin from 'bitcoinjs-lib';
// import * as bip32 from 'bip32';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';
// import { listUnspent, getAddressBalance } from './utils';
// import axios from 'axios';

const NETWORK = bitcoin.networks.testnet;

const RPC_URL = 'https://go.getblock.io/4512aab0372b4250ad9a033701d687d4';
const bob = {
    Address: 'mhnDbNuEvBvcedntGo21apMmporxYmZ9hF',
    P2WPKHAddress: 'tb1qrrf59lhckcu3gv6ugrwnlsjud8hl5cenmgn6ux',
    publickey: '024ca0f25ba343244c9b0bff0acdf3daa245d2cf0368209eeef791447edaefee60',
    privatekey: 'cVPfP3s38aj52mxBNAk8NcWdAHTYgHRMaJJaE2vawkYnuW4i7mPZ'
}
const aliceWallet = {
    Address: 'n11dm7iTvso2Hr6zpXMNNbUgvia8dnfYJT',
    P2WPKHAddress: 'tb1q6ht0khzvmdf37r59nvm3l679zuta3nsymvmqmd',
    publickey: '0228168d2c63be9fbc1305adcf691601a41861f499c4e876de45e567741936e174',
    privatekey: 'cVYL4KgRBy93TuHd7NXcUytnos3sip2WqEjBHQyPAA9oKW914WM6'
}

// 定义发送交易函数
async function sendTransaction(toAddress: string) {
    const privateKeyWIF = 'cVYL4KgRBy93TuHd7NXcUytnos3sip2WqEjBHQyPAA9oKW914WM6';
    const inputTxId = '615c131bd0959c656a370d3e526248f94b9eca1de91847d190c0fc6426537c3a';
    const inputVout = 34;
    const inputAmount = 10000;

    const ECPair = ECPairFactory(ecc);

    const keyPair = ECPair.fromWIF(privateKeyWIF, NETWORK);

    const psbt = new bitcoin.Psbt({ network: NETWORK });
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: NETWORK });
    psbt.addInput({
        hash: inputTxId,
        index: inputVout,
        witnessUtxo: {
            script: p2wpkh.output!,
            value: inputAmount,
        },
    });

    const customScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        bitcoin.crypto.hash160(keyPair.publicKey),
        bitcoin.opcodes.OP_EQUALVERIFY,
        bitcoin.opcodes.OP_CHECKSIG,
    ]);
   

    const fee = 1000;
    const outputAmount = inputAmount - fee;

    psbt.addOutput({
        // script: customScript,
        address: toAddress!,
        value: outputAmount,
    });


    psbt.signInput(0, keyPair);
     const validator = (
        pubkey: Buffer,
        msghash: Buffer,
        signature: Buffer,
    ): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

    if (!psbt.validateSignaturesOfInput(0, validator)) {
        throw new Error('签名验证失败');
    }
    psbt.finalizeAllInputs();

    const txHex = psbt.extractTransaction().toHex();
    console.log('TxHex:', txHex);

    await sendRawTransaction(txHex);
}




async function sendRawTransaction(txHex: string) {
    try {
        const response = await axios.post(RPC_URL, {
            jsonrpc: '1.0',
            id: 'sendRawTransaction',
            method: 'sendrawtransaction',
            params: [txHex],
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('交易已广播，交易ID:', response.data.result);
    } catch (error) {
        console.error('广播错误:', error.response ? error.response.data : error.message);
    }
}

async function broadcastTransaction(txHex: string) {
    try {
        const response = await axios.post('https://api.blockcypher.com/v1/btc/test3/txs/push', {
            tx: txHex,
        });
        console.log('Transaction ID:', response.data.tx.hash);
    } catch (error) {
        console.error('Broadcast Error:', error.response ? error.response.data : error.message);
    }
}

async function getUTXO(address) {
    const payload = {
        jsonrpc: "1.0",
        id: "listunspent",
        method: "listunspent",
        params: [0, 9999999, [address]]
    };

    try {
        const response = await axios.post(RPC_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data.result;
    } catch (error) {
        console.error("Error fetching UTXO:", error.response ? error.response.data : error.message);
    }
}

// sendTransaction(bob.P2WPKHAddress)
// checkUtxo("3a7c532664fcc090d14718e91dca9e4bf94862523e0d376a659c95d01b135c61", 0)
// listUnspent("tb1q6ht0khzvmdf37r59nvm3l679zuta3nsymvmqmd");
// getAddressBalance('tb1q6ht0khzvmdf37r59nvm3l679zuta3nsymvmqmd');
// getUTXO('tb1q6ht0khzvmdf37r59nvm3l679zuta3nsymvmqmd');