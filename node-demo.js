
var pulsar = require("./index.js");


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

setTimeout(function()
{
    console.log("Shutting first pulse down...");
    
    pulsar.shutPulse(firstPulse);
    
}, 5000);

setTimeout(function()
{
    console.log("Suspending second pulse...");
    
    pulsar.suspendPulse(secondPulse);
    
}, 2000);

