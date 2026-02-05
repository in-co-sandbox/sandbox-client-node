/**
 * Custom exception class for Sandbox API errors.
 */
export class SandboxException extends Error {
    /** The error code. */
    private code: number;

    /** The transaction ID. */
    private transactionId?: string;

    /** The timestamp. */
    private timestamp?: number;

    /** The error object. */
    private error?: Record<string, any>;

    /**
     * Creates a new SandboxException.
     *
     * @param message - The error message
     */
    constructor(message: string);

    /**
     * Creates a new SandboxException.
     *
     * @param message - The error message
     * @param code - The error code
     */
    constructor(message: string, code: number);

    /**
     * Creates a new SandboxException.
     *
     * @param message - The error message
     * @param code - The error code
     * @param transactionId - The transaction ID
     * @param timestamp - The timestamp
     */
    constructor(message: string, code: number, transactionId: string, timestamp: number);

    /**
     * Implementation of the constructor with all possible parameters.
     */
    constructor(message: string, code?: number, transactionId?: string, timestamp?: number) {
        super(message);
        this.name = 'SandboxException';
        this.code = code || 0;
        this.transactionId = transactionId;
        this.timestamp = timestamp;

        // Log the error
        console.error(message);
    }

    /**
     * Gets the error code.
     *
     * @returns The error code
     */
    getCode(): number {
        return this.code;
    }

    /**
     * Gets the transaction ID.
     *
     * @returns The transaction ID
     */
    getTransactionId(): string | undefined {
        return this.transactionId;
    }

    /**
     * Gets the timestamp.
     *
     * @returns The timestamp
     */
    getTimestamp(): number | undefined {
        return this.timestamp;
    }

    /**
     * Gets the error object.
     *
     * @returns The error object
     */
    getError(): Record<string, any> | undefined {
        return this.error;
    }

    /**
     * Sets the error object.
     *
     * @param error - The error object
     */
    setError(error: Record<string, any>): void {
        this.error = error;
    }
}
