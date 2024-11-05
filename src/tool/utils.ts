import axios from "axios";
const RPC_URL = "https://go.getblock.io/4512aab0372b4250ad9a033701d687d4";

export async function listUnspent(address: string) {
    try {
        const response = await axios.post(RPC_URL, {
            jsonrpc: '1.0',
            id: 'listunspent',
            method: 'listunspent',
            params: [0, 9999999, [address]],
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('UTXO:', response.data.result);
    } catch (error) {
        console.log("error", error)
        console.error('Get UXTO Error:', error.response ? error.response.data : error.message);
    }
}

export async function getAddressBalance(address: string) {
    try {
      const response = await axios.post(RPC_URL, {
        jsonrpc: '1.0',
        id: 'listunspent',
        method: 'listunspent',
        params: [1, 999, [address]],
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("response", response)
      const utxos = response.data.result;
  
      const balance = utxos.reduce((acc: number, utxo: any) => acc + utxo.amount, 0);
  
      console.log(`Address ${address} Balance:`, balance, 'BTC');
      return balance;
    } catch (error) {
     console.log("error",error)
      console.error('Get Balance Error:', error.response ? error.response.data : error.message);
      return 0;
    }
  }