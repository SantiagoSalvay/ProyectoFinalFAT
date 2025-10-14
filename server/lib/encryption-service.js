import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY no configurado');
  }
  // Permitir hex o base64 o plain
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  if (key.length === 44 && key.endsWith('==')) {
    return Buffer.from(key, 'base64');
  }
  // Derivar a 32 bytes desde string
  return crypto.createHash('sha256').update(key).digest();
}

export function encryptSecret(plainText) {
  if (!plainText || typeof plainText !== 'string') {
    throw new Error('Texto a cifrar inválido');
  }
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipher: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

export function decryptSecret({ cipher, iv, tag }) {
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipher, 'base64')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}
