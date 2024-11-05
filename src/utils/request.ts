import axios, { AxiosRequestConfig } from 'axios'
const HOST = process.env.REACT_APP_API_HOST || "https://open-api-testnet.unisat.io";

interface Response<T> {
    code: number
    msg: string
    data: T
}

interface RequestConfig extends AxiosRequestConfig {
    Authorization?: string;
}

const instance = axios.create({
    baseURL: `${HOST}/v1`,
    timeout: 60000,
})

const request = async <T = any>(config: RequestConfig): Promise<Response<T>> => {
    try {
        config.headers = {
            ...config.headers,
            Authorization: 'Bearer ' + 'cd14c0fb9ecb07ab42d73bcf4bf1eb7bd7eb2a4900969f8a679c7a98273279c9'
        };
        const { data } = await instance.request<Response<T>>(config);
        return data
    } catch (err) {
        console.log(err)
        return {
            code: -1,
            msg: 'fetch error',
            data: null as any,
        };
    }
};

export default request
