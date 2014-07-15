/**
 * @author Ben Periton <dev@ben.periton.co.uk>
 *
 * Connect to the A300 and run various commands to get/set data on the device.
 */

// ----- Header
// -----------------------------------------------------------------------------

var
	// External dependencies
	util = require('util'),
	events = require('events'),
	net = require('net'),

	// Internal dependencies
	crc16 = require('./crc'),
	pack = require('../pack')
;

// Lets use events
util.inherits( Client, events.EventEmitter );


// ----- Helpers
// -----------------------------------------------------------------------------

/**
 * 
 */
function padHex (d, padding) {
	var
		hex = Number(d).toString(16)
	;

	padding = padding || 2;

	while ( hex.length < padding ) {
		hex = '0' + hex;
	}

	return hex;
}

/**
 * 
 */
function buildRequest (deviceId, cmd, data) {
	var
		self = this,
		len = 0,
		rawRequest = 'A5', // Always starts with this
		blob
	;

	if ( deviceId < 0 || deviceId > 99999999 ) {
		throw new RangeError( 'Invalid device id. 1 - 99999999' );
	}

	data = data || '';

	// Build up the request
	rawRequest += padHex( deviceId, 8 ) + cmd;

	// Length of data - could be 0
	rawRequest += padHex( data.length, 4 );

	// Add on any data
	if ( data ) {
		rawRequest += data;
	}

	// Add on checksum
	rawRequest += crc16( pack('H*', rawRequest) );

	// Create actual request
	return new Buffer( rawRequest, 'hex' );
}


// ----- Client class
// -----------------------------------------------------------------------------

/**
 * 
 */
function Client (host, port, deviceId) {
	var
		self = this
	;

	events.EventEmitter.call( this );

	this.host = host;
	this.port = port;
	this.deviceId = deviceId;

	this.socket = net.connect({
		host: this.host,
		port: this.port

	}).on('connect', function () {
		self.emit('connect');

	}).on('error', function (err) {
		self.emit('error', err);
	});
}

/**
 * 
 */
Client.prototype.disconnect = function disconnect () {
	this.socket.end();
}

/**
 * Raw:  A5 00 00 00 01 32 00 00
 * CRC:  52 B9
 * Req:  A5 00 00 00 01 32 00 00 52 B9
 * Res:  A5 00 00 00 01 B2 00 00 0F 01 80 00 01 01 01 00 05 00 00 64 00 00 05 00 3A A7
 *
 * Firmware		1-8		(Firmware version is ASC)
 * 9-11
 * Sleeptime	12		(0-250 minutes, never sleep when set as 0)
 * Volume		13		(Level 0-5, mute if set as 0)
 * Language		14		(0-simplified Chinese, 1-Traditional Chinese, 2-English, 3-French, 4-Spanish, 5-Portuguese)
 * 15
 * 16
 * 17
 * 18
 */
Client.prototype.getInfo = function getInfo (callback) {
	var
		request
	;

	request = buildRequest( this.deviceId, 32 );
	console.log(request);
};

/**
 * Raw:  A5 00 00 00 01 38 00 00
 * CRC:  28 CA
 * Req:  A5 00 00 00 01 38 00 00 28 CA
 * Res:  A5 00 00 00 01 B8 00 00 06 0E 07 0F 0C 10 1C 71 38
 *
 * Year		1
 * Month	2
 * Day		3
 * Hour		4
 * Minute	5
 * Second	6
 */
Client.prototype.getDatetime = function getDateTime (callback) {
	var
		request
	;

	request = buildRequest( this.deviceId, 38 );
	console.log(request);
};

/**
 * Raw:  A5 00 00 00 01 40 00 02 00 19
 * CRC:  8E F3
 * Req:  A5 00 00 00 01 40 00 02 00 19 8E F3
 * Res:  A5 00 00 00 01 C0 01 00 00 AF 65
 */
Client.prototype.getAttendance = function getAttendance (type, callback) {
	var
		request,
		typeCmd,
		allRecords = 01,
		newRecords = 02
	;

	typeCmd = (type == 'new') ? newRecords : allRecords;

	request = buildRequest( this.deviceId, 40, [typeCmd,19] ); // 25 max
	console.log(request);
};


// ----- Expose Module
// -----------------------------------------------------------------------------

module.exports = Client;
