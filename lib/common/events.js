	

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Events Class
//
//  File: 			lib/common/events.js
//
//  Description:   	This class is responsible for handling all of the player's custom events, including the
//                  creationg of event listeners.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Events Constructor
/***********************************************************************************************************/
function CustomEvents(instanceProperties) {
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

    this.establishModuleVariables();

	vertex.logNewInstance(this.instanceName);
}


// Establishes boilerplate variables and any other variables that will have module scope.
/***********************************************************************************************************/
CustomEvents.prototype.establishModuleVariables = function() {
    this.eventList = {};
    this.listenerList = {};
};


// This method is used to create new listeners for specific events within the player.
/***********************************************************************************************************/
CustomEvents.prototype.addEventListener = function (instance, target, type, listener) {
    if (typeof this.listenerList[instance] === "undefined") {
        this.listenerList[instance] = [];
    }

    this.listenerList[instance].push({target:target, type:type, listener:listener});

    target.addEventListener(type, listener);
};


// This method removes all established listeners by player instance.
/***********************************************************************************************************/
CustomEvents.prototype.removeAllListenersByInstance = function (instance) {
    for (var listener of this.listenerList[instance]) {
        listener.target.removeEventListener(listener.type, listener.listener);
    }
};


// Dispatches a custom event using the passed values
/***********************************************************************************************************/
CustomEvents.prototype.dispatchCustomEvent = function(eventOrigin, eventName, eventData=null) {
	
    // Note: Creates a global event that relays all incoming events into a single listener.  
    // If the incoming event is a global event, don't do this...creates an endless loop
    if (eventName !== "OnInstanceEvents") {
        vertex.events.dispatchCustomEvent(eventOrigin, "OnInstanceEvents", {event_name: eventName, event_data: eventData});
    }

    // If the origin and name have been passed, then it's a valid event. Data is optional, but important.
    if (eventOrigin && eventName) {
    	var eventObject = this.defineCustomEventObjectWithNameAndData(eventName, eventData);

        if (typeof this.eventList[eventOrigin.id] === "undefined") {
            this.eventList[eventOrigin.id] = [];
        }

        var lastElement = (this.eventList[eventOrigin.id].length > 0) ? this.eventList[eventOrigin.id][this.eventList[eventOrigin.id].length - 1] : {event_name: "", event_data: ""};

        // If the current event name is not the same as the last one, then proceed to store this event.
        if (eventName !== lastElement.event_name) {
            this.eventList[eventOrigin.id].push({event_name: eventName, event_data: eventData});

            //If this array is larger than 250 elements, remove the oldest element.
            if (this.eventList[eventOrigin.id].length > 250) {
                this.eventList[eventOrigin.id].shift();
            }
        }

    	// If the event is fully defined, dispatch the event now.
    	if (eventObject) {
        	eventOrigin.dispatchEvent(eventObject);
    	} else {
    		vertex.logError("Custom event attempted but the event object returned null.");
    	}
	} else {
		vertex.logError("Custom event attempted but with insufficient data.");
		vertex.logError("Event Origin: ", eventOrigin);
		vertex.logError("Event Name: ", eventName);
		vertex.logError("Event Data: ", eventData);
	}
};


// Dynamically defines a custom event object 
/***********************************************************************************************************/
CustomEvents.prototype.defineCustomEventObjectWithNameAndData = function(eventName, eventData) {
	var eventDataFull = {base: vertex, data: eventData};
	var eventObject = null;

	// If the browser is anything but IE, use the CustomEvent() method.
    if (!vertex.tools.clientBrowserIsMSIE) {
        eventObject = new CustomEvent(
            eventName, 
            {
                detail: eventDataFull,
                bubbles: true,
                cancelable: true
            }
        );

    // If the browser is IE, then use the createEvent() method.
	} else {
        eventObject = document.createEvent("CustomEvent");
        eventObject.initCustomEvent( eventName, true, true, eventDataFull );
	}

    return eventObject;
};
