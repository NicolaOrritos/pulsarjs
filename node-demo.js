
var pulsar = require("./lib/pulsar.js");


function callback()
{
    console.log("Pulse!");
}

function aMoreFrequentCallback()
{
    console.log("This is a more frequent callback");
}

pulsar.addPulse(4, callback);
pulsar.addPulse(1, aMoreFrequentCallback);

