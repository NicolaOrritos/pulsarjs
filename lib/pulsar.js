

var hash = require('node_hash');
var Datastore = require('nedb');
var db = new Datastore({filename: "pulses.dat", autoload: false});


var PULSE_TYPE = "pulse";
var PULSE_DEFAULT_ACTIVE = true;  // If not specified a pulse is active by default


function Pulse(interval, callback, id, startNow, parameters)
{
    this.interval = interval;
    this.callback = callback.toString();
    this.active = startNow;
    this.parameters = parameters;
    this.type = PULSE_TYPE;
    
    if (id !== undefined)
    {
        this.id = id;
    }
    else
    {
        // Hashing depending on the callback
        this.id = hash.sha1("" + interval + this.callback);
    }
}


var metaCallback = function(pulseID)
{
    console.log("Retrieving active pulse with ID '%s' (if any)...", pulseID);
    
    db.find({"id": pulseID, type: PULSE_TYPE, active: true}, function(err1, results)
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
                
                if (actualPulse && actualPulse.callback)
                {
                    /*jshint evil: true */
                    var actualCallback = eval("(" + actualPulse.callback + ")");
                    
                    console.log("Pulse rebuilt. Invoking it with the following parameters: %s", JSON.stringify(actualPulse.parameters));
                    
                    actualCallback.call(this, actualPulse.parameters);
                    
                    // Repeat...
                    setTimeout(function() {metaCallback(actualPulse.id);}, actualPulse.interval);
                }
            }
            else
            {
                console.log("Pulse with ID '%s' not found", pulseID);
            }
        }
        else
        {
            console.log("Pulse with ID '%s' not found", pulseID);
        }
    });
};

function startPulsating(pulse)
{
    if (pulse)
    {
        setTimeout(function() {metaCallback(pulse.id);}, pulse.interval);
    }
}

function savePulse(pulse, interval, callback)
{
    if (pulse)
    {
        db.update({id: pulse.id, type: PULSE_TYPE}, pulse, {upsert: true}, function(error, updates)
        {
            if (error)
            {
                console.log("Received the following error: '%s'", error);
                
                if (callback)
                {
                    callback.call(this, error);
                }
            }
            else if (updates)
            {
                // console.log("Successfully saved the following document in the DB: '%s'", JSON.stringify(pulse));

                // 3. Start pulsating:
                startPulsating(pulse);
                
                if (callback)
                {
                    callback.call(this, null);
                }
            }
            else
            {
                if (callback)
                {
                    callback.call(this, "Unknown error");
                }
                
                callback.call(this, null);
            }
        });
    }
}


function pulsar()
{
    /*********************
     *  PUBLIC INTERFACE
     *********************/
    this.loadPulses = function(callback)
    {
        db.loadDatabase(function(loadError)
        {
            if (loadError)
            {
                throw loadError;
            }
            else
            {
                db.persistence.compactDatafile();
                
                db.find({type: PULSE_TYPE}, function(error, pulses)
                {
                    var pulsesIDs = [];

                    if (error)
                    {
                        console.log("Could not load pulses. Reason: '%s'", error);
                        console.log("Aborting load operation...");

                        if (callback)
                        {
                            callback.call(this, null, pulsesIDs);
                        }
                    }
                    else if (pulses)
                    {
                        if (pulses.length === 0)
                        {
                            if (callback)
                            {
                                console.log("Found no previous pulses. Calling back...");

                                callback.call(this, null, pulsesIDs);
                            }
                        }
                        else
                        {
                            console.log("Found '%d' pulses. Loading them...", pulses.length);

                            for (var a=0; a<pulses.length; a++)
                            {
                                var pulse = pulses[a];

                                console.log("Pulse is: %s", JSON.stringify(pulse));

                                if (pulse && pulse.interval && pulse.callback)
                                {
                                    console.log("Found pulse with ID '%s'", pulse.id);
                                    
                                    if (pulse.active)
                                    {
                                        startPulsating(pulse);
                                    }
                                    
                                    pulsesIDs[a] = pulse.id;
                                }
                            }
                            
                            if (callback)
                            {
                                callback.call(this, null, pulsesIDs);
                            }
                        }
                    }
                    else
                    {
                        console.log("No pulses found");

                        if (callback)
                        {
                            callback.call(this, null, pulsesIDs);
                        }
                    }
                });
            }
        });
    };
    
    this.addPulse = function(interval, routine, callback, id, startNow, parameters)
    {
        if (interval && routine)
        {
            // 1. Transform delay in seconds
            interval *= 1000;
            
            
            // 2. Parse parameters
            if (id && (typeof id === 'string'))
            {
                // Nothing to do for now: will be passed to Pulse constructor...
            }
            else
            {
                // OPTIONAL param. Check the next two:
                if (id instanceof Boolean)
                {
                    startNow = id;
                }
                else
                {
                    if (id instanceof Object)
                    {
                        parameters = id;
                    }
                }
                    
                id = undefined;
            }
            
            if (startNow && (startNow instanceof Boolean))
            {
                // Nothing to do for now: assigned later...
            }
            else
            {
                // OPTIONAL param. Check the next one:
                if (startNow && startNow instanceof Object)
                {
                    parameters = startNow;
                }
                
                // Take the default one:
                startNow = PULSE_DEFAULT_ACTIVE;
            }
            
            if (parameters && parameters instanceof Object)
            {
                // Nothing to do for now: assigned later...
            }
            else
            {
                // Default one:
                parameters = {};
            }
            
            console.log("-----------------------------------------------");
            console.log("Resulting arguments for this pulse:");
            console.log(" - interval:   %s", interval);
            console.log(" - routine:    [%s]", typeof routine);
            console.log(" - callback:   [%s]", typeof callback);
            console.log(" - id:         %s", id);
            console.log(" - startNow:   %s", startNow);
            console.log(" - parameters: %s", JSON.stringify(parameters));
            console.log("-----------------------------------------------");
            
            
            // 3. Instantiate a Pulse object
            var pulse = new Pulse(interval, routine, id, startNow, parameters);
            
            
            // console.log("Adding the following pulse:\n%s", JSON.stringify(pulse));
            
            // 4. Save pulse (if existing, updates)
            savePulse(pulse, interval, function(saveError)
            {
                if (saveError)
                {
                    if (callback)
                    {
                        callback.call(this, saveError, null);
                    }
                }
                else
                {
                    if (callback)
                    {
                        callback.call(this, null, pulse.id);
                    }
                }
            });
        }
    };
    
    this.suspendPulse = function(id, callback)
    {
        if (id)
        {
            db.find({"id": id}, function(err, results)
            {
                if (err)
                {
                    console.log("Received the following error: '%s'", err);
                    console.log("Aborting suspend operation...");
                    
                    if (callback)
                    {
                        callback.call(this, err, null);
                    }
                }
                else if (results.length > 0)
                {
                    // console.log("Results: '%s'", JSON.stringify(results));
                    
                    if (results.length > 0)
                    {
                        var actualPulse = results[0];
                        
                        db.update({id: actualPulse.id, type: PULSE_TYPE}, {active: false}, function(error, updates)
                        {
                            console.log("Affected pulses: '%d'", updates);
                            
                            if (callback)
                            {
                                callback.call(this, null, updates);
                            }
                        });
                    }
                }
                else
                {
                    console.log("Could not find pulse with ID '%s'", id);
                    console.log("Aborting suspend operation...");
                    
                    if (callback)
                    {
                        callback.call(this, "Could not find pulse", null);
                    }
                }
            });
        }
    };
    
    this.startPulse = function(id, callback)
    {
        if (id)
        {
            db.find({"id": id, type: PULSE_TYPE}, function(err, results)
            {
                if (err)
                {
                    console.log("Received the following error: '%s'", err);
                    console.log("Aborting start operation...");
                    
                    if (callback)
                    {
                        callback.call(this, err);
                    }
                }
                else if (results.length > 0)
                {
                    // console.log("Results: '%s'", JSON.stringify(results));
                    
                    if (results.length > 0)
                    {
                        var pulse = results[0];
                        
                        if (pulse && pulse.interval)
                        {
                            db.update({id: pulse.id, type: PULSE_TYPE}, {active: true}, function(error, updates)
                            {
                                if (error)
                                {
                                    if (callback)
                                    {
                                        console.log("Pulses effectively started: %d", 0);
                                        
                                        callback.call(this, error);
                                    }
                                }
                                else if (updates > 0)
                                {
                                    // 3. Start pulsating:
                                    setTimeout(function() {metaCallback(pulse.id);}, pulse.interval);
                                    
                                    if (callback)
                                    {
                                        console.log("Pulses effectively started: %d", updates);
                                        
                                        callback.call(this, null);
                                    }
                                }
                                else
                                {
                                    if (callback)
                                    {
                                        console.log("Pulses effectively started: %d", 0);
                                        
                                        callback.call(this, "Could not find pulse");
                                    }
                                }
                            });
                        }
                    }
                }
                else
                {
                    console.log("Could not find pulse with ID '%s'", id);
                    console.log("Aborting start operation...");
                    
                    if (callback)
                    {
                        callback.call(this, "Could not find pulse");
                    }
                }
            });
        }
    };
    
    this.shutPulse = function(id, callback)
    {
        if (id)
        {
            db.find({"id": id}, function(err, results)
            {
                if (err)
                {
                    console.log("Received the following error: '%s'", err);
                    console.log("Aborting shut operation...");
                    
                    if (callback)
                    {
                        callback.call(this, err, null);
                    }
                }
                else if (results.length > 0)
                {
                    // console.log("Results: '%s'", JSON.stringify(results));
                    
                    if (results.length > 0)
                    {
                        db.remove({id: id, type: PULSE_TYPE}, {}, function(error, removed)
                        {
                            console.log("Pulses actually shut down: " + removed);
                            
                            if (callback)
                            {
                                callback.call(this, null, removed);
                            }
                        });
                    }
                }
                else
                {
                    console.log("Could not find pulse with ID '%s'", id);
                    console.log("Aborting shut operation...");
                    
                    if (callback)
                    {
                        callback.call(this, "Could not find pulse", null);
                    }
                }
            });
        }
    };
}

module.exports = new pulsar();



