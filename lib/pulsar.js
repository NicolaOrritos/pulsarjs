

// Usage:
// var pulsar = require("pulsarjs");
// pulsar.addPulse(/* ... */);

var hash = require('node_hash');
var Datastore = require('nedb');
var db = new Datastore({filename: "pulses.dat", autoload: true});

function Pulse(interval, callback)
{
    this.interval = interval;
    this.callback = callback.toString();
    this.active = false;
    
    // Hashing depending on the callback
    this.id = hash.sha1(this.callback);
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
            id = pulse.id;
            
            // If not specified a pulse is active by default:
            pulse.active = startNow ? startNow : true;
            
            
            console.log("Adding the following pulse:\n%s", JSON.stringify(pulse));
            
            // 2. If not present create, replace otherwise
            db.find({"id": id}, function(err, results)
            {
                if (err)
                {
                    console.log("Received the following error: '%s'", err);
                    console.log("Aborting add operation...");
                }
                else
                {
                    if (results.length > 0)
                    {
                        console.log("Results: '%s'", JSON.stringify(results));
                        
                        if (results.length > 0)
                        {
                            // Remove previous one:
                            db.remove({_id: results[0]._id}, {}, function(error, removed)
                            {
                                if (error)
                                {
                                    console.log("Could not remove document with _id '%s'", results[0]._id);
                                }
                                else
                                {
                                    console.log("Previous documents found. Removed %d/%d of them.", removed, results.length);
                                }
                            });
                        }
                    }
                    else
                    {
                        console.log("Could not find any previous pulse with ID '%s'", id);
                    }
                    
                    db.insert(pulse, function (error, doc)
                    {
                        if (error)
                        {
                            console.log("Received the following error: '%s'", error);
                        }
                        else if (doc)
                        {
                            console.log("Successfully saved the following document in the DB: '%s'", JSON.stringify(doc));
                            
                            var metaCallback = function()
                            {
                                console.log("Retrieving active pulse with ID '%s' (if any)...", pulse.id);
                                
                                db.find({"id": id, active: true}, function(err1, results)
                                {
                                    if (err1)
                                    {
                                        console.log("Received the following error: '%s'", err1);
                                    }
                                    else if (results)
                                    {
                                        if (results.length > 0)
                                        {
                                            console.log("Found pulse. Rebuilding...");
                                            
                                            var actualPulse = results[0];
                                            
                                            if (actualPulse)
                                            if (actualPulse.callback)
                                            {
                                                var actualCallback = eval("(" + actualPulse.callback + ")");
                                                
                                                console.log("Pulse rebuilt. Invoking it...");
                                                
                                                actualCallback.call(this);
                                                
                                                // Repeat...
                                                setTimeout(metaCallback, actualPulse.interval);
                                            }
                                        }
                                        else
                                        {
                                            console.log("Pulse with ID '%s' not found", id);
                                        }
                                    }
                                    else
                                    {
                                        console.log("Pulse with ID '%s' not found", id);
                                    }
                                });
                            };
                            
                            // 3. Start pulsating:
                            setTimeout(metaCallback, interval);
                        }
                        else
                        {
                            console.log("Received a generic error");
                        }
                    });
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
                        var actualPulse = results[0];
                        
                        db.update({id: actualPulse.id}, {active: false}, function(error, updates)
                        {
                            console.log("Affected pulses: ", updates);
                        });
                    }
                }
                else
                {
                    console.log("Could not find pulse with ID '%s'", id);
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
                    console.log("Could not find pulse with ID '%s'", id);
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
                    console.log("Could not find pulse with ID '%s'", id);
                    console.log("Aborting shut operation...");
                }
            });
        }
    };
};

module.exports = new pulsar();


