import CryptoJS from 'crypto-js';

export interface EncryptedData {
    encrypted: string;
    iv: string;
    salt: string;
    algorithm: string;
}

export interface WrappedKey {
    encryptedKey: string;
    iv: string;
    salt: string;
}

export class EncryptionService {
    private static readonly STORAGE_KEY_WRAPPED = 'sentio_wrapped_key';
    private static readonly PBKDF2_ITERATIONS = 100000;
    private static readonly KEY_SIZE = 256;

    /**
     * Checks if a wrapped master key exists in storage.
     */
    static hasStoredKey(): boolean {
        return !!localStorage.getItem(this.STORAGE_KEY_WRAPPED);
    }

    /**
     * Generates a new random Master Key.
     */
    static generateMasterKey(): string {
        return CryptoJS.lib.WordArray.random(32).toString(); // 256 bits
    }

    /**
     * Wraps (Encrypts) the Master Key with a user password.
     * Stores the result in localStorage.
     */
    static wrapAndStoreKey(masterKey: string, password: string): void {
        const salt = CryptoJS.lib.WordArray.random(16).toString();
        const iv = CryptoJS.lib.WordArray.random(16);

        // Derive Key Encryption Key (KEK) from password
        const kek = CryptoJS.PBKDF2(password, salt, {
            keySize: this.KEY_SIZE / 32,
            iterations: this.PBKDF2_ITERATIONS,
            hasher: CryptoJS.algo.SHA256
        });

        // Encrypt the Master Key using the KEK
        const encryptedKey = CryptoJS.AES.encrypt(masterKey, kek, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const wrappedKey: WrappedKey = {
            encryptedKey: encryptedKey.toString(),
            iv: iv.toString(),
            salt: salt
        };

        localStorage.setItem(this.STORAGE_KEY_WRAPPED, JSON.stringify(wrappedKey));
    }

    /**
     * Unwraps (Decrypts) the Master Key using the user password.
     * Returns the Master Key string if successful, throws error if failed.
     */
    static unwrapKey(password: string): string {
        const stored = localStorage.getItem(this.STORAGE_KEY_WRAPPED);
        if (!stored) throw new Error("No key found");

        const wrappedKey: WrappedKey = JSON.parse(stored);

        // Re-derive KEK using the stored salt
        const kek = CryptoJS.PBKDF2(password, wrappedKey.salt, {
            keySize: this.KEY_SIZE / 32,
            iterations: this.PBKDF2_ITERATIONS,
            hasher: CryptoJS.algo.SHA256
        });

        // Decrypt the Master Key
        const decryptedBytes = CryptoJS.AES.decrypt(wrappedKey.encryptedKey, kek, {
            iv: CryptoJS.enc.Hex.parse(wrappedKey.iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const masterKey = decryptedBytes.toString(CryptoJS.enc.Utf8);

        // Verify decryption success (simple check: valid UTF8 string)
        if (!masterKey) {
            throw new Error("Invalid password");
        }

        return masterKey;
    }

    /**
     * Encrypts content using the UNWRAPPED Master Key.
     */
    static encrypt(content: string, masterKey: string): EncryptedData {
        const key = CryptoJS.enc.Hex.parse(masterKey);
        const iv = CryptoJS.lib.WordArray.random(16);

        const encrypted = CryptoJS.AES.encrypt(content, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return {
            encrypted: encrypted.toString(),
            iv: iv.toString(),
            salt: 'MASTER_KEY_ENC',
            algorithm: 'AES-256-CBC'
        };
    }

    /**
     * Decrypts content using the UNWRAPPED Master Key.
     */
    /**
     * Decrypts content using the UNWRAPPED Master Key.
     */
    static decrypt(data: EncryptedData, masterKey: string): string {
        const key = CryptoJS.enc.Hex.parse(masterKey);

        const decrypted = CryptoJS.AES.decrypt(data.encrypted, key, {
            iv: CryptoJS.enc.Hex.parse(data.iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    // --- Session Persistence (Reload Protection) ---
    private static readonly SESSION_KEY_RAW = 'sentio_session_key';

    static setSessionKey(masterKey: string): void {
        sessionStorage.setItem(this.SESSION_KEY_RAW, masterKey);
    }

    static getSessionKey(): string | null {
        return sessionStorage.getItem(this.SESSION_KEY_RAW);
    }

    static clearSessionKey(): void {
        sessionStorage.removeItem(this.SESSION_KEY_RAW);
    }
}
