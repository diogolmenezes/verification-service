const { BaseService } = require('simple-node-framework').Base;
const { queue, redis } = require('simple-node-framework').Singleton;
const NotificationService = require('./notification-service');

class VerificationService extends BaseService {
    constructor() {
        super({
            module: 'Verification Service'
        });

        this.queue = queue;
        this.redis = redis;
        this.queueName = 'verification-service-send';
        this.notificationService = new NotificationService();
    }

    // create the verification code and save on REDIS
    createVerificationCode(type, destination, ttl) {
        let verificationCode;

        switch (type) {
            case 'sms':
                verificationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
                break;
            case 'email':
                verificationCode = '123456poiqweopiwqopeiqwoei';
                break;
            default:
                throw new Error('The verification code type is not supported');
        }

        const key = `verification-service:${type}:${destination}`;

        this.redis.set(key, verificationCode, ttl * 60);

        return verificationCode;
    }

    // create the verification code and put on the send queue
    addToQueue(type, destination, ttl) {
        const message = {
            type,
            destination,
            ttl
        };

        this.log.debug(`Adding verification request to the send queue [${this.queueName}]`, message);

        message.verificationCode = this.createVerificationCode(type, destination, ttl);

        return queue.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(message)));
    }

    // process the send queue
    async processQueueWorker() {
        this.log.debug(`Listening the send queue [${this.queueName}]`);

        queue.channel.consume(this.queueName, (msg) => {
            const queueMessage = JSON.parse(msg.content);
            const message = `Seu código de verificação é ${queueMessage.verificationCode}`;
            this.notificationService.send(queueMessage.type, queueMessage.destination, message);
            queue.channel.ack(msg);
        });
    }

    // check the verification code on REDIS
    async check(type, destination, verificationCode) {
        const key = `verification-service:${type}:${destination}`;

        const item = await this.redis.get(key);
        const checked = verificationCode === item;

        // TODO: Matar token ?

        return checked;
    }
}

module.exports = VerificationService;
