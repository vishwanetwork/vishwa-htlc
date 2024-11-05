import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from 'bip39';


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

async function getBalance(address: string) {
    const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`;
    const res = await fetch(url)
    return await res.json();
}

async function getUTXO(address: string) {
    const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`;
    const res = await fetch(url)
    return await res.json();
}

async function getTxDetail(txHash: string) {
    const url = `https://api.blockcypher.com/v1/btc/test3/txs/${txHash}`;
    const res = await fetch(url)
    return await res.json();
}

async function broadcastTx(tx: string) {
    const res = await fetch(
        `https://api.blockcypher.com/v1/btc/test3/txs/push`,
        {
            method: 'POST',
            body: JSON.stringify({
                tx,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return await res.json();
}

async function transfer(privateKey: string, toAddress: string, amount: number) {
    try {
        const validator = (
            pubkey: Buffer,
            msghash: Buffer,
            signature: Buffer,
        ): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

        const ECPair = ECPairFactory(ecc);
        const alice = ECPair.fromWIF(privateKey, bitcoin.networks.testnet);
        const aliacAddress = bitcoin.payments.p2wpkh({ pubkey: alice.publicKey, network: bitcoin.networks.testnet }).address;
        const utxo = await getUTXO(aliacAddress!);
        if (utxo.txrefs === null) {
            return 'No UTXO';
        }
        const utxoTarget = utxo.txrefs[0];
        const utxoHash = utxoTarget.tx_hash;
        const txDetail = await getTxDetail(utxoHash);
        console.log("utxoHash.value", txDetail)
        const scriptPubKeyHex = txDetail.outputs[0].script;
        const psbt = new bitcoin.Psbt({
            network: bitcoin.networks.testnet,
        });
        
        const fee = 10;
        psbt.addInput({
            hash: utxoHash,
            index: utxoTarget.tx_output_n,
            witnessUtxo: {
                script: Buffer.from(scriptPubKeyHex, 'hex'),
                value: utxoTarget.value,
            }
        });
        
        psbt.addOutput({
            address: toAddress,
            value: amount,
        });
        const change = utxoTarget.value - amount - fee;
        psbt.addOutput({
            address: aliacAddress!,
            value: change,
        });       
        psbt.signInput(0, alice);
        psbt.validateSignaturesOfInput(0, validator);
        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction().toHex();
        console.log("tx",tx)
        // const res = await broadcastTx(tx);
        // return res;
    }
    catch (e) {
        console.error('transfer error: ', e);
    }
}


// getBalance('tb1qrrf59lhckcu3gv6ugrwnlsjud8hl5cenmgn6ux').then(console.debug);
// getBalance('tb1qrrf59lhckcu3gv6ugrwnlsjud8hl5cenmgn6ux').then(console.debug);

getUTXO("tb1qrrf59lhckcu3gv6ugrwnlsjud8hl5cenmgn6ux").then(console.debug);

// transfer(
//     bob.privatekey,
//     aliceWallet.P2WPKHAddress,
//     100
// ).then(console.debug)
