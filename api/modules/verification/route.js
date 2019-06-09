const { ControllerFactory } = require('simple-node-framework');
const { route } = require('simple-node-framework').Singleton;
const server = require('../../../index.js');
const Controller = require('./controller');
const { validateSend, validateCheck } = require('./middleware/validation-middleware');

// retreive route information
// ex: { baseRoute: '/api', module: 'verification', full: '/api/verification' }
const { full } = route.info(__filename);

server.post(`${full}`, validateSend, ControllerFactory.build(Controller, 'send'));

server.get(`${full}/check`, validateCheck, ControllerFactory.build(Controller, 'check'));
