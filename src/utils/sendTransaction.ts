import axios from "axios";
import { RPC_URL } from "./config";

export async function sendRawTransaction(txHex: string) {
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
        console.log('Transaction ID', response.data.result);
    } catch (error) {
        console.error('SBroadcast Error:', error.response ? error.response.data : error.message);
    }
}

export async function broadcastTransaction(txHex: string) {
    try {
        const response = await axios.post('https://api.blockcypher.com/v1/btc/test3/txs/push', {
            tx: txHex,
        });
        console.log('Transaction ID:', response.data.tx.hash);
    } catch (error) {
        console.error('Broadcast Error:', error.response ? error.response.data : error.message);
    }
}