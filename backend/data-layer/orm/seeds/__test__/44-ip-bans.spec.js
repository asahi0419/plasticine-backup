import { keyBy } from 'lodash-es';

const model = db.getModel('ip_ban');

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
});

describe('Model: IP Ban', () => {
  describe('Fields', () => {
    describe('IP', () => {
      it('Should have type [string]', () => expect(t.fields['ip'].type).toEqual('string'));
      it('Should have index [none]', () => expect(t.fields['ip'].index).toEqual('none'));
      it('Should be required', () => expect(t.fields['ip'].required_when_script).toEqual('true'));
    });

    describe('Attempts', () => {
      it('Should have type [integer]', () => expect(t.fields['attempts'].type).toEqual('integer'));
      it('Should be required', () => expect(t.fields['attempts'].required_when_script).toEqual('true'));
    });

    describe('Ban till', () => {
      it('Should have type [datetime]', () => expect(t.fields['ban_till'].type).toEqual('datetime'));
    });

    describe('Ban level', () => {
      it('Should have type [array_string]', () => expect(t.fields['ban_level'].type).toEqual('array_string'));
      it('Should have options', () => expect(t.fields['ban_level'].options).toEqual(JSON.stringify({ values: { '0': 'None', '1': '1 min', '2': '3 min', '3': '10 min', '4': '60 min', '5': '360 min' }, length: 2048 })));
      it('Should be required', () => expect(t.fields['ban_level'].required_when_script).toEqual('true'));
    });

    describe('Reason', () => {
      it('Should have type [string]', () => expect(t.fields['reason'].type).toEqual('string'));
      it('Should have options', () => expect(t.fields['reason'].options).toEqual(JSON.stringify({ length: 1024, rows: 3 })));
    });
  });
});
