import request from './request';
export async function getAddressUtxos(address: string, cursor = 0, size = 16) {
    try {
        const response = await request<any>({
            url: `/indexer/address/${address}/utxo-data`,
            method: 'GET',
            params: {cursor, size}
        });
        return response.data.utxo;
    } catch (error) {
        console.error("Error fetching UTXOs:", error);
    }
}


export async function getTransactionHex(txId) {
    const response = await fetch(`https://blockstream.info/testnet/api/tx/${txId}/hex`);
    const txHex = await response.text();
    return txHex;
}
// export async function getTransactionHex(txHash: string) {
//     const url = `https://blockstream.info/testnet/api/tx/${txHash}/hex`;
//     const res = await fetch(url)
//     return await res.json();
// }