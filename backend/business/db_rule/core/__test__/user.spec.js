const { record, randomNumber, email } = h;
const { manager } = record;

describe('DB Rule: User', () => {
  describe('validateEmail', () => {
    it('Should validate email uniqueness', async () => {
      const email = 'test@gmail.com';
      const password = '1234567890';

      const account = { email, password, status: 'active' };

      const user = await manager('user').create({ email, account });
      await expect(manager('user').create({ email, account })).rejects.toMatchObject({ description: 'static.field_must_be_unique' });
    });
  });

  describe('validatePassword', () => {
    it('Should validate min password length', async () => {
      const password = '1234';
      const user = manager('user').create({ password });

      await expect(user).rejects.toMatchObject({ description: 'static.min_password_length' });
    });
    it('Should validate max password length', async () => {
      const password = '123456789123456789123456789123456789';
      const user = manager('user').create({ password });

      await expect(user).rejects.toMatchObject({ description: 'static.max_password_length' });
    });
  });
});
