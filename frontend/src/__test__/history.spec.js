import history from '../history';

history.state = {
  app: { settings: { start_url: '/pages/login' } },
  metadata: { app: {
    model: [
      { id: 1, alias: 'model' },
      { id: 2, alias: 'field' },
    ],
    view: [
      { model: 1, alias: '1', order: 1, type: 'grid' },
      { model: 1, alias: '3', order: 3, type: 'grid' },
      { model: 1, alias: '2', order: 2, type: 'grid' },
    ],
  } }
};

describe('History', () => {
  describe('onChange(location)', () => {
    it('Should create correct entry', () => {
      history.deleteEntry('/');
      history.onChange({ pathname: '/model/view/grid/default' });

      const result = history.entries;
      const expected = { pathname: '/model/view/grid/default' };

      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject(expected);

      history.deleteEntry('/model/view/grid/default');
    });
    it('Should delete intermediate entries', () => {
      history.onChange({ pathname: '/model/view/grid/default' });
      history.onChange({ pathname: '/field/view/grid/default' });
      history.onChange({ pathname: '/model/view/grid/default' });

      const result = history.entries;
      const expected = { pathname: '/model/view/grid/default' };

      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject(expected);

      history.deleteEntry('/model/view/grid/default');
      history.deleteEntry('/field/view/grid/default');
      history.deleteEntry('/model/view/grid/default');
    });
  });
  describe('goBack(options)', () => {
    it('[view] -> [form] -> [view]', () => {
      history.onChange({ pathname: '/model/view/grid/default' });
      history.onChange({ pathname: '/model/form/1' });
      history.onChange({ pathname: '/model/form/2' });
      history.goBack();

      const result = history.entries;
      const expected = { pathname: '/model/view/grid/default' };

      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject(expected);

      history.deleteEntry('/model/view/grid/default');
    });
    it('[view] -> [form] -> [view] (form new record)', () => {
      history.onChange({ pathname: '/model/view/grid/default' });
      history.onChange({ pathname: '/model/form/new' });
      history.goBack();

      const result = history.entries;
      const expected = { pathname: '/model/view/grid/default' };

      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject(expected);

      history.deleteEntry('/model/view/grid/default');
    });
    it('[view] -> [form] -> [form] (form child to form parent)', () => {
      history.onChange({ pathname: '/model/view/grid/default' });
      history.onChange({ pathname: '/model/form/1' });
      history.onChange({ pathname: '/model/form/2' });
      history.onChange({ pathname: '/field/form/1' });
      history.onChange({ pathname: '/field/form/2' });
      history.goBack();

      const result = history.entries;
      const expected = { pathname: '/model/form/2' };

      expect(result.length).toEqual(3);
      expect(result[2]).toMatchObject(expected);

      history.deleteEntry('/model/form/2');
      history.deleteEntry('/model/form/1');
      history.deleteEntry('/model/view/grid/default');
    });
    it('[view] -> [form] -> [form] -> [view] (form child to form parent)', () => {
      history.onChange({ pathname: '/model/view/grid/default' });
      history.onChange({ pathname: '/model/form/1' });
      history.onChange({ pathname: '/model/form/2' });
      history.onChange({ pathname: '/field/form/1' });
      history.onChange({ pathname: '/field/form/2' });
      history.goBack();
      history.goBack();

      const result = history.entries;
      const expected = { pathname: '/model/view/grid/default' };

      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject(expected);

      history.deleteEntry('/model/view/grid/default');
    });
    it('[form] -> [view] (first available view by order)', () => {
      history.onChange({ pathname: '/model/form/1' });
      history.goBack();

      const result = history.entries;
      const expected = { pathname: '/model/view/grid/3' };

      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject(expected);

      history.deleteEntry('/model/view/grid/3');
    });
    it('[form] -> [view] (first available view in models)', () => {
      history.onChange({ pathname: '/field/form/1' });
      history.goBack();

      const result = history.entries;
      const expected = { pathname: '/model/view/grid/3' };

      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject(expected);

      history.deleteEntry('/model/view/grid/3');
    });
    it('[form] -> [view]  (first available view by order from form new record)', () => {
      history.onChange({ pathname: '/model/form/new' });
      history.goBack();

      const result = history.entries;
      const expected = { pathname: '/model/view/grid/3' };

      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject(expected);

      history.deleteEntry('/model/view/grid/3');
    });
    it('[form] -> [form] -> [form] (form parent to form child remove record to form parent)', () => {
      history.onChange({ pathname: '/model/form/1' });
      history.onChange({ pathname: '/field/form/1' });
      history.goBack({ removed_record: { modelAlias: 'field', record: '1' } });

      const result = history.entries;
      const expected = [{ pathname: '/model/view/grid/3' }, { pathname: '/model/form/1' }];

      expect(result.length).toEqual(2);
      expect(result[0]).toMatchObject(expected[0]);
      expect(result[1]).toMatchObject(expected[1]);

      history.deleteEntry('/model/form/1');
    });
  });
});
