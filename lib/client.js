
exports = module.exports = OoyalaApiClient;
exports.version = '0.0.2';

var _ = require("underscore");
var crypto = require('crypto');
var querystring = require('querystring');
var httpClient = require('http');
var OO = { _ : _ };


function OoyalaApiClient(apiKey, apiSecret, hostName, hostPort) {
  this.apiKey = apiKey;
  this.apiSecret = apiSecret;
  this.expiresInSeconds = 30;
  this.hostName = hostName;
  this.hostPort = hostPort;
  this.excludeFromSignaure = ["signature"];
}

OO._.extend(OoyalaApiClient.prototype, {
  post: function(headers, apiPath, params, body, statusCb, dataCb, errCb, context) {
    this._curl('POST', headers, apiPath, params, body, statusCb, dataCb, errCb, context);
  },

  put: function(headers, apiPath, params, body, statusCb, dataCb, errCb, context) {
    this._curl('PUT', headers, apiPath, params, body, statusCb, dataCb, errCb, context);
  },

  get: function(headers, apiPath, params, statusCb, dataCb, errCb, context) {
    this._curl('GET', headers, apiPath, params, null, statusCb, dataCb, errCb, context)
  },


  _curl: function(method, headers, apiPath, params, body, statusCb, dataCb, errCb, context) {
    headers = headers || {};
    headers['Content-length'] = body ? body.length : 0;
    headers['X-API-KEY'] = headers['HTTP_X_API_KEY'] = this.apiKey;

    params = params || {};
    OO._.extend(params, {
      'api_key' : this.apiKey,
      'expires' : this.expiresInSeconds + Math.floor(Date.now() / 1000)
    });

    params["signature"] = this._sign(params, method, apiPath, body).slice(0,43);

    var options = {
             host: this.hostName,
             port: this.hostPort,
             path: apiPath + "?" + querystring.stringify(params),
             headers: headers,
             method: method
    };

    var req = httpClient.request(options, function(res) {
          statusCb.apply(context, [res.statusCode, JSON.stringify(res.headers)]);
          res.setEncoding('utf8');
          res.on('data', function() {
            if (dataCb) { dataCb.apply(context, arguments); }
          });
     });
     if (errCb) {
       req.on('error', function() {
         errCb.apply(context, arguments);
       });
     }
     if (body) { req.write(body); }
     req.end();
  },

  _sign: function(params, method, apiPath, body) {
    var shasum = crypto.createHash('sha256');
    var paramsKey = OO._.reject(OO._.keys(params), function(k) { return this.indexOf(k) >= 0; },
           this.excludeFromSignaure).sort();
    var result = [ this.apiSecret, method, apiPath ];
    OO._.each(paramsKey, function(k) {
      result.push( k + '=' + params[k] );
    });
    result.push(body || '');
    shasum.update(result.join(''));
    return shasum.digest('base64');
  },

  __place_holder: false
});