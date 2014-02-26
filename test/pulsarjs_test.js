'use strict';

var pulsar = require("../index.js");


/* setTimeout(function()
{
    console.log("Shutting first pulse down...");
    
    pulsar.shutPulse(firstPulse);
    
}, 5000);

setTimeout(function()
{
    console.log("Suspending second pulse...");
    
    pulsar.suspendPulse(secondPulse);
    
}, 2000); */


/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.pulsarjs =
{
    setUp: function(done)
    {
        // setup here
        pulsar.loadPulses();
        
        done();
    },
    'no args': function(test)
    {
        test.expect(2);
        
        
        function callback()
        {
            console.log("Pulse!");
        }

        function aMoreFrequentCallback()
        {
            console.log("This is a more frequent callback");
        }

        var firstPulse  = pulsar.addPulse(4, callback);
        var secondPulse = pulsar.addPulse(1, aMoreFrequentCallback);

        console.log("First pulse: '%s'", firstPulse);
        console.log("Second pulse: '%s'", secondPulse);
        
        
        test.ok(firstPulse);
        test.ok(secondPulse);
        
        
        /* setTimeout(function()
        {
            console.log("Shutting first pulse down...");

            pulsar.shutPulse(firstPulse);

        }, 5000);

        setTimeout(function()
        {
            console.log("Suspending second pulse...");

            pulsar.suspendPulse(secondPulse);

        }, 2000); */
        
        
        test.done();
    }
};
