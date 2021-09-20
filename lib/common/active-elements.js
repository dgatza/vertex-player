

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Active Elements Handler Class
//
//  File: 			lib/common/active-elements.js
//
//  Description: 	This class operates as a simple model that contains a reference to the active player elements
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// ActiveElements Constructor
/***********************************************************************************************************/
function ActiveElements(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	this.establishModuleVariables();
	this.establishEventBindings();

	// All Vertex Player classes should report their instances to log when ready.
	vertex.logNewInstance(this.instanceName);
}


// Establishes boilerplate variables and any other variables that will have module scope.
/***********************************************************************************************************/
ActiveElements.prototype.establishModuleVariables = function() {
	this.player = null;
	this.config = null;
	this.media = null;
}


// Establish the bindings that the player handler should be tapped into.
/************************************************************************************/
ActiveElements.prototype.establishEventBindings = function() {
	var source = this;

};
