/**
 * Interface for API credentials.
 */
export interface Credentials {
    getUsername(): string;

    getPassword(): string;
}
