

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Controls Handler Class
//
//  File: 			lib/ui/controls-handler.js
//
//  Description: 	This class is responsible for creating the entire player controls rack based on the 
//  				theme layout and then providing any listener of the 'OnControlsReady' event an interface
//  				to those controls for custom manipulation.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	lib/ui/component.js
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Controls Handler Constructor
/***********************************************************************************************************/
function ControlsHandler(sourceInstance, instanceProperties){
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();
	this.layoutData = instanceProperties.layoutData;

	// Establish common variables and listeners
	this.establishModuleVariables();
	this.establishEventBindings();

	// All Vertex Player classes should report their instances to log when ready.
	vertex.logNewInstance(this.instanceName);
}


// Establishes boilerplate variables and any other variables that will have module scope.
/***********************************************************************************************************/
ControlsHandler.prototype.establishModuleVariables = function() {
	this.controlsData = { object: null, hotspots: [], sections: {}, components: {}, off: false, hidden: false, autohide:{}};

	// Stores a local copy of the active config and active media object for use within this plugin.
	this.activeElements = this.sourceInstance.activeElements;
};


// Establish the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
ControlsHandler.prototype.establishEventBindings = function() {
	var source = this;

	// If there are no controls defined yet for this instance, do this now.  Otherwise don't so that controls aren't created on each video.
	if (!this.controlsData.object) {

		// Wait until the player behavior has been loaded.
		this.sourceInstance.main.addEventListener("OnPlayerBehaviorLoaded", function(event){ source.createControls(source.layoutData, event.detail.data); });
		this.sourceInstance.main.addEventListener("OnRequestDestroy", function(event){ source.destroy(); });
	}
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Component Initialization //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Creates the player's custom controls using the layout data retrieved from global data object 
/***********************************************************************************************************/
ControlsHandler.prototype.createControls = function(layoutData, baseData) {
	var source = this;

	this.controlsData.autohide = layoutData.features.controls.properties.autohide;

	// Creates the container 
	var controlsContainer = vertex.tools.createDivContainerWithProperties(this.sourceInstance.containers.uiContainer, {div_id: layoutData.features.controls.id, div_class: layoutData.features.controls.type});
    controlsContainer.classList.add(layoutData.features.controls.class);

    var controlsHolder = vertex.tools.createDivContainerWithProperties(controlsContainer, {div_id: "controlsHolder", div_class: "controls_holder"});

    this.controlsData.object = controlsContainer;
    this.storeIfHotspot(controlsContainer, layoutData.features.controls.hotSpot);

    this.hideControls(true, 0.0);

	// Creates the sections and their corresponding components
	var sectionList = layoutData.features.controls.sections;
	
	// Iterate through each section in the configuration.
	for (var section of sectionList) {
		
		// Create the current section DOM
		var controlsSection = vertex.tools.createDivContainerWithProperties(controlsHolder, {div_id: section.id, div_class: section.type});
		controlsSection.classList.add(section.class);

		// Store the section for later
		this.controlsData.sections[section.id] = controlsSection;
		this.storeIfHotspot(controlsSection, section.hotSpot);

		// Creates this section's components
		var componentList = section.components;
		
		// Iterate through each component within the current section.
		for (var component of componentList) {
			
			var componentData = new Component(this.sourceInstance, {instanceName:this.instanceName+"-"+component.id, baseData:baseData}, component);

			// Stores this component in an associative array for later use 
			this.controlsData.components[component.id] = componentData;
			this.storeIfHotspot(componentData.object, component.hotSpot);

			var componentObject = componentData.getComponentObject();
			controlsSection.appendChild(componentObject);
		}
	}

	// If controls are set to false in the active configuration, hide them now.
    if (!this.activeElements.config.controls) {
    	this.controlsFeatureOff(true);
	}

	// Dispatch event that controls are ready.
    vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnControlsReady", this);
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// General Controls Handlers /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 
/***********************************************************************************************************/
ControlsHandler.prototype.storeIfHotspot = function(domElement, componentData) {
	if (componentData) {
		this.controlsData.hotspots.push(domElement);
	}
};


// Hides the controls upon command if autohide allowed
/***********************************************************************************************************/
ControlsHandler.prototype.autohideControls = function(hideControls, overrideInterval=-1) {
	
	if (hideControls) {

		// Only autohide controls if allowed
		if (this.controlsData.autohide.status) {	
			this.hideControls(hideControls, overrideInterval);
		}
	} else {
		this.hideControls(hideControls, overrideInterval);
	}
};


// Hides the controls upon command
/***********************************************************************************************************/
ControlsHandler.prototype.hideControls = function(hideControls, overrideInterval=-1) {
    
    if (hideControls !== this.controlsData.hidden) {
	    
	    this.controlsData.hidden = hideControls;

	    if (hideControls) {
	        vertex.tools.fadeOut(this.controlsData.object, ((overrideInterval > -1) ? overrideInterval : this.controlsData.autohide.fadeOutInterval));
	    } else {
	        vertex.tools.fadeIn(this.controlsData.object, ((overrideInterval > -1) ? overrideInterval : this.controlsData.autohide.fadeInInterval));
	    }
	}
};


// Hides the controls feature overall, used for single use 'never on' situations or transitions
/***********************************************************************************************************/
ControlsHandler.prototype.controlsFeatureOff = function(hideFeature) {
    this.controlsData.off = hideFeature;

    if (hideFeature) {
        this.checkAndClearFadeOutInterval();
        this.hideControls(hideFeature);
    }
};


// Returns whether the controls are hidden or not.
/***********************************************************************************************************/
ControlsHandler.prototype.isOff = function() {
	return this.controlsData.off;
};


// Returns whether the controls are hidden or not.
/***********************************************************************************************************/
ControlsHandler.prototype.isHidden = function() {
	return this.controlsData.hidden;
};


// Allows a parent attach a listener to these controls.
/***********************************************************************************************************/
ControlsHandler.prototype.addEventListener = function(event, eventListener) {
	this.controlsData.object.addEventListener(event, function(event) { eventListener(event); });
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Helper Functions ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 
/***********************************************************************************************************/
ControlsHandler.prototype.getSection = function(sectionId) {
	return this.menuData.sections[sectionId];
};


//
/***********************************************************************************************************/
ControlsHandler.prototype.getComponent = function(componentId) {
	return this.controlsData.components[componentId];
};


//
/***********************************************************************************************************/
ControlsHandler.prototype.isContainedInHotspot = function(domElement) {
	//vertex.log(VERTEX_LOG.prod, this.controlsData.hotspots, "hotspots");
	
	for (var hotspot of this.controlsData.hotspots) {
		if (hotspot === domElement || hotspot.contains(domElement)) {
			return true;
		}
	}

	return false;
};


/***********************************************************************************************************/
ControlsHandler.prototype.toggleFunctionalState = function(component) {
	component.toggleFunctionalState();
};


/***********************************************************************************************************/
ControlsHandler.prototype.destroyAllControls = function(component) {
	
	for (var component in this.controlsData.components) {
		this.controlsData.components[component].destroy();
	}
};


/***********************************************************************************************************/
ControlsHandler.prototype.destroy = function() {
	this.destroyAllControls();
};
