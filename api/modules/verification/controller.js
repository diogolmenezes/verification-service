const { BaseController } = require('simple-node-framework').Base;
const VerificationService = require('./service/verification-service');

class VerificationController extends BaseController {
    constructor() {
        super({
            module: 'Verification Controller'
        });
        this.verificationService = new VerificationService();
    }

    async send(req, res, next) {
        super.activateRequestLog(req);

        const { type, destination, ttl, destroy } = req.body;

        const logSuffix = `[${type}] [${destination}] [${ttl} minutes] [${destroy}]`;

        try {
            this.log.debug(`Trying sent verification code to ${logSuffix}`);

            await this.verificationService.addToQueue(type, destination, ttl, destroy);

            res.send(204);

            this.log.debug(`The verification code will be send to ${logSuffix}`);

            return next();
        } catch (error) {
            this.log.error(`Unexpected error on send verification code to ${logSuffix}`, error);
            res.send(500, 'Unexpected error');
            return next();
        }
    }

    async check(req, res, next) {
        super.activateRequestLog(req);

        const { type, destination, verificationCode } = req.query;

        const logSuffix = `[${verificationCode}] [${type}] [${destination}]`;

        try {
            this.log.debug(`Trying to check verification code to ${logSuffix}`);

            const checked = await this.verificationService.check(type, destination, verificationCode);

            if (checked) {
                this.log.debug(`The verification code is valid to ${logSuffix}`);
                res.send(204);
            } else {
                this.log.debug(`The verification code is not valid to ${logSuffix}`);
                res.send(401);
            }

            return next();
        } catch (error) {
            if (error.code === 'no_key_found') {
                this.log.debug(`The verification code was not found to ${logSuffix}`);
                res.send(404);
            } else {
                this.log.error(`Unexpected error on check verification code to ${logSuffix}`, error);
                res.send(500, 'Unexpected error');
            }
            return next();
        }
    }
}

module.exports = VerificationController;
