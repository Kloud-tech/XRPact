declare module 'xrpl-connect' {
    export class WalletManager {
        constructor(config?: any);
        on(event: string, handler: (data?: any) => void): void;
        off(event: string, handler: (data?: any) => void): void;
        connected?: boolean;
        account?: any;
        wallet?: any;
    }

    export class WalletConnectorElement extends HTMLElement {
        setWalletManager(manager: WalletManager): void;
    }

    export class GemWalletAdapter {
        constructor(config?: any);
    }

    export class CrossmarkAdapter {
        constructor(config?: any);
    }

    export class XamanAdapter {
        constructor(config?: any);
    }

    export class WalletConnectAdapter {
        constructor(config?: any);
    }

    export function defineCustomElements(): void;
}
