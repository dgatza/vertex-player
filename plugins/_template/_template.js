

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Template Plugin Class
//
//  File: 			lib/plugins/_template.js
//
//  Description: 	This class serves as a template plugin that can be used to create new custom plugins for 
//  				the Vertex base player.  All Vertex Player plugins are self-executing and are intrinsically
//  				tied into the Vertex Player ecosystem.  
//  				
//  				As a result, all Vertex Player data and player events are available to plugins, where the
//  				plugin designer can plug into this data as they see fit.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Template Constructor
/***********************************************************************************************************/
function Template(sourceInstance, instanceProperties) {
	// All Vertex Player classes should include an instanceName and startTime declaration and reference to the player instance.
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	// Tying into player events is how your plugin stays plugged into the inner workings of the player.
	this.establishEventBindings();

	// All Vertex Player classes should report their instances to log when ready.
	vertex.logNewInstance(this.instanceName);
}


// Establishes bindings to any needed events the player generates
/***********************************************************************************************************/
Template.prototype.establishEventBindings = function() {
	
	// This is an example of an event binding within Vertex Player
	vertex.main.addEventListener("OnPlayerReady", this.dispatchEvent);
}


// Dispatching custom events is how you notify any other custom plugin that something is happening.
/***********************************************************************************************************/
Template.prototype.dispatchEvent = function() {
	vertex.events.dispatchCustomEvent(vertex.main,"OnTemplateReady", {data:"DATA_TO_SEND"});
}


// Plugins have full access to Vertex Player's global data, this method ties into the template plugin object.
/***********************************************************************************************************/
Template.prototype.getTemplateData = function() {
	return vertex.foundation.handlers.template;
}
