import * as bitcoin from 'bitcoinjs-lib';
// import * as bip32 from 'bip32';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
async function createTransaction(
    privateKeyWIF: string,
    previousTxid: string,
    previousHex: string,
    receiverAddress: string,
) {
    const network = bitcoin.networks.testnet;
    const ECPair = ECPairFactory(ecc);
    // Use WIF-encoded private key (privateKeyWIF) and network information  
    // Create a keyPair that we will use to sign the transaction
    const keyPair = ECPair.fromWIF(privateKeyWIF, network);

    // Create a transaction builder and pass the network. bitcoin-js  
    const txb = new bitcoin.Psbt({ network });

    // While these are the default version and lock time values, you can set
    txb.setVersion(2);
    txb.setLocktime(0);

    // Add input: previous transaction ID, output index of fund transaction
    // Since this is a non-segwit input, we must also pass the complete  
    txb.addInput({
        hash: previousTxid,
        index: 0,
        nonWitnessUtxo: Buffer.from(previousHex, 'hex'),
    });

    // Add output to the buffer as the receiver address and the number of satoshis you sent
    txb.addOutput({
        script: Buffer.from(receiverAddress, 'hex'),
        value: 10000,
    }); 

    txb.signInput(0, keyPair);
    txb.finalizeAllInputs();

    const tx = txb.extractTransaction();
    return tx.toHex();
}

createTransaction(
    'cVPfP3s38aj52mxBNAk8NcWdAHTYgHRMaJJaE2vawkYnuW4i7mPZ',
    '413f28956bb6b784c88b63661ba943920f881a3b7cb592cbc38e1ed5bea8a7b1',
    '615c131bd0959c656a370d3e526248f94b9eca1de91847d190c0fc6426537c3a',
    'tb1qp5xz0k73l2ctmnpfvvwz6g692zqa2wcfyr2v90')
    .then((transactionHex) => {
        console.log('Transaction Hex:', transactionHex);
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
