

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Vertex Global Object
//
//  File: 			lib/vertex-player.js
//
//  Description:  	Acts as a global wrapper and helper for all of its vertex player instances.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	None 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// If the global vertex object hasn't yet been defined, define it now.
if (typeof vertex === "undefined") {


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////// Vertex Constants /////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////


	// Log Level Constant
	var VERTEX_LOG = {
		prod: 0,
		priority: 1,
		high: 2,
		medium: 3,
		low: 4,
		dev: 5,
		error: 6,
		title: 7
	};


	// Global Error Constants
	var VERTEX_ERRORS = {
		prefix: 						"<span class='error_text_underscore error_text_subtext'>Error:</span> ",
		error_origin: 					{code:"1000", message: "Unable to access this content."},
		error_entitlement: 		 		{code:"1001", message: "Unable to access this content."},
		error_content_missing: 		 	{code:"1002", message: "Unable to find this content."},
		error_media_playback:  			{code:"1003", message: "Unable to play this content."},
		error_media_supported:  		{code:"1004", message: "Unfortunately, this browser does not support this content.  Please try a different browser."},
		error_origin_data: 				{code:"1005", message: "Unable to access this content."},
		error_connection_lost: 			{code:"Connection Lost", message: "Network connection has been lost.  Check your connection and try again."},
		error_connection_restored: 		{code:"Connection Restored", message: "Network connection has been restored."},
	};


	// Global Log Color Constants
	var VERTEX_COLORS = {
		prod: "color: #0099ff",
		priority: "color: #009900",
		high: "color: #aabb00",
		medium: "color: #ffcc00",
		low: "color: #ff6600",
		dev: "color: #cc0000",
		error: "color: #ff0000",
		title: "color: #000000",

		ef_reset: "\x1b[0m",
		ef_right: "\x1b[1m",
		ef_dim: "\x1b[2m",
		ef_underscore: "\x1b[4m",
		ef_blink: "\x1b[5m",
		ef_reverse: "\x1b[7m",
		ef_hidden: "\x1b[8m",

		fg_black: "\x1b[30m",
		fg_red: "\x1b[31m",
		fg_green: "\x1b[32m",
		fg_yellow: "\x1b[33m",
		fg_blue: "\x1b[34m",
		fg_magenta: "\x1b[35m",
		fg_cyan: "\x1b[36m",
		fg_white: "\x1b[37m",

		bg_black: "\x1b[40m",
		bg_red: "\x1b[41m",
		bg_green: "\x1b[42m",
		bg_yellow: "\x1b[43m",
		bg_blue: "\x1b[44m",
		bg_magenta: "\x1b[45m",
		bg_cyan: "\x1b[46m",
		bg_white: "\x1b[47m"
	}


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////// Vertex Declarations /////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////


	// Global vertex object
	var vertex = {};

	// Primary Structure
	vertex.c = {}; // Constants
	vertex.tools = {}; // Tools
	vertex.instances = {}; // Player Instances
	vertex.foundation = {}; // Common / Shared Variables
	vertex.activePlayers = 0; // Player Instance Count


	// Foundation Values
	vertex.foundation.playerName = "Vertex Player";
	vertex.foundation.playerVersion = "1.0.11";
	vertex.foundation.playerString = vertex.foundation.playerName + " v" + vertex.foundation.playerVersion;
	vertex.foundation.startTime = (new Date).getTime();
	vertex.foundation.logLevel = 1; // Pre-config log level.  Set to 0 to bypass Vertex Player logo


	// HTTP Ready States
	vertex.c.READY_STATE = {
		unsent: 0,
		opened: 1,
		headers_received:2,
		loading:3,
		done:4
	};


	// HTTP Status Codes
	vertex.c.HTTP_STATUS = {
		ok: 200,
		bad_request: 400,
		forbidden: 403,
		not_found: 404,
		unprocessable: 422,
		bad_gateway: 502
	};


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////// Log Methods /////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////


	// This method adds a new player instance to the global vertex object.
	/***********************************************************************************************************/
	vertex.addPlayerInstance = function(playerInstance) {
		vertex.instances[playerInstance.instanceName] = playerInstance;
		vertex.activePlayers++;
	};


	// This method removes a player instance from the global vertex object.
	/***********************************************************************************************************/
	vertex.removePlayerInstance = function(playerInstance) {
		delete vertex.instances[this.instanceName];
		vertex.activePlayers--;
	};


	// This method initiates the teardown process on all active instances
	/***********************************************************************************************************/
	vertex.destroyAllInstances = function() {
		var playerInstance = null;

		for (instance in vertex.instances) {
			playerInstance = vertex.instances[instance];

			vertex.removePlayerInstance(instance);

			playerInstance.destroy();
		}
	};


	// This method initiates the teardown process on the global vertex object.
	/***********************************************************************************************************/
	vertex.destroy = function() {
		vertex.destroyAllInstances();

		vertex = null;
	};


	// This method builds on top of the standard console.log function to allow log levels and message colors based on log level.
	/***********************************************************************************************************/
	vertex.log = function(logLevel, logData, prefixData){
		var logLevel = (logLevel !== undefined) ? logLevel : VERTEX_LOG.medium;
		var logColors = [VERTEX_COLORS.prod, VERTEX_COLORS.priority, VERTEX_COLORS.high, VERTEX_COLORS.medium, VERTEX_COLORS.low, VERTEX_COLORS.dev, VERTEX_COLORS.error, VERTEX_COLORS.title];
		var logPrefix = (prefixData !== undefined) ? "["+prefixData+"]" : "";

		// If the current log's logLevel is lower than the global log level, output the log now.
		if (vertex.logEligible(logLevel) || logLevel === VERTEX_LOG.error || logLevel === VERTEX_LOG.title) {
			console.log("%c[Vertex]["+logLevel+"]["+vertex.returnRuntimeStamp()+"]"+logPrefix, logColors[logLevel], logData);
		}
	};


	// This method prints a blank line in the console log.
	/***********************************************************************************************************/
	vertex.logBreak = function(logLevel){
		if (vertex.logEligible(logLevel)) {
			console.log("");
		}
	};


	// This method prints the stock Vertex Player logo within the console log.
	/***********************************************************************************************************/
	vertex.logVertexLogo = function() {
		
		var vertexLogo = "\n %c" + 
		"                                                        \n" +
		".::         .::                 .::                     \n" +
		" .::       .::                  .::                     \n" +
		"  .::     .::   .::    .: .:::.:.: .:   .::    .::   .::\n" +
		"   .::   .::  .:   .::  .::     .::   .:   .::   .: .:: \n" +
		"    .:: .::  .::::: .:: .::     .::  .::::: .::   .:    \n" +
		"     .::::   .:         .::     .::  .:         .:  .:: \n" +
		"      .::      .::::   .:::      .::   .::::   .::   .::\n";

		
		var vertexVersion = vertexLogo +
		"                                                        \n"+
		"                       %cP   L   A   Y   E   R   %c[%c"+" v"+vertex.foundation.playerVersion+" %c]%c\n" +
		"                                                        \n";
		
		if (vertex.foundation.logLevel > 0) {
			console.log(vertexVersion, VERTEX_COLORS.prod, VERTEX_COLORS.ef_reset, VERTEX_COLORS.prod, VERTEX_COLORS.ef_reset, VERTEX_COLORS.prod, VERTEX_COLORS.ef_reset);
			console.log("");
		}
	};


	// This method prints a specialized log just for errors.
	/***********************************************************************************************************/
	vertex.logError = function(logData){
		vertex.log(VERTEX_LOG.error, logData, "ERROR");
	};


	// This method determines whether a log message is eligible to be shown, comparing the current global log level and the passed level.
	/***********************************************************************************************************/
	vertex.logEligible = function(currentLogLevel) {
		return (currentLogLevel <= vertex.foundation.logLevel);
	};


	// This method logs all new class instances that occur during runtime.
	/***********************************************************************************************************/
	vertex.logNewInstance = function(instanceName) {
		vertex.log(VERTEX_LOG.low, "Ready!", "Instance: "+instanceName );
	};


	// Prints out the complete selection of log types.
	/***********************************************************************************************************/
	vertex.executeLogTest = function () {
		vertex.logBreak(VERTEX_LOG.prod);
		vertex.log(VERTEX_LOG.prod, "prod");
		vertex.log(VERTEX_LOG.priority, "priority");
		vertex.log(VERTEX_LOG.high, "high");
		vertex.log(VERTEX_LOG.medium, "medium");
		vertex.log(VERTEX_LOG.low, "low");
		vertex.log(VERTEX_LOG.dev, "dev");
		logError("error");
		vertex.log(VERTEX_LOG.title, "title");
		vertex.logBreak(VERTEX_LOG.prod);
	};


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////// Helper Methods ///////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////


	// Returns the current time in ms.
	/***********************************************************************************************************/
	vertex.returnCurrentTimeInMS = function() {
		return (new Date).getTime();
	};


	// Returns the duration in ms since runtime started.
	/***********************************************************************************************************/
	vertex.returnRuntimeDuration = function(startValue) {
		var runtimeDuration = (vertex.returnCurrentTimeInMS() - startValue);
		
		return runtimeDuration;
	};


	// Returns a timestamp in ms representing the current time since runtime started.
	/***********************************************************************************************************/
	vertex.returnRuntimeStamp = function() {
		return vertex.returnRuntimeDuration(vertex.foundation.startTime)+"ms";
	};


	// Returns the player's full name and version.
	/***********************************************************************************************************/
	vertex.returnPlayerName = function() {
		return vertex.foundation.playerString;
	};


	// Locates the source domain of the vertex-player script by searching through all scripts.
	/***********************************************************************************************************/
	vertex.returnSourceDomain = function() {
		var availableScripts = [].slice.call( document.getElementsByTagName('script') );

		// Search through all of the embed
		for (var script of availableScripts) {
			var index = script.src.search("/lib/vertex-player");

			if (index >= 0) {
				//vertex.log(VERTEX_LOG.priority, "FOUND = "+script.src.substring(0, index));
				return script.src.substring(0, index);
			}
		}
	};


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////// Tool Methods ////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////


	// This method loads remote resources like JSON documents into memory
	/***********************************************************************************************************/
	vertex.tools.loadDataFromRemoteAPI = function(type, documentData, headers, payload, onready, timeout = 10000) {
		var httpRequest = new XMLHttpRequest();
			httpRequest.timeout = (typeof vertex.activeConfiguration !== "undefined") ? vertex.activeConfiguration.dataTimeout : timeout;
			httpRequest.open(type, documentData.doc_path, true);

			// Add headers
			for (var i = 0; i < headers.length; i++) {
				httpRequest.setRequestHeader(headers[i].key, headers[i].value);
			}
			
			httpRequest.onreadystatechange = function() {
			    if (this.readyState == vertex.c.READY_STATE.done) {
				    if (this.status == vertex.c.HTTP_STATUS.ok) {
		    			vertex.log(VERTEX_LOG.low, ((type === "POST") ? "Successfully Sent!" : "Successfully Loaded!"), "Document."+documentData.doc_id);
					} else {
						vertex.log(VERTEX_LOG.low, ((type === "POST") ? "Failed To Send!" : "Failed To Load!"), "Document."+documentData.doc_id);
					}

					onready(documentData.doc_source, this);
				}
			}

			httpRequest.send(payload);
	};


	// This method imports a script into the player's scripts DOM.
	/***********************************************************************************************************/
	vertex.tools.loadScript = function(container, scriptData, onready) {
	    var scriptTag = document.createElement('script');

	    scriptTag.type = "text/javascript";
	    scriptTag.src = ((scriptData.script_path.search("http") >= 0) ? "" : vertex.foundation.baseURL) + scriptData.script_path+"?version="+vertex.foundation.playerVersion;

	    scriptTag.onload = function(event) {
	    	vertex.log(VERTEX_LOG.dev, event);
	    	vertex.log(VERTEX_LOG.low, "Successfully Loaded!", "Script."+scriptData.script_id);

	    	if (onready) {
	    		onready(event);
	    	}
		}
	    scriptTag.onerror = scriptTag.ontimeout = function(event) {
	    	vertex.log(VERTEX_LOG.dev, event);
			vertex.log(VERTEX_LOG.low, "Failed To Load!", "Script."+scriptData.script_id);

	    	if (onready) {
	    		onready(event);
	    	}
	    };

	    container.appendChild(scriptTag);

	    return scriptTag;
	};


	// This method imports a style sheet into the player's styles DOM.
	/***********************************************************************************************************/
	vertex.tools.loadStyle = function(container, styleData, onready) {
	    var styleTag = document.createElement('link');

	    styleTag.rel= 'stylesheet';
	    styleTag.type = 'text/css';
	    styleTag.href = styleData.style_path+"?version="+vertex.foundation.playerVersion;
	    styleTag.onload = function(event) {
	    	vertex.log(VERTEX_LOG.dev, event);
	    	vertex.log(VERTEX_LOG.low, "Successfully Loaded!", "Style."+styleData.style_id);

	    	if (onready) {
	    		onready(event);
	    	}
		}
	    styleTag.onerror = function(event) {
	    	vertex.log(VERTEX_LOG.dev, event);
			vertex.log(VERTEX_LOG.low, "Failed To Load!", "Style."+styleData.style_id);

	    	if (onready) {
	    		onready(event);
	    	}
	    };

	    container.appendChild(styleTag);

	    return styleTag;
	};



	/***********************************************************************************************************/
	vertex.tools.openInNewTab = function(url) {
		var newTab = window.open(url, '_blank');
		newTab.focus();
	};


	// Measures the distance of a vector between two points.
	/***********************************************************************************************************/
	vertex.tools.measureVectorDistance = function(point1, point2) {
		return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
	};


	// Returns the number of elements within a given object.
	/***********************************************************************************************************/
	vertex.tools.objectSize = function(testObject) {
		var propertyCount = -1;

		// Checks first that the object exists before testing size.
		if (typeof testObject !== "undefined" && testObject) {
			
			// Since the object exists, bring the count to 0
			propertyCount++;

			// Iterates through the object's elements, counting as it goes.
			for (var property in testObject) {
				propertyCount++;
			}
		}

		return propertyCount;
	};


	// This method creates s div container using the passed properties.
	/***********************************************************************************************************/
	vertex.tools.createDivContainerWithProperties = function(baseContainer, baseProperties) {
		var domObject = document.createElement('div');
		
		if (typeof baseProperties.div_id !== "undefined") {
			domObject.id = baseProperties.div_id;
		}

		if (typeof baseProperties.div_class !== "undefined") {
			domObject.className = baseProperties.div_class;
		}

		if (baseContainer) {
			baseContainer.appendChild(domObject);
		}

		return domObject;
	};


	// This method creates s div container using the passed properties.
	/***********************************************************************************************************/
	vertex.tools.createElementWithProperties = function(baseType, baseContainer, baseProperties) {
		var domObject = null;

		if (typeof baseType !== "undefined") {
			domObject = document.createElement(baseType);
		} else {
			domObject = document.createElement('div');
		}
		
		if (typeof baseProperties.dom_id !== "undefined") {
			domObject.id = baseProperties.dom_id;
		}

		if (typeof baseProperties.dom_class !== "undefined") {
			domObject.className = baseProperties.dom_class;
		}

		if (baseContainer) {
			baseContainer.appendChild(domObject);
		}

		return domObject;
	};


	// Global helper method to change a time value from 'seconds' to '[h:][0]m:[0]s' format
	/***********************************************************************************************************/
	vertex.tools.changeTimeFormat = function(time) {
		var timeString = "";
		var hours = Math.floor(time / 3600);
		var minutes = Math.floor(time / 60);
		var seconds = time % 60;
		
		if (hours > 0) {
			timeString += hours + ":";
		}

		var styledMinutes = ((hours > 0 && minutes < 10) ? "0" : "") + minutes;
		var styledSeconds = ((seconds < 10) ? "0" : "") + seconds;
		
		timeString += (isNaN(styledMinutes) ? "0" : styledMinutes) + ":" + (isNaN(styledSeconds) ? "00" : styledSeconds);

		return timeString;
	};


	// Returns the current fullscreen state.
	/************************************************************************************/
	vertex.tools.inFullScreen = function() {
		return (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen);
	};


	// Returns a boolean indicating whether the passed DOM is visible.
	/***********************************************************************************************************/
	vertex.tools.isShowing = function(domObject) {
		// TEST
		//console.log("Display = "+domObject.style.display+", Opacity = "+Number(domObject.style.opacity));
		return (domObject.style.display !== "none" || domObject.style.display === null); // || (domObject.style.display === null && domObject.style.opacity === null));
	};


	// Returns a boolean indicating whether the passed string is empty.
	/***********************************************************************************************************/
	vertex.tools.isEmptyString = function(stringObject) {
		
		// If the value is defined, proceed.
		if (typeof stringObject !== "undefined" && stringObject !== null) {

			// No matter what, convert incoming value to string, even if number.
			var stringValue = new String(stringObject);

			// If the string has characters, proceed.
			if (stringValue.length > 0) {
				
				// If the characters are only whitespace characters it's not empty
				if (stringValue.search(/^(\s+)$/gi) === -1) {
					return false;
				}
			}
		}

		return true;
	};


	// Shows a given domObject using the new display value.
	/***********************************************************************************************************/
	vertex.tools.show = function(domObject, display="block") {
		domObject.style.opacity = null;
		domObject.style.display = null;
	};


	// Hides a given domObject.
	/***********************************************************************************************************/
	vertex.tools.hide = function(domObject) {
		domObject.style.opacity = 0.0;
		domObject.style.display = "none";
	};


	// Fades a given domObject into view.
	/***********************************************************************************************************/
	vertex.tools.fadeIn = function(domObject, fadeInterval, display="block"){
		var fadeIterator = vertex.tools.calculateFadeIterator(fadeInterval);

		if (fadeInterval > 0.0) {
			//domObject.style.opacity = 0.0;
			domObject.style.display = display;

			// The fade function that we're sending to window to animate.
			(function fadeDOMIn() {
				var newOpacity = Number(domObject.style.opacity) + fadeIterator;
				
				if (newOpacity >= 1.0) {
					vertex.tools.show(domObject, display);
				} else {
					domObject.style.opacity = newOpacity;
					requestAnimationFrame(fadeDOMIn);
				}
			})();
		} else {
			vertex.tools.show(domObject, display);
		}
	};


	// Fades a given domObject out of view.
	/***********************************************************************************************************/
	vertex.tools.fadeOut = function(domObject, fadeInterval){

		var fadeIterator = vertex.tools.calculateFadeIterator(fadeInterval);

		// Only fade if the interval is greater than 0.
		if (fadeInterval > 0.0) {

			// The fade function that we're sending to window to animate.
			(function fadeDOMOut() {
				var newOpacity = ((domObject.style.opacity > 0.0) ? Number(domObject.style.opacity) : 1.0) - fadeIterator;

				if (newOpacity <= 0.0) {
					vertex.tools.hide(domObject);
				} else {
					domObject.style.opacity = newOpacity;
					requestAnimationFrame(fadeDOMOut);
				}
			})();
		} else {
			vertex.tools.hide(domObject);
		}
	};


	// Calculates a rough fade iterator value based on a passed interval and milliseconds.
	/***********************************************************************************************************/
	vertex.tools.calculateFadeIterator = function(fadeInterval) {
		return (1 / fadeInterval) * 20;
	};


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////// Finalize Vertex /////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////


	vertex.foundation.baseURL = vertex.returnSourceDomain();

	vertex.logVertexLogo();
}





/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Vertex Player Class
//
//  File: 			lib/vertex-player.js
//
//  Description:  	Acts as the primary controller script and primary interface for the current Vertex Player
//  				instance.  This script is in charge of initializing all aspects of the player and 
//  				providing a public interface for all systems that load this library.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	All
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Base-Init Methods /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Vertex Player Constructor
/***********************************************************************************************************/
function VertexPlayer(baseContainer, configurationData) {
	
	this.startTime = (new Date).getTime();
	this.instanceName = "vertex-player-"+vertex.activePlayers+"-"+this.startTime;
	this.sourceInstance = this.instanceName;

	this.logInitialize(this.instanceName);
	
	vertex.addPlayerInstance(this);

	this.overrideConfiguration = configurationData;
	
	// Creates empty objects for the player's base handlers
	this.activeElements = null;
	this.containers = {};
	this.scripts = {};
	this.handlers = {};
	this.queuedListenerRequests = [];
	this.queuedEventRequests = [];
	this.queuedActionRequests = [];
	this.main = null;

	this.establishSupportContainers(this.containers, baseContainer);
	
	this.defineCommonConfigurations();

	this.loadErrors();
}


// This method creates all of the player's base DOM containers and organizes the player's DOM tree.
/***********************************************************************************************************/
VertexPlayer.prototype.establishSupportContainers = function(containerData, baseContainer) {
	containerData.baseContainer = baseContainer;
	containerData.playerContainer = vertex.tools.createDivContainerWithProperties(containerData.baseContainer, {div_id:this.instanceName, div_class:"player-container video-background"});
	containerData.playerContainer.style["background-color"] = "#000000";

	containerData.uiContainer = vertex.tools.createDivContainerWithProperties(containerData.playerContainer, {div_id:"ui", div_class:"ui-container"});
	containerData.scriptsContainer = vertex.tools.createDivContainerWithProperties(containerData.playerContainer, {div_id:"scripts", div_class:"script-container"});
	containerData.videoContainer = vertex.tools.createDivContainerWithProperties(containerData.playerContainer, {div_id:"video", div_class:"video-container"});
	containerData.stylesContainer = vertex.tools.createDivContainerWithProperties(containerData.playerContainer, {div_id:"styles", div_class:"styles-container"});

	this.main = containerData.playerContainer;

	this.defineCommonElements(containerData);

	// If there are listener requests that came in before the container was ready, process them now.
	this.backfillListenerRequests(this.queuedListenerRequests);
};


// 
/***********************************************************************************************************/
VertexPlayer.prototype.defineCommonElements = function(containerData) {
	containerData.loadingSymbol = vertex.tools.createDivContainerWithProperties(containerData.uiContainer, {div_id:"loading", div_class:"loading_symbol"});
};



// This method creates some base difinitions for vertex foundation, including the necessary base scripts for the player to function.
/***********************************************************************************************************/
VertexPlayer.prototype.defineCommonConfigurations = function() {
	
	// Base URL for all scripts and resources
	this.configIdentifier = "default";

	// Scripts To Load
	this.baseScripts = [
		{script_family:"vertex.foundation", script_id:"errors", script_path:"/lib/common/errors.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"config", script_path:"/lib/common/config.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"active", script_path:"/lib/common/active-elements.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"constants", script_path:"/lib/common/constants.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"events", script_path:"/lib/common/events.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"keys", script_path:"/lib/common/keys.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"uihandler", script_path:"/lib/ui/ui-handler.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"browser", script_path:"/lib/common/browser.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"client", script_path:"/lib/common/client.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"cookies", script_path:"/lib/common/cookies.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"controlshandler", script_path:"/lib/ui/controls-handler.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"menuhandler", script_path:"/lib/ui/menu-handler.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"component", script_path:"/lib/ui/component.js", script_class:null},
		/*{script_family:"vertex.foundation", script_id:"castplayer", script_path:"/lib/player/cast-player.js", script_class:null},*/
		{script_family:"vertex.foundation", script_id:"audiotracks", script_path:"/lib/player/audiotracks.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"captions", script_path:"/lib/player/captions.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"playerhandler", script_path:"/lib/player/player-handler.js", script_class:null},
		{script_family:"vertex.foundation", script_id:"player", script_path:"/lib/player/html5-player.js", script_class:null}
	];
};


// This method initializes the logging functionality for the player.
/***********************************************************************************************************/
VertexPlayer.prototype.logInitialize = function(instanceName) {
	vertex.log(VERTEX_LOG.prod, "Session ["+instanceName+"] Initializing...");
	vertex.logBreak(VERTEX_LOG.prod);
};


// This method initializes error functionality first before anything else.
/***********************************************************************************************************/
VertexPlayer.prototype.loadErrors = function() {
	var source = this;
	var errorScript = null;

	// Iterates through the base scripts array
	for (var script of this.baseScripts) {
		
		// If the current script is errors, store the script reference and stop iterating now.
		if (script.script_id === "errors") {
			errorScript = script;
			break;
		}
	}
	
	// Load the errors script and then the default stylesheet for errors.
	this.scripts[errorScript.script_id] = vertex.tools.loadScript(this.containers.scriptsContainer, errorScript, function(event) {
    	source.errors = new Errors(source, {
			instanceName: source.instanceName+"-errors",
			playerContainer: source.containers.uiContainer
		});    	

		// Load the default stylesheet for now, which will be overridden later when the theme loads.
		vertex.tools.loadStyle(source.containers.stylesContainer, {style_id:"default_style", style_path:vertex.foundation.baseURL+"/themes/default/default_style.css"}, function(event) {
			if (event.type !== "error") {
				vertex.log(VERTEX_LOG.high, "Errors Ready!");

				// Loads the Active Elements script now.
				source.loadActiveElements();

				// Continue Execution once errors is ready.
				//source.loadConfig();
			}
		});
	});
};


// This method loads the config class, which is responsible for producing the active configuration.
/***********************************************************************************************************/
VertexPlayer.prototype.loadActiveElements = function() {
	var source = this;
	var activeScript = null;

	// Iterates through the base scripts array
	for (var script of this.baseScripts) {
		
		// If the current script is errors, store the script reference and stop iterating now.
		if (script.script_id === "active") {
			activeScript = script;
			break;
		}
	}

	// Load the errors script and then the default stylesheet for errors.
	this.scripts[activeScript.script_id] = vertex.tools.loadScript(this.containers.scriptsContainer, activeScript, function(event) {
		source.activeElements = new ActiveElements(source, {instanceName: source.instanceName+"-active-elements"});

		vertex.log(VERTEX_LOG.high, "Active Elements Ready!");

		// Continue Execution once errors is ready.
		source.loadConfig();
	});
};


// This method loads the config class, which is responsible for producing the active configuration.
/***********************************************************************************************************/
VertexPlayer.prototype.loadConfig = function() {
	var source = this;
	var configScript = null;

	// Iterates through the base scripts array
	for (var script of this.baseScripts) {
		
		// If the current script is errors, store the script reference and stop iterating now.
		if (script.script_id === "config") {
			configScript = script;
			break;
		}
	}

	// Load the errors script and then the default stylesheet for errors.
	this.scripts[configScript.script_id] = vertex.tools.loadScript(this.containers.scriptsContainer, configScript, function(event) {
		
		// Loads the Active Elements script now.
		//source.loadActiveElements();

		source.config = new Config(source, {
			instanceName: source.instanceName+"-config",
			callback: "configurationLoaded"
		});
	});
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Post-Config Methods ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// This method executes after the base and remote configurations have been combined, allowing the 
// embed configuration to now be consolidated into the active configuration as well.
/***********************************************************************************************************/
VertexPlayer.prototype.configurationLoaded = function(configData) {

	this.sourceConfiguration = configData;
	this.activeConfiguration = this.consolidateConfigurationData(this.overrideConfiguration, this.sourceConfiguration);
	this.baseScripts = this.baseScripts.concat(this.activeConfiguration.plugins);

	// Updates the active elements object with the active config.
	this.activeElements.config = this.activeConfiguration;

	vertex.foundation.logLevel = this.activeConfiguration.logLevel;

	vertex.log(VERTEX_LOG.priority, "Active Configuration Ready!");
	vertex.logBreak(VERTEX_LOG.priority);

	/******************** TEST ********************/
	//vertex.executeLogTest();
	/******************** TEST ********************/

	this.loadAllScripts(this, this.containers.scriptsContainer, this.baseScripts, -1);
};


// This method consolidates the base configuration with the configuration passed to the player.
/***********************************************************************************************************/
VertexPlayer.prototype.consolidateConfigurationData = function(configurationData, sourceConfiguration) {
	var newConfiguration = sourceConfiguration;

	for (var property in newConfiguration) {
		newConfiguration[property] = (configurationData.hasOwnProperty(property)) ? configurationData[property] : newConfiguration[property];
	}

	return newConfiguration;
};


// This method uses recursion to load all scripts listed in the array of base scripts.
/***********************************************************************************************************/
VertexPlayer.prototype.loadAllScripts = function(source, baseContainer, scriptData, iteration){
	var iteration = (iteration !== -1) ? iteration : 0;
	var source = this;
	
	if (iteration < scriptData.length) {
		this.scripts[scriptData[iteration].script_id] = vertex.tools.loadScript(baseContainer, scriptData[iteration], function(event) {
	    	source.loadAllScripts(source, baseContainer, scriptData, (iteration + 1));
		});
	} else {
		vertex.log(VERTEX_LOG.high, "All Foundation Scripts Loaded!");
		vertex.logBreak(VERTEX_LOG.high);

		source.initializePlayerClient(source);
	}
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Post-Init Methods /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// This method is called once all base scripts are loaded and it starts the process of creating the player controller.
/***********************************************************************************************************/
VertexPlayer.prototype.initializePlayerClient = function(source) {
	source.establishCommonElements();
	source.loadPlayerTheme(source.activeConfiguration);
	source.establishEventBindings();
	source.initializePlayerController();
};


// This method establishes common handlers within the Vertex Player global object.
/***********************************************************************************************************/
VertexPlayer.prototype.establishCommonElements = function() {
	
	// If castplayer hasn't been defined yet for vertex, do it now.
	/*if (typeof vertex.castplayer === "undefined") {
		vertex.castplayer = new CastPlayer(this, {instanceName:this.instanceName+"-castplayer"});
	}*/

	// If constants haven't been defined yet for vertex, do it now.
	if (typeof vertex.browser === "undefined") {
		vertex.browser = new Browser({instanceName:this.instanceName+"-browser"});
	}

	// If events haven't been defined yet for vertex, do it now.
	if (typeof vertex.events === "undefined") {
		vertex.events = new CustomEvents({instanceName:this.instanceName+"-events"});
	}

	// If cookies haven't been defined yet for vertex, do it now.
	if (typeof vertex.cookies === "undefined") {
		vertex.cookies = new Cookies({instanceName:this.instanceName+"-cookies"});
	}

	// Define the current player instance's client data
	this.keys = new Keys(this, {instanceName:this.instanceName+"-keys"});
	this.client = new Client(this, {instanceName:this.instanceName+"-client"});
	this.ui = new UIHandler(this, {instanceName:this.instanceName+"-uihandler"});
	this.audiotracks = new AudioTracks(this, {instanceName:this.instanceName+"-audiotracks"});
	this.captions = new Captions(this, {instanceName:this.instanceName+"-captions"});

	// Backfill all queued event requests from the interface
	this.backfillEventRequests(this.queuedEventRequests);

	// Initialize all plugins now.
	this.initializeAllPlugins(this.activeConfiguration);
};


// This method instantiates and initializes all of the plugins that have already been loaded.
/***********************************************************************************************************/
VertexPlayer.prototype.initializeAllPlugins = function(pluginData) {

	this.pluginScripts = [];

	// Iterate through each plugin in the list
	for (var plugin of pluginData.plugins) {
		
		// If the script_class value is defined, we should instantiate a new instance of the plugin now.
    	if (plugin.script_class) {
    		this.handlers[plugin.script_id] = new window[plugin.script_class](this, {instanceName:plugin.script_id});
    		this.pluginScripts.push(this.handlers[plugin.script_id]);
    	}
	}

	// Backfill all queued action requests from the interface
	this.backfillActionReqeusts(this.queuedActionRequests);

	vertex.events.dispatchCustomEvent(this.main,"OnAllScriptsReady", this);
};


// This method loads the player's theme and the theme's discovered support files.
/***********************************************************************************************************/
VertexPlayer.prototype.loadPlayerTheme = function(configData){
	var baseThemesURL = vertex.foundation.baseURL + configData.themesBaseURL;

	vertex.tools.loadDataFromRemoteAPI("GET", {doc_source:this, doc_id:"theme", doc_path:baseThemesURL +"/"+ configData.themeId +"/theme.json"}, [{key:"Content-Type", value:"application/json"}], null, function(source, event) {
		if (event.status == vertex.c.HTTP_STATUS.ok) {
			if (event.readyState == vertex.c.READY_STATE.done) {
				themeDocument = JSON.parse(event.response);
				
				var styleDocument = {style_id:"theme_style", style_path:baseThemesURL + themeDocument.style};
				var layoutDocument = {doc_source:source, doc_id:"theme_layout", doc_path:baseThemesURL + themeDocument.layout};
				var behaviorDocument = {script_source:source, script_id:"theme_behavior", script_path:baseThemesURL + themeDocument.behavior};


				vertex.tools.loadStyle(source.containers.stylesContainer, styleDocument, function(event) {

					if (event.type !== "error") {
						
						//source.showLoadingSymbol(true);

						// Dispatch player styles loaded event.
						vertex.events.dispatchCustomEvent(source.main,"OnPlayerStylesLoaded", source);
					}
				});

				vertex.tools.loadDataFromRemoteAPI("GET", layoutDocument, [{key:"Content-Type", value:"application/json"}], null, function(source, event) {
					if (event.status === vertex.c.HTTP_STATUS.ok) {
						source.playerLayout = JSON.parse(event.response);

						// Dispatch player layout loaded event.
						vertex.events.dispatchCustomEvent(source.main,"OnPlayerLayoutLoaded", source.playerLayout);

						// Load default behavior now...
						vertex.tools.loadScript(source.containers.scriptsContainer, behaviorDocument, function(event) {

							if (event.type !== "error") {
								
								source.handlers.behavior = new DefaultBehavior(source, {instanceName:source.instanceName+"-behavior"});

								// Dispatch player styles loaded event.
								vertex.events.dispatchCustomEvent(source.main,"OnPlayerBehaviorLoaded", source.handlers.behavior);
							}
						});
					} else {
						//** TODO - Load default layout file
					}
				});
			}
		}
	});
};


// This method creates all of the event bindings needed for this script.
/***********************************************************************************************************/
VertexPlayer.prototype.establishEventBindings = function() {
	var source = this;
	
	if (this.main !== null) {
		this.main.addEventListener("OnPlayerReady", function(event) { source.onPlayerReady(event); });
		this.main.addEventListener("OnShowLoadingRequest", function(event) { source.onShowLoadingRequestHandler(event); });
	}
	// When the HTML5 player is destroyed, the controller is clear to destroy the instance.
	//this.main.addEventListener("OnHTML5PlayerDestroyed", function(event) { source.finalizeDestroy(); });
};


// This method initializes the player controller class.
/***********************************************************************************************************/
VertexPlayer.prototype.initializePlayerController = function() {
	var playerProperties = {
		instanceName: this.instanceName+"-playerhandler",
		mediaObjects: this.activeConfiguration.mediaObjects
	}

	this.handlers.playerHandler = new PlayerHandler(this, playerProperties);

	vertex.events.dispatchCustomEvent(this.main,"OnPlayerControllerReady", this.handlers.playerHandler);
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// Interface Methods ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// This method adds a level of protection in case events aren't ready yet.
/***********************************************************************************************************/
VertexPlayer.prototype.handleInterfaceRequest = function(requestName, requestData=null) {
	if (vertex.events) {
		vertex.events.dispatchCustomEvent(this.main, requestName, requestData);
	} else {
		this.queuedEventRequests.push({name:requestName, data:requestData});
	}
};


// This method 
/***********************************************************************************************************/
VertexPlayer.prototype.handleInterfaceAction = function(interfaceAction) {
	if (this.client) {
		interfaceAction();
	} else {
		this.queuedActionRequests.push(interfaceAction);
	}
}


// This method allows the player parent to update the media in real-time
/***********************************************************************************************************/
VertexPlayer.prototype.preloadMedia = function(mediaObjects) {
	this.handleInterfaceRequest("OnRequestMediaPreload", mediaObjects);
};


// This method allows the player parent to update the media in real-time
/***********************************************************************************************************/
VertexPlayer.prototype.updateMedia = function(mediaObjects) {
	this.handleInterfaceRequest("OnRequestMediaUpdate", mediaObjects);
};


// This method allows the player parent to 
/***********************************************************************************************************/
VertexPlayer.prototype.play = function() {
	this.handleInterfaceRequest("OnRequestMediaPlay", true);
};


// This method allows the player parent to 
/***********************************************************************************************************/
VertexPlayer.prototype.pause = function() {
	this.handleInterfaceRequest("OnRequestMediaPause", true);
};


// This method allows the player parent to 
/***********************************************************************************************************/
VertexPlayer.prototype.playPause = function() {
	this.handleInterfaceRequest("OnRequestMediaPlayPause", true);
};


// This method allows the player parent to 
/***********************************************************************************************************/
VertexPlayer.prototype.seek = function(mediaSeek) {
	this.handleInterfaceRequest("OnRequestMediaSeek", mediaSeek);
};


// This method allows the player parent to 
/***********************************************************************************************************/
VertexPlayer.prototype.mediaProgressTime = function() {
	return Math.floor((vertex.tools.objectSize(this.activeElements) > 0) ? this.activeElements.player.mediaProgressTime() : 0);
};


// This method allows the player parent to 
/***********************************************************************************************************/
VertexPlayer.prototype.mediaProgressPercentage = function() {
	return (vertex.tools.objectSize(this.activeElements) > 0) ? this.activeElements.player.mediaProgressPercentage() : 0;
};


// This method allows the player parent to 
/***********************************************************************************************************/
VertexPlayer.prototype.mediaDuration = function() {
	return (vertex.tools.objectSize(this.activeElements) > 0) ? this.activeElements.player.mediaDuration() : 0;
};


// This method allows the player parent to place event listeners on this player instance.
/***********************************************************************************************************/
VertexPlayer.prototype.establishPlayerListenerWithCallback = function(eventType, callback) {
	
	// If the main cintainer has alreeady been populated, attach listener now, otherwise put it in a queue.
	if (this.main) {
		this.main.addEventListener(eventType, function(event) {callback(event)});
	} else {
		this.queuedListenerRequests.push({type:eventType, source:callback});
	}
};


// This method allows the player parent to destroy this player instance
/***********************************************************************************************************/
VertexPlayer.prototype.destroy = function() {
	var source = this;

	this.handleInterfaceAction(function() {
		// Unload the plugins first
		source.unloadPlugins();
	});
};

// This method allows the player parent to destroy this player instance
/***********************************************************************************************************/
VertexPlayer.prototype.unloadPlugins = function() {
	for (var plugin of this.pluginScripts) {
		var status = plugin.destroy();
		vertex.log(VERTEX_LOG.priority, status, "Unloading: "+plugin.instanceName);
	}

	this.finalizeDestroy();	
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// Event Handlers //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// This method executes when the OnPlayerReady event is dispatched.
/***********************************************************************************************************/
VertexPlayer.prototype.onPlayerReady = function(event){
	vertex.logBreak(VERTEX_LOG.priority);
	vertex.log(VERTEX_LOG.priority, vertex.returnPlayerName() + " - Successfully Initialized!");
	vertex.logBreak(VERTEX_LOG.priority);
};


// Responds to all requests to show the loading symbol.
/***********************************************************************************************************/
VertexPlayer.prototype.onShowLoadingRequestHandler = function(event) {
	vertex.log(VERTEX_LOG.priority, "Show Loading Spinner: " + event.detail.data);
	this.showLoadingSymbol(event.detail.data);
};


// This method responds to the player being ready to close and initiates overall teardown of this player instance.
/***********************************************************************************************************/
VertexPlayer.prototype.finalizeDestroy = function() {
	// Fire this event to instruct all modules to teardown.
	this.handleInterfaceRequest("OnRequestDestroy", this);

	// Clears out all DOMs and then removes the primary player DOM from the base Container
	this.containers.playerContainer.innerHTML = "";
	this.containers.playerContainer.remove();

	// Removes event handler reference
	this.main = null;

	// Removes the baseContainer that was passed to the current instance of the player.
	//this.containers.baseContainer.parentNode.removeChild(this.containers.baseContainer);

	/*
	containerData.baseContainer = baseContainer;
	containerData.playerContainer = vertex.tools.createDivContainerWithProperties(containerData.baseContainer, {div_id:this.instanceName, div_class:"player-container"});
	containerData.uiContainer = vertex.tools.createDivContainerWithProperties(containerData.playerContainer, {div_id:"ui", div_class:"ui-container"});
	containerData.scriptsContainer = vertex.tools.createDivContainerWithProperties(containerData.playerContainer, {div_id:"scripts", div_class:"script-container"});
	containerData.videoContainer = vertex.tools.createDivContainerWithProperties(containerData.playerContainer, {div_id:"video", div_class:"video-container"});
	containerData.stylesContainer = vertex.tools.createDivContainerWithProperties(containerData.playerContainer, {div_id:"styles", div_class:"styles-container"});

	this.main = containerData.playerContainer;
	/*


	/*
	this.containers = {};
	this.scripts = {};
	this.handlers = {};
	this.queuedListenerRequests = [];
	this.main = null;
	*/

	// Instructs vertex to remove this instance from its list of active instances.
	vertex.removePlayerInstance(this);

	vertex.log(VERTEX_LOG.prod, "Player instance "+this.instanceName+" has been destroyed and removed from the global handler!")
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// Helper Methods ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Shows the loading symbol.
/***********************************************************************************************************/
VertexPlayer.prototype.showLoadingSymbol = function(showLoading) {

	if (showLoading) {
		vertex.tools.show(this.containers.loadingSymbol);
	} else {
		vertex.tools.hide(this.containers.loadingSymbol);
	}

	// Alert the player's listeners that loading is showing.
	vertex.events.dispatchCustomEvent(this.main, "OnShowingLoading", showLoading);
};


// Any player parent requests to estalish listeners prior to 'this.main' being established are cached for later.
/***********************************************************************************************************/
VertexPlayer.prototype.backfillListenerRequests = function(listeners) {
	for (var listener of listeners) {
		this.establishPlayerListenerWithCallback(listener.type, listener.source);
	}

	listeners = [];
};


// Backfills all event requests that arrived at the player interface prior to events script being loaded.
/***********************************************************************************************************/
VertexPlayer.prototype.backfillEventRequests = function(dispatchedEvents) {
	for (var dispatchedEvent of dispatchedEvents) {
		this.handleInterfaceRequest(dispatchedEvent.type, dispatchedEvent.source);
	}

	dispatchedEvents = [];
};


// Backfills all reqeusts from the interace that occur before full initialization for direct actions like destroy.
/***********************************************************************************************************/
VertexPlayer.prototype.backfillActionReqeusts = function(dispatchedActions) {
	for (var action of dispatchedActions) {
		this.handleInterfaceAction(action);
	}

	dispatchedActions = [];
}


// This method appends any additional scripts to those previously loaded.
/***********************************************************************************************************/
VertexPlayer.prototype.appendToAllScripts = function(scriptData, callback) {
	this.scripts[scriptData.script_id] = vertex.tools.loadScript(this.containers.scriptsContainer, scriptData, callback);
};
