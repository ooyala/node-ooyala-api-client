
exports = module.exports = OoyalaApiClient;
exports.version = '2.0.0';

var crypto = require('crypto');
var request = require('superagent');
Q = require ( 'q' );
_ = require('lodash');

function OoyalaApiClient( apiKey, apiSecret ) {
	this.apiKey = apiKey;
	this.apiSecret = apiSecret;
	this.urlRoot = 'https://api.ooyala.com/v2/';

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
	this._generateSignature = function(params, method, apiPath, body) {
		var shasum = crypto.createHash('sha256');

		var stringToSign = this.apiSecret + method + "/v2/" + apiPath;
		stringToSign += this.concatenateParams( params, "");
		stringToSign += body || "";
		shasum.update( stringToSign );
		return shasum.digest('base64').slice(0,43);
	};
};

OoyalaApiClient.prototype.get = function( apiPath, params ) {
	var deferred = Q.defer();
	var expiresInSeconds = 30 + Math.floor(Date.now() / 1000);

	params['api_key'] = this.apiKey;
	params['expires'] = 30 + Math.floor(Date.now() / 1000);
	params['signature'] = this._generateSignature(params, 'GET', apiPath, "" );

	request.get( this.urlRoot + apiPath )
		.accept('application/json')
		.set('X-API-KEY', this.apiKey )
		.set('HTTP_X_API_KEY', this.apiKey)
		.query(params)
		.end( function( err, res ) {
			if ( err ) {
				deferred.reject( new Error(error) );
			}

			if (res.message ) {
				deferred.reject( new Error( res.message ) );
			} else {
				deferred.resolve(res.body);
			}
		});

	return deferred.promise;
};

OoyalaApiClient.prototype.post = function( apiPath, params, body ) {
	var deferred = Q.defer();
	var expiresInSeconds = 30 + Math.floor(Date.now() / 1000);

	params['api_key'] = this.apiKey;
	params['expires'] = 30 + Math.floor(Date.now() / 1000);
	params['signature'] = this._generateSignature(params, 'POST', apiPath, "" );

	request.post( this.urlRoot + apiPath )
		.set('X-API-KEY', this.apiKey )
		.set('HTTP_X_API_KEY', this.apiKey)
		.send(params)
		.end( function( err, res ) {
			if ( err ) {
				deferred.reject( new Error(error) );
			}

			if (res.message ) {
				deferred.reject( new Error( res.message ) );
			} else {
				deferred.resolve(res.body);
			}
		});

	return deferred.promise;
};

OoyalaApiClient.prototype.put = function( apiPath, params, body ) {
	var deferred = Q.defer();
	var expiresInSeconds = 30 + Math.floor(Date.now() / 1000);

	params['api_key'] = this.apiKey;
	params['expires'] = 30 + Math.floor(Date.now() / 1000);
	params['signature'] = this._generateSignature(params, 'PUT', apiPath, "" );

	request.put( this.urlRoot + apiPath )
		.set('X-API-KEY', this.apiKey )
		.set('HTTP_X_API_KEY', this.apiKey)
		.send(params)
		.end( function( err, res ) {
			if ( err ) {
				deferred.reject( new Error(error) );
			}

			if (res.message ) {
				deferred.reject( new Error( res.message ) );
			} else {
				deferred.resolve(res.body);
			}
		});

	return deferred.promise;
};

OoyalaApiClient.prototype.patch = function( apiPath, params, body ) {
	var deferred = Q.defer();
	var expiresInSeconds = 30 + Math.floor(Date.now() / 1000);

	params['api_key'] = this.apiKey;
	params['expires'] = 30 + Math.floor(Date.now() / 1000);
	params['signature'] = this._generateSignature(params, 'PATCH', apiPath, "" );

	request.patch( this.urlRoot + apiPath )
		.set('X-API-KEY', this.apiKey )
		.set('HTTP_X_API_KEY', this.apiKey)
		.send(params)
		.end( function( err, res ) {
			if ( err ) {
				deferred.reject( new Error(error) );
			}

			if (res.message ) {
				deferred.reject( new Error( res.message ) );
			} else {
				deferred.resolve(res.body);
			}
		});

	return deferred.promise;
};
