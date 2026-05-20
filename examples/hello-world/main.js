'use strict';

// Sprint-3 canonical form: a single `execute(tool, args, ctx)` dispatcher.
// `ctx` provides { settings, fetch, logger, storage } — see
// @horizonai/plugin-types for the full contract.
module.exports = {
  async execute(tool, args = {}, ctx = {}) {
    if (tool === 'greet') {
      const who = (args && args.who) || 'world';
      ctx.logger && ctx.logger.info('greet called', { who });
      return { ok: true, out: `Hello, ${who}! Welcome to Horizon.` };
    }
    return { ok: false, error: `Unknown tool: ${tool}` };
  },
};
