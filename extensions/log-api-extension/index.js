#!/usr/bin/env node

const {register, next} = require('./aws-extension-api');
const {subscribe} = require('./aws-logs-api');
const {listen} = require('./listener');


const EventTypes = {
    INVOKE: 'INVOKE',
    SHUTDOWN: 'SHUTDOWN',
};

function handleShutdown(event) {
    console.log('Shutdown', event);
    process.exit(0);
}

function handleInvoke(event) {
    console.log('invoke', event);
}

async function handleLog(logsQueue) {
    logsQueue.forEach(function (item, key) {
        console.log("key:", key);
        console.log("item:", item);
    });
    logsQueue.splice(0); // clear log
}

const LOCAL_DEBUGGING_IP = "0.0.0.0";
const RECEIVER_NAME = "sandbox";

async function getListener() {
    return (process.env.AWS_SAM_LOCAL === 'true') ? LOCAL_DEBUGGING_IP : RECEIVER_NAME;
}

// HTTP Listener Port
const RECEIVER_PORT = 4243;
const TIMEOUT_MS = 500
const MAX_BYTES = 256 * 1024
const MAX_ITEMS = 10000

const LOG_SUBSCRIPTION = {
    "destination": {
        "protocol": "HTTP",
        "URI": `http://${RECEIVER_NAME}:${RECEIVER_PORT}`,
    },
    "types": ["platform", "function"],
    "buffering": {
        "timeoutMs": TIMEOUT_MS,
        "maxBytes": MAX_BYTES,
        "maxItems": MAX_ITEMS
    }
};

(async function () {
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

    const extensionId = await register();
    console.log('extensionId', extensionId);

    console.log('Start Listener');
    let logsQueue = []
    const {server} = await listen(await getListener(), RECEIVER_PORT, function (data) {
        logsQueue.push(data);
    });

    // Subscribe to the Logs API
    console.log('Subscribe Logs');
    await subscribe(extensionId, LOG_SUBSCRIPTION);

    while (true) {
        const event = await next(extensionId);
        try {
            switch (event.eventType) {
                case EventTypes.SHUTDOWN:
                    await handleLog(logsQueue);
                    handleShutdown(event);
                    break;
                case EventTypes.INVOKE:
                    handleInvoke(event);
                    await handleLog(logsQueue);
                    break;
                default:
                    console.warn("Invalid Event", event)
            }
        } catch (e) {
            console.warn("Event handle exception", e)
        }
    }
})();


