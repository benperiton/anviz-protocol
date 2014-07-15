/**
 * @author Ben Periton <dev@ben.periton.co.uk>
 *
 * Connect to the A300 and run various commands to get/set data on the device.
 */

// ----- Header
// -----------------------------------------------------------------------------

var
	// External dependencies
	net = require('net'),

	// Internal dependencies
	crc16 = require('./lib/Anviz/crc'),
	pack = require('./lib/pack'),

	// Locals
	client
;

client = net.connect({
	host: '192.168.2.190',
	port: 5010
}).on('connect', function () {

	var raw = 'A5000000014000020019';
	console.log('Raw: ', raw);

	raw += crc16( pack('H*', raw));
	console.log('CRC: ', raw);

	var request = new Buffer(raw, 'hex');

	console.log( request );
	
	client.write( request );
	//client.end();

}).on('data', function (data) {
	console.log('data: ', data);

}).on('end', function () {
	console.log('disconnected');
});

