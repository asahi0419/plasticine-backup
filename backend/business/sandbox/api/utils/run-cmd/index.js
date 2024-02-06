import CMDRunner from './runner.js';

export default (sandbox) => (command, options) => new CMDRunner(sandbox, options).run(command);
