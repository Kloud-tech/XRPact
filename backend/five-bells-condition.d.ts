// Type declarations for five-bells-condition
// Project: https://github.com/interledgerjs/five-bells-condition
// Definitions by: XRPL Impact Map Team

declare module 'five-bells-condition' {
    export class PreimageSha256 {
        constructor();
        setPreimage(preimage: Buffer): void;
        getConditionBinary(): Buffer;
        serializeBinary(): Buffer;
    }

    export class Fulfillment {
        constructor();
        serializeBinary(): Buffer;
    }

    export class Condition {
        constructor();
    }
}
