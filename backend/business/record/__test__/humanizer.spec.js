import moment from 'moment';

import humanize from '../humanizer/index.js';

describe('Record: Humanizer', () => {
  describe('datetime', () => {
    it('Should return correct value from stringified timestamp', () => {
      const format = 'YYYY-MM-DD HH:mm:ss';
      const field = { type: 'datetime', options: JSON.stringify({ format }) };

      const date = new Date();
      const dateTimestamp = +date;
      const dateTimestampString = `${dateTimestamp}`;

      const result = humanize(field, sandbox)(dateTimestampString);
      const expected = moment(date).format(format);

      expect(result).toEqual(expected);
    });
  });
});
