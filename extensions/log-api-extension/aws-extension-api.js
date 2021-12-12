const fetch = require('node-fetch');
const {basename} = require('path');
const baseUrl = `http://${process.env.AWS_LAMBDA_RUNTIME_API}/2020-01-01/extension`; // Extension API

exports.register = async function () {
    const res = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        body: JSON.stringify({
            'events': [
                'INVOKE',
                'SHUTDOWN'
            ],
        }),
        headers: {
            'Content-Type': 'application/json',
            'Lambda-Extension-Name': basename(__dirname),
        }
    });

    if (!res.ok) {
        console.error('Register Failed', await res.text());
    }

    return res.headers.get('lambda-extension-identifier');
}

exports.next = async function (extensionId) {
    const res = await fetch(`${baseUrl}/event/next`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Lambda-Extension-Identifier': extensionId,
        }
    });

    if (!res.ok) {
        console.error('Next Failed', await res.text());
        return null;
    }

    return await res.json();
}
