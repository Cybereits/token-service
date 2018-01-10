import request from 'request'

function _request(method, url, params) {
    return new Promise((resolve, reject) => {
        if (!url) {
            return reject(new Error(
                `url invalid! method: ${method} url: ${url} params: ${JSON.stringify(params, null, 4)}`,
            ))
        }

        if (!method || !method.toString()) {
            return reject(new Error(
                `http method invalid! method: ${method} url: ${url} params: ${JSON.stringify(params, null, 4)}`,
            ))
        }

        method = method.toString().toLowerCase()

        // TODO suport more http method here
        let allowMethods = ['get', 'post']

        if (!~allowMethods.indexOf(method)) {
            return reject(new Error(
                `http method is not allowed! method: ${method} url: ${url} params: ${JSON.stringify(params, null, 4)}`,
            ))
        }

        let option = {
            url: url,
            json: true,
        }

        if (method === 'get') option.qs = params || {}
        if (method === 'post') option.body = params || {}

        request[method](option, (err, res, body) => {

            if (err) {
                return reject(new Error(
                    `request api failed! error: ${err} method: ${method} url: ${url} params: ${JSON.stringify(params, null, 4)}`,
                ))
            }

            return resolve(body)
        })
    })
}

function get(url, params) {
    // console.log(params)
    return _request('get', url, params)
}

function post(url, params) {
    return _request('post', url, params)
        .then((res) => {
            console.log(`------${url}------\n`, `params: ${JSON.stringify(params, null, 4)}\n`, `response: ${JSON.stringify(res, null, 4)}`)
            if (res.code !== 0) {
                console.log(res.msg)
                return res
            } else {
                return res
            }
        })
}

export default {
    get,
    post,
}
