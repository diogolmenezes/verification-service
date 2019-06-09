const { BaseService } = require('simple-node-framework').Base;
const { config } = require('simple-node-framework').Singleton;

class NotificationService extends BaseService {
    constructor() {
        super({
            module: 'Notification Service'
        });

        this.config = config;
        this.twilio = require('twilio')(this.config.notification.twilio.accountSid, this.config.notification.twilio.authToken); // eslint-disable-line global-require
    }

    send(type, destination, message) {
        switch (type) {
            case 'sms':
                this.sendBySMS(destination, message);
                break;
            case 'email':
                break;
            default:
                throw new Error('The notification type is not supported');
        }
    }

    sendBySMS(destination, message) {
        if (this.config.notification.twilio.mock) return Promise.resolve();

        return this.twilio.messages.create(
            {
                to: `+${destination}`,
                from: this.config.notification.twilio.from,
                body: message
            }
        );
    }
}

module.exports = NotificationService;
