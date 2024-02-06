import expressionVisitor from '../expression.js';

describe('Filter', () => {
  describe('Processor', () => {
    describe('Visitors', () => {
      describe('expressionVisitor', () => {
        it('Should throw error if node is not valid', async () => {
          const node = { left: { column: 'alias' }, right: { value: 'ERROR_FILTER_DEPENDS_ON' } };
          const context = { sandbox };

          await expect(expressionVisitor(node, context)).rejects.toMatchObject({ description: 'static.filter_error_depends_on' });
        });
      });
    });
  });
});
