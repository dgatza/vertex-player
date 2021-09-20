

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Keys Handler Class
//
//  File: 			lib/common/keys.js
//
//  Description: 	This class establishes all of the bindings between the user's keyboard and the player.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Keys Constructor
/***********************************************************************************************************/
function Keys(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	this.establishEventBindings();

	// All Vertex Player classes should report their instances to log when ready.
	vertex.logNewInstance(this.instanceName);
}


// Establish the bindings that the player handler should be tapped into.
/************************************************************************************/
Keys.prototype.establishEventBindings = function() {
	var source = this;
	
	document.body.addEventListener("keydown", function(event) { source.keyHandler(event); });
}


// Establish the bindings that the player handler should be tapped into.
/************************************************************************************/
Keys.prototype.keyHandler = function(event) {
	
    vertex.log(VERTEX_LOG.dev, event, "Key Press");

    vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnKeyPress", {key: event.code});

    var key = event.code;

	// Play / Pause
	if (key === vertex.c.KEY_CODE.space) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnKeyPressSpace", true);

	// RW
	} else if (key === vertex.c.KEY_CODE.arrow_left) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnKeyPressArrowLeft", true);

	// FF
	} else if (key === vertex.c.KEY_CODE.arrow_right) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnKeyPressArrowRight", true);

	// VOLUME +
	} else if (key === vertex.c.KEY_CODE.arrow_up) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnKeyPressArrowDown", true);

	// VOLUME -
	} else if (key === vertex.c.KEY_CODE.arrow_down) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnKeyPressArrowUp", true);

	// Escape
	} else if (key === vertex.c.KEY_CODE.escape) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnKeyPressEscape", true);
	}
}
