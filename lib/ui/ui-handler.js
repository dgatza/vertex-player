

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  UI Handler Class
//
//  File: 			lib/ui/ui-handler.js
//
//  Description: 	*TODO
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// UIHandler Constructor
/***********************************************************************************************************/
function UIHandler(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	this.establishModuleVariables();
	this.establishEventBindings();
	this.createConnectionComponent();

	vertex.logNewInstance(this.instanceName);
}


// Establishes boilerplate variables and any other variables that will have module scope.
/***********************************************************************************************************/
UIHandler.prototype.establishModuleVariables = function() {
	this.uiData = { controls: null, menus: null, connected: null, suppressed:true, hidden: false, fullscreen: false, status:{session_ready: false, session_started:false, controls_ready: false, menus_ready: false}};
	
	this.mousePosition = { x:0, y:0 };

	this.uiShowIntervalObject = null;
	this.uiShowInterval = 3000;
	this.uiActivationDistance = 60.0;
	this.uiQuickFade = 200;
	
	this.durationUpdated = false;

	// Stores a local copy of the active config and active media object for use within this plugin.
	this.activeElements = this.sourceInstance.activeElements;
};


// Establish the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
UIHandler.prototype.establishEventBindings = function() {
	var source = this;
	
	if (this.sourceInstance.main !== null) {
		this.sourceInstance.main.addEventListener("OnPlayerLayoutLoaded", function(event) { source.createPlayerUI(event); });
		this.sourceInstance.main.addEventListener("OnSessionReady", function(event) { source.onSessionReady(event); });
		this.sourceInstance.main.addEventListener("OnControlsReady", function(event) { source.onControlsReady(event); });
		this.sourceInstance.main.addEventListener("OnMenusReady", function(event) { source.onMenusReady(event); });
		this.sourceInstance.main.addEventListener("OnAutoPlayFail", function(event) { source.onAutoPlayFail(event); });

		this.sourceInstance.main.addEventListener("OnFullScreenComponentClicked", function(event) { source.fullScreenRequestHandler(event); });
		this.sourceInstance.main.addEventListener("OnMediaCanPlay", function(event) { source.onMediaCanPlay(event); });
		this.sourceInstance.main.addEventListener("OnMediaBuffering", function(event) { source.onMediaBuffering(event); });
		this.sourceInstance.main.addEventListener("OnMediaComplete", function(event) { source.onMediaComplete(event); });
		this.sourceInstance.main.addEventListener("OnAllMediaCompleted", function(event) { source.onAllMediaCompleted(event); });
		this.sourceInstance.main.addEventListener("OnThrowError", function(event) { source.onThrowError(event); });
		this.sourceInstance.main.addEventListener("OnClearError", function(event) { source.onClearError(event); });
		this.sourceInstance.main.addEventListener("OnNativePlayerClose", function(event) { source.onNativePlayerClosed(event); });
		this.sourceInstance.main.addEventListener("OnRequestDestroy", function(event) { source.destroy(event); });

		// Populates Active Elements
		this.sourceInstance.main.addEventListener("OnMediaPlaying", function(event) { source.onTimelineUpdating(event); });
		//this.sourceInstance.main.addEventListener("OnModelReady", function(event) { source.onModelAvailable(event); });

		// Display events
		this.sourceInstance.main.addEventListener("OnShowLoadingRequest", function(event) { source.onShowLoadingRequestHandler(event); });
		this.sourceInstance.main.addEventListener("OnShowControlsRequest", function(event) {source.onShowControlsRequestHandler(event)});
		this.sourceInstance.main.addEventListener("OnConnectedStateChanged", function(event) { source.connectedRequestHandler(event); });

		// Bind the window's mouse move events to this module's mouse handler.
		this.sourceInstance.main.addEventListener("mousemove", function(event) { source.mouseMoveHandler(event); });

		// Listen to the document's click listener
		document.addEventListener("click", function(event) { source.mouseClickHandler(event); });
	}
};


// Destroy the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
UIHandler.prototype.destroyEventBindings = function() {
	var source = this;
	
	if (this.sourceInstance.main !== null) {
		this.sourceInstance.main.removeEventListener("OnPlayerLayoutLoaded", function(event) { source.createPlayerUI(event); });
		this.sourceInstance.main.removeEventListener("OnSessionReady", function(event) { source.onSessionReady(event); });
		this.sourceInstance.main.removeEventListener("OnControlsReady", function(event) { source.onControlsReady(event); });
		this.sourceInstance.main.removeEventListener("OnMenusReady", function(event) { source.onMenusReady(event); });

		this.sourceInstance.main.removeEventListener("OnFullScreenComponentClicked", function(event) { source.fullScreenRequestHandler(event); });
		this.sourceInstance.main.removeEventListener("OnMediaCanPlay", function(event) { source.onMediaCanPlay(event); });
		this.sourceInstance.main.removeEventListener("OnMediaBuffering", function(event) { source.onMediaBuffering(event); });
		this.sourceInstance.main.removeEventListener("OnMediaComplete", function(event) { source.onMediaComplete(event); });
		this.sourceInstance.main.removeEventListener("OnAllMediaCompleted", function(event) { source.onAllMediaCompleted(event); });
		this.sourceInstance.main.removeEventListener("OnThrowError", function(event) { source.onThrowError(event); });
		this.sourceInstance.main.removeEventListener("OnClearError", function(event) { source.onClearError(event); });
		this.sourceInstance.main.removeEventListener("OnNativePlayerClose", function(event) { source.onNativePlayerClosed(event); });
		this.sourceInstance.main.removeEventListener("OnRequestDestroy", function(event) { source.destroy(event); });

		// Populates Active Elements
		this.sourceInstance.main.removeEventListener("OnMediaPlaying", function(event) { source.onTimelineUpdating(event); });
		//this.sourceInstance.main.removeEventListener("OnModelReady", function(event) { source.onModelAvailable(event); });

		// Display events
		this.sourceInstance.main.removeEventListener("OnShowLoadingRequest", function(event) { source.onShowLoadingRequestHandler(event); });
		this.sourceInstance.main.removeEventListener("OnShowControlsRequest", function(event) {source.onShowControlsRequestHandler(event)});
		this.sourceInstance.main.removeEventListener("OnConnectedStateChanged", function(event) { source.connectedRequestHandler(event); });

		// Bind the window's mouse move events to this module's mouse handler.
		this.sourceInstance.main.removeEventListener("mousemove", function(event) { source.mouseMoveHandler(event); });

		// Listen to the document's click listener
		document.removeEventListener("click", function(event) { source.mouseClickHandler(event); });
	}
};


// 
/***********************************************************************************************************/
UIHandler.prototype.createPlayerUI = function(event) {
	this.layoutData = event.detail.data;

	this.createPlayerControls();
	this.createPlayerMenus();
};


// Creates the player's primary controls.
/***********************************************************************************************************/
UIHandler.prototype.createPlayerControls = function() {

	// Sets the overall autohide interval for the UI.
	this.uiShowInterval = this.layoutData.features.controls.properties.autohide.showInterval;

	this.uiData.controls = new ControlsHandler(this.sourceInstance, {instanceName:this.instanceName+"-controlshandler", layoutData: this.layoutData});
};


// Creates the player's menus.
/***********************************************************************************************************/
UIHandler.prototype.createPlayerMenus = function() {
	
	// Sets the overall autohide interval for the UI.
	this.uiShowInterval = this.layoutData.features.controls.properties.autohide.showInterval;

	this.uiData.menus = new MenuHandler(this.sourceInstance, {instanceName:this.instanceName+"-menuhandler", layoutData: this.layoutData});
};


// 
/***********************************************************************************************************/
UIHandler.prototype.onControlsReady = function() {
	this.uiData.status.controls_ready = true;

	if (this.uiData.status.session_ready) {
		this.showAllHideableUI();
	}
};


// 
/***********************************************************************************************************/
UIHandler.prototype.onMenusReady = function() {
	this.uiData.status.menus_ready = true;
};


// 
/***********************************************************************************************************/
UIHandler.prototype.onSessionReady = function() {
	this.uiData.status.session_ready = true;

	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnShowLoadingRequest", false);
	
	if (this.uiData.status.controls_ready) {
		
		// If it's mobile, then act accordingly
		//if (this.sourceInstance.client.supportsTouches()) {
			this.showAllHideableUI();
		//}
	}
};


// 
/***********************************************************************************************************/
UIHandler.prototype.onAutoPlayFail = function() {
	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnShowLoadingRequest", false);

	if (this.sourceInstance.client.clientData.supportsTouches) {
		this.sourceInstance.containers.loadingSymbol.style.display = null;
	}
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// General Controls Handlers /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Handles the mousemove event
/***********************************************************************************************************/
UIHandler.prototype.mouseMoveHandler = function(event) {

    if (!this.uiData.suppressed) {
    	var currentPosition = null;
    	var vectorDistance = 0;

        currentPosition = { x: event.clientX, y: event.clientY };
        vectorDistance = vertex.tools.measureVectorDistance(this.mousePosition, currentPosition);

        // Determines whether this vector distance is high enough to activate the controls
        if (vectorDistance > this.uiActivationDistance) {
            this.mousePosition = currentPosition;

            // If the mouse is over a UI hotspot, then show controls with no timeout
            if (this.isContainedInHotspot(event.target)) {
            	this.clearFadeOutInterval();
            	this.showAllHideableUI();
        	
        	// If the mouse is not over a hotspot, show the controls with a timeout
        	} else {
            	this.showUIWithTimeout();
        	}
        }
    }
};


// 
/***********************************************************************************************************/
UIHandler.prototype.mouseClickHandler = function(event) {
	//** TESTING
	// vertex.log(VERTEX_LOG.dev, event, "CLICKED");
	//** TESTING

	// If the mouse is over a UI hotspot, then show controls with no timeout
	if (!this.uiData.suppressed) {
	    vertex.log(VERTEX_LOG.dev, event, "NOT SUPPRESSED");
	    
		if (!this.isContainedInHotspot(event.target)) {
	    	vertex.log(VERTEX_LOG.dev, event, "NOT HOTSPOT");
	    	
			if (!this.uiData.hidden) {
		    	if ( !this.uiData.menus.isHidden() ) {
		    		this.uiData.menus.autohideMenus(true, this.uiQuickFade);
		    	} else {
		    		this.hideAllHideableUI(this.uiQuickFade);
		    	}
	    	} else {
	    		this.showUIWithTimeout();
	    	}
		}
	}
};


// 
/***********************************************************************************************************/
UIHandler.prototype.onMediaCanPlay = function(event) {
	if (this.uiData.suppressed) {
		this.uiData.suppressed = false;

		vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnShowLoadingRequest", false);

		this.showUIWithTimeout();
	}
};


// 
/***********************************************************************************************************/
UIHandler.prototype.isContainedInHotspot = function(target) {
	return (this.uiData.controls.isContainedInHotspot(target) || this.uiData.menus.isContainedInHotspot(target));
};


// 
/***********************************************************************************************************/
UIHandler.prototype.onMediaBuffering = function(event) {
	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnShowLoadingRequest", true);
};


// 
/***********************************************************************************************************/
UIHandler.prototype.onTimelineUpdating = function(event) {
	if (!this.uiData.status.session_started) {
		this.uiData.status.session_started = true;
		this.showUIWithTimeout();
	}
};


// Updates the interface once a single session has completed.
/***********************************************************************************************************/
UIHandler.prototype.onMediaComplete = function(event) {
	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnShowLoadingRequest", true);

	this.resetStatus();
};


// Shows the controls once all media had completed.
/***********************************************************************************************************/
UIHandler.prototype.onAllMediaCompleted = function(event) {
	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnShowLoadingRequest", false);

	this.suppressAllHideableUI(false, 100);
};


// Resets a session's status variables.
/***********************************************************************************************************/
UIHandler.prototype.resetStatus = function(event) {
	this.uiData.status.session_started = false;
	this.uiData.status.session_ready = false;
	this.uiData.status.controls_ready = false;
	this.uiData.status.menus_ready = false;
};


// When an error displays to the user, the controls should be suppressed so the screen doesn't look confusing.
/***********************************************************************************************************/
UIHandler.prototype.onThrowError = function(event) {
	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnShowLoadingRequest", false);
	this.suppressAllHideableUI(true, 0);
};


// When an error is cleared, the controls should no longer be suppressed.
/***********************************************************************************************************/
UIHandler.prototype.onClearError = function(event) {
	this.suppressAllHideableUI(false, 0);
};


// If the native player is closed, show the controls now.
/***********************************************************************************************************/
UIHandler.prototype.onNativePlayerClosed = function(event) {
	this.showAllHideableUI();
};


// If the loader is showing, suppress controls now.
/***********************************************************************************************************/
UIHandler.prototype.onShowLoadingRequestHandler  = function(event) {
	showLoading = event.detail.data;

	this.suppressAllHideableUI(showLoading, 0);
};


// When the controls are requested, the should display according to the passed boolean.
/***********************************************************************************************************/
UIHandler.prototype.onShowControlsRequestHandler = function(event) {
	var showControls = event.detail.data;

	this.suppressAllHideableUI( (!showControls), 100);
};


// Show the UI, applying a fadeOut interval to the action.
/***********************************************************************************************************/
UIHandler.prototype.showUIWithTimeout = function(timeoutIntervalOverride=-1) {
	
	var source = this;
	var timeoutInterval = (timeoutIntervalOverride > -1) ? timeoutIntervalOverride : this.uiShowInterval;
	
	this.showAllHideableUI();

    this.clearFadeOutInterval();

    this.uiShowIntervalObject = setTimeout(function() {
        source.hideAllHideableUI();
    }, timeoutInterval);
};


// Supresses all UI on the player despite any autohide functionality it's already managing.
/***********************************************************************************************************/
UIHandler.prototype.suppressAllHideableUI = function(suppressUI, hideInterval=-1) {
	if (suppressUI) {
		this.hideAllHideableUI(hideInterval);
	} else {
		this.showAllHideableUI(hideInterval);
	}
	
	this.uiData.suppressed = suppressUI;
};


// Consolidates all UI systems into a single show call.
/***********************************************************************************************************/
UIHandler.prototype.showAllHideableUI = function(hideInterval=-1) {
    
    // Show all UI systems
    this.uiData.hidden = false;

    if (this.uiData.controls) {
    	this.uiData.controls.autohideControls(false, hideInterval);
    }
};


// Consolidates all UI systems into a single hide call.
/***********************************************************************************************************/
UIHandler.prototype.hideAllHideableUI = function(hideInterval=-1) {
	
	// Hide all UI systems
	this.uiData.hidden = true;
	
	if (this.uiData.controls) {
		this.uiData.controls.autohideControls(true, hideInterval);
	}
	

	if (this.uiData.menus) {
		this.uiData.menus.autohideMenus(true, hideInterval);
	}
};


// Checks and clears fade-out interval
/***********************************************************************************************************/
UIHandler.prototype.clearFadeOutInterval = function() {
    
    if (this.uiShowIntervalObject) {
        clearTimeout(this.uiShowIntervalObject);
    }
};


// When the fullscreen button is pressed, this method toggles the fullscreen state.
/***********************************************************************************************************/
UIHandler.prototype.fullScreenRequestHandler = function(event) {
	this.toggleFullScreen();
};


// 
/***********************************************************************************************************/
UIHandler.prototype.connectedRequestHandler = function(event) {
	// Note: Follows this format:
	// {connected:true, message:"The player is now connected!"}

	var request = event.detail.data;

	this.showConnectionComponent(request, request.timeout, request.fadeinterval);
};


// 
/***********************************************************************************************************/
UIHandler.prototype.createConnectionComponent = function() {
	this.uiData.connected = {};
	this.uiData.connected.timeout = null;
	this.uiData.connected.container = vertex.tools.createDivContainerWithProperties(this.sourceInstance.containers.uiContainer, {div_id:"connectedComponent", div_class: "connected_container"});
	this.uiData.connected.status = vertex.tools.createDivContainerWithProperties(this.uiData.connected.container, {div_id:"connectedStatus", div_class: "connected_status"});
	this.uiData.connected.message = vertex.tools.createDivContainerWithProperties(this.uiData.connected.container, {div_id:"connectedMessage", div_class: "connected_message"});

	vertex.tools.hide(this.uiData.connected.container);
};


// 
/***********************************************************************************************************/
UIHandler.prototype.showConnectionComponent = function(componentData, timeoutInterval=5000, fadeInterval=800) {
	var source = this;

	this.uiData.connected.message.innerHTML = componentData.message;
	
	if (componentData.connected) {
		this.uiData.connected.status.classList.add("connected");
	} else {
		this.uiData.connected.status.classList.remove("connected");
	} 

	vertex.tools.fadeIn(this.uiData.connected.container, fadeInterval);

	if (timeoutInterval > -1) {
		if (this.uiData.connected.timeout !== null) {
			clearTimeout(this.uiData.connected.timeout);
			this.uiData.connected.timeout = null;
		}

		this.uiData.connected.timeout = setTimeout(function() {
	        vertex.tools.fadeOut(source.uiData.connected.container, fadeInterval);
	    }, timeoutInterval);
	}
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Fullscreen Handlers ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Creates a single point that can be hit to handle both fullscreen and no fullscreen
/***********************************************************************************************************/
UIHandler.prototype.toggleFullScreen = function() {
	var currentState = vertex.tools.inFullScreen();

	this.fullScreen(!currentState, this.sourceInstance.main);
};


// Creates a single point that can be hit to handle both fullscreen and no fullscreen
/***********************************************************************************************************/
UIHandler.prototype.fullScreen = function(fullscreen, elementObject = null) {
	if (fullscreen) {
		this.enterFullScreen(elementObject);
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnFullScreenStateChanged", {fullscreen: !vertex.tools.inFullScreen()});
	} else {
		this.exitFullScreen();
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnFullScreenStateChanged", {fullscreen: !vertex.tools.inFullScreen()});
	}
};


// Moves an element into fullscreen.
/***********************************************************************************************************/
UIHandler.prototype.enterFullScreen = function(elementObject) {
	this.uiData.fullscreen = true;
	
	if (elementObject.requestFullscreen) {
		vertex.log(VERTEX_LOG.medium, "Requesting Fullscreen STD");
		elementObject.requestFullscreen();
	} else if (elementObject.mozRequestFullScreen) {
		vertex.log(VERTEX_LOG.medium, "Requesting Fullscreen MOZ");
		elementObject.mozRequestFullScreen();
	} else if (elementObject.webkitRequestFullScreen) {
		vertex.log(VERTEX_LOG.medium, "Requesting Fullscreen WEB");
		elementObject.webkitRequestFullScreen();
	} else if (elementObject.msRequestFullscreen) {
		vertex.log(VERTEX_LOG.medium, "Requesting Fullscreen MS");
		elementObject.msRequestFullscreen();
	}
};


// Moves the page out of fullscreen.
/***********************************************************************************************************/
UIHandler.prototype.exitFullScreen = function() {
	this.uiData.fullscreen = false;

	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.msExitFullscreen) {
    	document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
    	document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
    	document.webkitCancelFullScreen();
    }
};


// 
/************************************************************************************/
UIHandler.prototype.destroy = function(event) {
	this.destroyEventBindings();

};

