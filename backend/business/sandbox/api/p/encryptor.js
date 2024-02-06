import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

const LENGTH_OF_BYTES =48

class Encryptor {
  encrypt(string) {
    const cipher = crypto.createCipher(ALGORITHM, process.env.APP_SECRET);
    let crypted = cipher.update(string, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }

  decrypt(cipher) {
    const decipher = crypto.createDecipher(ALGORITHM, process.env.APP_SECRET);
    let dec = decipher.update(cipher, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  randomBytes() {
    return crypto.randomBytes(LENGTH_OF_BYTES).toString('hex');
  }
}

export default () => new Encryptor();
