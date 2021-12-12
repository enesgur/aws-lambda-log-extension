module.exports.handle = async function (event, context, callback) {
    console.log("Start Handler")
    console.info("Query Strings", event.queryStringParameters)

    let response = {
        statusCode: 200,
        body: JSON.stringify({
            "query-strings": event.queryStringParameters,
        }),
    };

    callback(null, response);
    console.log("End Handler")
}
