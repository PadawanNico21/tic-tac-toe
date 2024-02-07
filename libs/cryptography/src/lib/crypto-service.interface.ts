export interface ICryptoService {
    hash(data: string): Promise<string>
    verifyHash(hash: string, data: string): Promise<boolean>

    encrypt(
        data: string,
        key: Buffer,
        iv: Buffer
    ): Promise<{ data: Buffer; tag: Buffer }>
    decrypt(data: string, key: Buffer, iv: Buffer, tag: Buffer): Promise<Buffer>
}
