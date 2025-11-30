declare namespace JSX {
    interface IntrinsicElements {
        'xrpl-wallet-connector': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            ref?: any;
            id?: string;
            style?: any;
            'primary-wallet'?: string;
        };
    }
}
