import { Entity } from './Entity';

/**
 * Class representing an API response.
 */
export class ApiResponse extends Entity {
    protected static readonly TIMESTAMP_KEY = 'timestamp';

    protected static readonly DATA_KEY = 'data';

    protected static readonly CODE_KEY = 'code';

    protected static readonly MESSAGE_KEY = 'message';

    protected static readonly TRANSACTION_ID_KEY = 'transaction_id';

    /**
     * Gets the data from the response.
     *
     * @returns The response data
     */
    public getData(): any {
        return this.get(ApiResponse.DATA_KEY);
    }

    /**
     * Gets the timestamp from the response.
     *
     * @returns The timestamp as a Date object or undefined if not present
     */
    public getTimestamp(): Date | undefined {
        const timestamp = this.get(ApiResponse.TIMESTAMP_KEY);
        if (timestamp) {
            return new Date(timestamp);
        }
        return undefined;
    }

    /**
     * Gets the response code.
     *
     * @returns The response code
     */
    public getCode(): number {
        return this.get(ApiResponse.CODE_KEY);
    }

    /**
     * Gets the response message.
     *
     * @returns The response message
     */
    public getMessage(): string {
        return this.get(ApiResponse.MESSAGE_KEY);
    }

    /**
     * Gets the transaction ID.
     *
     * @returns The transaction ID
     */
    public getTransactionId(): string {
        return this.get(ApiResponse.TRANSACTION_ID_KEY);
    }

    /**
     * Checks if the response has an error.
     *
     * @returns True if the response has an error, false otherwise
     */
    public hasError(): boolean {
        return this.getCode() !== 200;
    }
}
