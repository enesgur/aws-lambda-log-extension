const fetch = require('node-fetch');
const baseUrl = `http://${process.env.AWS_LAMBDA_RUNTIME_API}/2020-08-15/logs`; // Logs API

exports.subscribe = async function (extensionId, body) {
    const res = await fetch(baseUrl, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Lambda-Extension-Identifier': extensionId,
        }
    });

    if (res.status !== 200) {
        console.error('Logs Subscription has been failed.', await res.text());
    } else {
        console.info('Logs Subscription has been successfully.', await res.text());
    }
}