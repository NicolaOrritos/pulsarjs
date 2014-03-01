pulsarjs
========

Pulsarjs is a simple function scheduler, capable of calling functions at regular intervals and storing them into a DB to be saved/loaded at every restart of the application.


Installation
------------
    npm install pulsarjs

Required modules are [nedb](https://github.com/louischatriot/nedb) and [node_hash](https://github.com/Marak/node_hash)


Usage
-----
Let's say we have two functions we want repeatedly called, at some regular intervals:
```javascript
    function callback()
    {
        console.log("Pulse!");
    }

    function aMoreFrequentCallback()
    {
        console.log("This is a more frequent callback");
    }
```

We can use pulsar for this job!
```javascript
    var pulsar = require("pulsarjs");
    
    // 1. Trigger previous pulses loading:
    pulsar.loadPulses(function(err, pulsesIDs)
    {
        // 2. Once finished let's print their IDs:
        console.log("Loaded previous pulses: '%s'", JSON.stringify(pulsesIDs));

        
        // 3. Now define the actual code of your pulses:
        function callback()
        {
            console.log("Pulse!");
        }

        function aMoreFrequentCallback()
        {
            console.log("This is a more frequent callback");
        }


        // 4. Add the first one
        //    The first parameter (here '4') is the frequency in seconds
        pulsar.addPulse(4, callback, function(err1, firstPulseId)
        {
            // An ID like '0241abd2d055ec0f34b9e5238831bd5032221d95' will be logged...
            console.log("First pulse: '%s'", firstPulseId);
            

            // 5. Add the second one
            pulsar.addPulse(1, aMoreFrequentCallback, function(err2, secondPulseId)
            {
                console.log("Second pulse: '%s'", secondPulseId);
                
                // 6. DONE :-)
            });
        });
    });
    
    
```
    
By using the previous code _"Pulse!"_ will be printed every 4 seconds and _"This is a more frequent callback"_ every one second.



LICENSE - Apache License v2
---------------------------
Copyright (c) 2013 Nicola Orritos

Licensed under the Apache License, Version 2.0 (the "License");
you may not use these files except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

