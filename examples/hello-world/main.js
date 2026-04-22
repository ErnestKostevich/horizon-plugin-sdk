'use strict';

module.exports = {
  async greet({ who }, ctx) {
    ctx.logger.info('greet called', { who });
    return { message: `Hello, ${who}! Welcome to Horizon.` };
  }
};
