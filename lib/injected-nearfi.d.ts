import { providers } from "near-api-js";
interface AccessKey {
    publicKey: {
        data: Uint8Array;
        keyType: number;
    };
    secretKey: string;
}
export interface RequestSignInResponse {
    accessKey: AccessKey;
    error: string | {
        type: string;
    };
    notificationId: number;
    type: "nearfi-wallet-result";
}
export declare type SignOutResponse = true | {
    error: string | {
        type: string;
    };
};
export interface RpcInfo {
    explorerUrl: string;
    helperUrl: string;
    index: number;
    name: string;
    network: string;
    networkId: string;
    nodeUrl: string;
    walletUrl: string;
    wrapNearContract: string;
}
export interface GetRpcResponse {
    method: "getRpc";
    notificationId: number;
    rpc: RpcInfo;
    type: "nearfi-wallet-result";
}
export interface RequestSignInParams {
    contractId: string;
    methodNames?: Array<string>;
    amount?: string;
}
export interface RpcChangedResponse {
    explorerUrl: string;
    helperUrl: string;
    index: number;
    name: string;
    network: string;
    networkId: string;
    nodeUrl: string;
    walletUrl: string;
    wrapNearContract: string;
}
export interface SendMoneyParams {
    receiverId: string;
    amount: string;
}
export interface SendMoneyResponse {
    transactionHash: string;
    error?: string;
}
export interface Action {
    methodName: string;
    args: object;
    gas: string;
    deposit: string;
}
export interface SignAndSendTransactionParams {
    receiverId: string;
    actions: Array<Action>;
}
export interface SignAndSendTransactionResponse {
    actionType: "DAPP/DAPP_POPUP_RESPONSE";
    method: "signAndSendTransactions";
    notificationId: number;
    error?: string;
    response?: Array<providers.FinalExecutionOutcome>;
    type: "nearfi-wallet-extensionResult";
}
export interface SignAndSendTransactionsResponse {
    actionType: "DAPP/DAPP_POPUP_RESPONSE";
    method: "signAndSendTransactions";
    notificationId: number;
    error?: string;
    response?: Array<providers.FinalExecutionOutcome>;
    type: "nearfi-wallet-extensionResult";
}
export interface Transaction {
    receiverId: string;
    actions: Array<Action>;
}
export interface RequestSignTransactionsParams {
    transactions: Array<Transaction>;
}
export interface NearFiEvents {
    signIn: () => void;
    signOut: () => void;
    accountChanged: (changedAccountId: string) => void;
    rpcChanged: (response: RpcChangedResponse) => void;
}
export interface InjectedNearFi {
    isNearFi: boolean;
    getAccountId: () => string | null;
    getRpc: () => Promise<GetRpcResponse>;
    requestSignIn: (params: RequestSignInParams) => Promise<RequestSignInResponse>;
    signOut: () => Promise<SignOutResponse>;
    isSignedIn: () => boolean;
    removeEventListener: (event: string) => void;
    on: <Event extends keyof NearFiEvents>(event: Event, callback: NearFiEvents[Event]) => void;
    sendMoney: (params: SendMoneyParams) => Promise<SendMoneyResponse>;
    signAndSendTransaction: (params: SignAndSendTransactionParams) => Promise<SignAndSendTransactionResponse>;
    requestSignTransactions: (params: RequestSignTransactionsParams) => Promise<SignAndSendTransactionsResponse>;
    log: (...msg: Array<unknown>) => void;
    resolveSignInState: () => Promise<unknown>;
}
export {};
