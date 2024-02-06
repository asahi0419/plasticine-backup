import utilsNamespace from '../utils/index.js';

describe('Sandbox', () => {
  describe('Api', () => {
    describe('Utils', () => {
      it('Should return correct result', () => {
        const result = utilsNamespace(sandbox);

        expect(result.md5).toBeDefined();
        expect(result.buildDocxByTemplate).toBeDefined();
        expect(result.getNearestScope).toBeDefined();
        expect(result.getTCross).toBeDefined();
        expect(result.getTCrossByRef).toBeDefined();
        expect(result.bufferToAttachment).toBeDefined();
        expect(result.stringToAttachment).toBeDefined();
        expect(result.imageToAttachment).toBeDefined();
        expect(result.chartToAttachment).toBeDefined();
        expect(result.CSVtoJSON).toBeDefined();
        expect(result.runCMD).toBeDefined();
        expect(result.execSS).toBeDefined();
        expect(result.JSONParseSafe).toBeDefined();
      });
    });
  });
});
