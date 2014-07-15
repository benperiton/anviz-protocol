/**
 * @author Ben Periton <dev@ben.periton.co.uk>
 *
 * Test file for communicating with the A300.
 */

// ----- Header
// -----------------------------------------------------------------------------

var
	// Internal dependencies
	AnvizClient = require('./lib/Anviz/Client'),
	
	// Locals
	anviz
;


// ----- Testbed
// -----------------------------------------------------------------------------

anviz = new AnvizClient( '192.168.2.190', 5010, 1 );

anviz.on('error', function (err) {
	console.error('Oops: ', err);
});

anviz.on('connect', function () {
	var
		info,
		datetime
	;

	// Grab the info about the device
	anviz.getInfo(function (data) {
		console.log('Device Info: ', data);
	});

	// Grab the datetime info
	anviz.getDatetime(function (data) {
		console.log('Device Datetime: ', data);
	});
});
