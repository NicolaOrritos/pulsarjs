'use strict';

var pulsar = require("../index.js");


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
        
        done();
    },
    'no args': function(test)
    {
        test.expect(9);
        
        
        pulsar.loadPulses(function(err, loaded)
        {
            test.ifError(err);
            
            console.log("Loaded previous pulses: '%s'", JSON.stringify(loaded));
            
            function callback()
            {
                console.log("Pulse!");
            }

            function aMoreFrequentCallback()
            {
                console.log("This is a more frequent callback");
            }


            pulsar.addPulse(4, callback, function(err1, firstPulseId)
            {
                test.ifError(err1);
                
                console.log("First pulse: '%s'", firstPulseId);

                test.ok(firstPulseId);

                pulsar.addPulse(1, aMoreFrequentCallback, function(err2, secondPulseId)
                {
                    test.ifError(err2);
                    
                    console.log("Second pulse: '%s'", secondPulseId);

                    test.ok(secondPulseId);
                    
                    pulsar.isPulseActive(firstPulseId, function(err3, isActive)
                    {
                        test.ifError(err3);
                        
                        test.ok(isActive);
                    
                        pulsar.isPulseActive(secondPulseId, function(err4, isActive2)
                        {
                            test.ifError(err4);

                            test.ok(isActive2);


                            test.done();
                        });
                    });
                    
                }, "overridingID");
            });
        });
        
        
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
    }
};
