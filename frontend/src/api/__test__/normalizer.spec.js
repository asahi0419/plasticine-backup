import normalize from '../normalizer';

describe('Api: Normalizer', () => {
  it('Should add synthetic entity id if no present', () => {
    const data = [{ type: 'model' }];
    const result = normalize({ data });

    expect(result.entities.model[1].id).toEqual(1);
  });
});
