import { Credentials } from '../credential/Credentials';

/**
 * Interface for credential providers.
 */
export interface CredentialProvider<T extends Credentials> {
    /**
     * Gets the credentials.
     *
     * @returns The credentials
     */
    getCredentials(): T;

    /**
     * Sets the credentials.
     *
     * @param credentials - The credentials
     */
    setCredentials(credentials: T): void;
}
