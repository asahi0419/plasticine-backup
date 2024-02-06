import encryptorNamespace from '../encryptor.js';

const encryptor = encryptorNamespace();

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('encryptor', () => {
        it('Should have proper attributes', () => {
          expect(encryptor.encrypt).toBeDefined();
          expect(encryptor.decrypt).toBeDefined();
          expect(encryptor.randomBytes).toBeDefined();
        });

        describe('encrypt(string)', () => {
          it('Should encrypt string', () => {
            const result = encryptor.encrypt('string');
            const expected = '2890e8f55f041490493a4037c567b357';

            expect(result).toEqual(expected);
          });
        });

        describe('decrypt(cipher)', () => {
          it('Should decrypt cipher', () => {
            const result = encryptor.decrypt('2890e8f55f041490493a4037c567b357');
            const expected = 'string';

            expect(result).toEqual(expected);
          });
        });

        describe('randomBytes()', () => {
          it('Should generate Random string', () => {
            const string1 = encryptor.randomBytes();
            const string2 = encryptor.randomBytes();

            expect(string1).not.toEqual(string2);
          });
        });
      });
    });
  });
});
