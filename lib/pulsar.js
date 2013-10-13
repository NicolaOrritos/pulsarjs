

// Usage:
// var pulsar = require("pulsar");
// pulsar.addPulse(/* ... */);

var hash = require('node_hash');
var Datastore = require('nedb');
var db = new Datastore({filename: "pulses.dat", autoload: true});

function Pulse(interval, callback)
{
    this.interval = interval;
    this.callback = callback.toString();
    
    this.id = -1;
    var toBeHashed = "" + interval + JSON.stringify(callback);
    this.id = hash.sha1(toBeHashed);
    
    this.active = false;
}


function pulsar()
{
    /*********************
     *  PUBLIC INTERFACE
     *********************/
    this.addPulse = function(interval, callback, startNow)
    {
        var id = undefined;
        
        if (interval)
        if (callback)
        {
            // 1. Transform delay in seconds
            interval *= 1000;
            
            // 1. Create a pulse
            var pulse = new Pulse(interval, callback);
            
            // If not specified a pulse is active by default:
            pulse.active = startNow ? startNow : true;
            
            db.find({"id": id}, function(err, results)
            {
                if (err)
                {
                    console.log("Received the following error: '%s'", err);
                    console.log("Aborting suspend operation...");
                }
                else if (results.length > 0)
                {
                    console.log("Pulse with ID '%s' is already present", id);
                    console.log("Aborting suspend operation...");
                }
                else
                {
                    console.log("Adding the following pulse:\n%s", JSON.stringify(pulse));
                    
                    // 2. Save to DB
                    db.insert(pulse, function (error, doc)
                    {
                        if (error)
                        {
                            console.log("Received the following error: '%s'", error);
                        }
                        else if (doc)
                        {
                            console.log("Successfully saved the following document in the DB: '%s'", JSON.stringify(doc));
                            
                            id = pulse.id;
                            
                            var metaCallback = function()
                            {
                                console.log("Retrieving pulse with ID '%s'...", pulse.id);
                                
                                db.find({"id": id}, function(err1, results)
                                {
                                    if (err1)
                                    {
                                        console.log("Received the following error: '%s'", err1);
                                    }
                                    else if (results)
                                    {
                                        console.log("Found pulse. Rebuilding callback...");
                                        
                                        var actualPulse = results[0];
                                        
                                        if (actualPulse)
                                        if (actualPulse.active)
                                        if (actualPulse.callback)
                                        {
                                            var actualCallback = eval("(" + actualPulse.callback + ")");
                                            
                                            console.log("Callback rebuilt. Invoking it...");
                                            
                                            actualCallback.call(this);
                                        }
                                    }
                                    else
                                    {
                                        console.log("Pulse with ID '%s' not found", id);
                                    }
                                });
                            };
                            
                            // Start pulsating:
                            setInterval(metaCallback, interval);
                        }
                        else
                        {
                            console.log("Received a generic error");
                        }
                    });
                    
                    // 3. Start the pulse
                    // TODO
                }
            });
        }
        
        
        return id;
    };
    
    this.suspendPulse = function(id)
    {
        if (id)
        {
            db.find({"id": id}, function(err, results)
            {
                if (err)
                {
                    console.log("Received the following error: '%s'", err);
                    console.log("Aborting suspend operation...");
                }
                else if (results.length > 0)
                {
                    console.log("Results: '%s'", JSON.stringify(results));
                    
                    if (results.length > 0)
                    {
                        // TODO
                    }
                }
                else
                {
                    console.log("Could not finde pulse with ID '%s'", id);
                    console.log("Aborting suspend operation...");
                }
            });
        }
    };
    
    this.startPulse = function(id)
    {
        if (id)
        {
            db.find({"id": id}, function(err, results)
            {
                if (err)
                {
                    console.log("Received the following error: '%s'", err);
                    console.log("Aborting start operation...");
                }
                else if (results.length > 0)
                {
                    console.log("Results: '%s'", JSON.stringify(results));
                    
                    if (results.length > 0)
                    {
                        // TODO
                    }
                }
                else
                {
                    console.log("Could not finde pulse with ID '%s'", id);
                    console.log("Aborting start operation...");
                }
            });
        }
    };
    
    this.shutPulse = function(id)
    {
        if (id)
        {
            db.find({"id": id}, function(err, results)
            {
                if (err)
                {
                    console.log("Received the following error: '%s'", err);
                    console.log("Aborting shut operation...");
                }
                else if (results.length > 0)
                {
                    console.log("Results: '%s'", JSON.stringify(results));
                    
                    if (results.length > 0)
                    {
                        // TODO
                    }
                }
                else
                {
                    console.log("Could not finde pulse with ID '%s'", id);
                    console.log("Aborting shut operation...");
                }
            });
        }
    };
};

module.exports = new pulsar();


