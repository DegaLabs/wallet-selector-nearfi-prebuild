import { WalletModuleFactory, InjectedWallet } from "@near-wallet-selector/core";
import type { InjectedNearFi } from "./injected-nearfi";
declare global {
    interface Window {
        nearFiWallet: InjectedNearFi | undefined;
    }
}
export interface NearFiParams {
    iconUrl?: string;
}
export declare function setupNearFi({ iconUrl, }?: NearFiParams): WalletModuleFactory<InjectedWallet>;
