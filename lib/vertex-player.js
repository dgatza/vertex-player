

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Vertex Global Wrapper
//
//  File: 			lib/vertex-player-min.js
//
//  Description:  	Acts as a global wrapper and helper for the Vertex Player controller.  Can be expanded to
//					support player controller versioning.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	None 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


(function(){
	
	// Define the wrapper
	var vertex_wrapper = {};


	// Locates the source domain of the vertex-player script by searching through all scripts.
	/***********************************************************************************************************/
	vertex_wrapper.returnSourceData = function() {
		var availableScripts = [].slice.call( document.getElementsByTagName('script') );

		// Search through all of the embed
		for (var script of availableScripts) {
			var index = script.src.search("/lib/vertex-player");

			if (index >= 0) {
                return {full_url:script.src, base_url: script.src.substring(0, index)};
			}
		}
	};


	// This method imports a script into the player's scripts DOM.
	/***********************************************************************************************************/
	vertex_wrapper.loadScript = function(container, scriptData, onready) {
	    var scriptTag = document.createElement('script');

	    scriptTag.type = "text/javascript";
	    scriptTag.src = ((scriptData.script_path.search("http") >= 0) ? "" : vertex_wrapper.baseURL) + scriptData.script_path;

	    scriptTag.onload = scriptTag.onerror = scriptTag.ontimeout = function(event) {

	    	// If a ready event was passed, pass the event to it now.
	    	if (onready) {
	    		onready(event);
	    	}
	    };

	    container.appendChild(scriptTag);

	    return scriptTag;
	};

	
	vertex_wrapper.sourceData = vertex_wrapper.returnSourceData();
	vertex_wrapper.baseURL = vertex_wrapper.sourceData.base_url;

    // TEST //
	//console.log("Source Data: ", vertex_wrapper.sourceData);

	// If the URL of this script includes a 'min' key-value pair and the value is true, then load the minified version of the controller.
	vertex_wrapper.loadMin = (vertex_wrapper.sourceData.full_url.search("min=true") >= 0);
	vertex_wrapper.timestamp = new Date().getTime();
	vertex_wrapper.script_data = {script_family:"vertex.foundation", script_id:"controller", script_path:"/lib/vertex-controller"+(vertex_wrapper.loadMin ? "-min" : "")+".js"+"?h="+vertex_wrapper.timestamp, script_class:null};
	vertex_wrapper.controller = vertex_wrapper.loadScript(document.head, vertex_wrapper.script_data, function(event) {
		
        // TEST //
		//console.log("Vertex Controller: "+((event.type === "error") ? "Failed to Load!" : "Loaded Successfully"), vertex);
	});

})();
