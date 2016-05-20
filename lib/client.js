
exports = module.exports = OoyalaApiClient;
exports.version = '2.0.1';

var crypto = require('crypto');
var request = require('superagent');
Q = require ( 'q' );
_ = require('lodash');

function OoyalaApiClient( apiKey, apiSecret ) {
	this.apiKey = apiKey;
	this.apiSecret = apiSecret;
	this.urlRoot = 'https://api.ooyala.com';

	this.concatenateParams = function( params, seperator ) {
		var string = "";
		var paramsKey = _.reject(_.keys(params), function(k) { return this.indexOf(k) >= 0; },
			["signature"]).sort();
		_.each(paramsKey, function(k) {
			var value = params[k];
			string += k + "=" + value;
		});

		return string;
	};

	/**
	 * Generates the signature for a request. If the method is GET, then it does
	 * not need to add the body of the request to the signature. On the other
	 * hand, if it's either a POST, PUT or PATCH, the request body should be a
	 * JSON serialized object into a String. The resulting signature should be
	 * added as a GET parameter to the request.
	 *
	 * @param params - An associative array that contains GET params.
	 * @param method - Either GET, DELETE POST, PUT or PATCH
	 * @param apiPath - The path of the resource from the request.
	 * @param body - The contents of the request body. Used when doing a POST, PATCH or PUT requests. Defaults to "".
	 * @returns { string } - The signature that should be added as a query parameter to the URI of the request.
	 * @private
	 */
	this._generateSignature = function( method, apiPath, params, body ) {
		var shasum = crypto.createHash('sha256');

		var stringToSign = this.apiSecret + method + apiPath;
		stringToSign += this.concatenateParams( params, "");
		stringToSign += body || "";
		shasum.update( stringToSign );
		return shasum.digest('base64').slice(0,43);
	};

	/**
	 * Generates the signature for a request. If the method is GET, then it does
	 * not need to add the body of the request to the signature. On the other
	 * hand, if it's either a POST, PUT or PATCH, the request body should be a
	 * JSON serialized object into a String. The resulting signature should be
	 * added as a GET parameter to the request.
	 *
	 * @param params - An associative array that contains GET params.
	 * @param method - Either GET, DELETE POST, PUT or PATCH
	 * @param apiPath - The path of the resource from the request.
	 * @param body - The contents of the request body. Used when doing a POST, PATCH or PUT requests.
	 * @returns { Promise } - A promise that will resolve to the requested data
	 * @private
	 */
	this._buildPromise = function( method, apiPath, params, body ) {
		var deferred = Q.defer(), expiresInSeconds = 30 + Math.floor(Date.now() / 1000);
		body = body || "";
		params = params || {};

		params['api_key'] = this.apiKey;
		params['expires'] = 30 + Math.floor(Date.now() / 1000);
		params['signature'] = this._generateSignature( method.toUpperCase(), apiPath, params, body );

		var rootURL = (method.toLowerCase() == 'get') ? "https://cdn-api.ooyala.com" : this.urlRoot;

		request[method.toLowerCase()]( rootURL + apiPath )
			.accept('application/json')
			.set('X-API-KEY', this.apiKey )
			.set('HTTP_X_API_KEY', this.apiKey)
			.query(params)
			.send(body)
			.end( function( err, res ) {
				if ( err ) {
					deferred.reject( new Error( err ) );
				}

				if ( res.message ) {
					deferred.reject( new Error( res.message ) );
				} else {
					deferred.resolve(res.body);
				}
			});

		return deferred.promise;
	}
};

OoyalaApiClient.prototype.get = function( apiPath, params ) {
	return this._buildPromise("get", apiPath, params );
};

OoyalaApiClient.prototype.post = function( apiPath, params, body ) {
	return this._buildPromise("post", apiPath, params, body );
};

OoyalaApiClient.prototype.put = function( apiPath, params, body ) {
	return this._buildPromise("put", apiPath, params, body );
};

OoyalaApiClient.prototype.patch = function( apiPath, params, body ) {
	return this._buildPromise("patch", apiPath, params, body );
};
