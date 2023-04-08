// Invoke 'strict' JavaScript mode
"use strict";
// Load the correct configuration file according to the 'NODE_ENV' variable
export default require("./env/" + process.env.NODE_ENV + ".js");
