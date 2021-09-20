

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Menu Handler Class
//
//  File: 			lib/ui/menu-handler.js
//
//  Description: 	This class is responsible for creating all menus based on the theme layout and then 
//  				providing any listener of the 'OnMenusReady' event an interface to those menus for 
//  				custom manipulation.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	lib/ui/component.js
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Menus Handler Constructor
/***********************************************************************************************************/
function MenuHandler(sourceInstance, instanceProperties){
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
MenuHandler.prototype.establishModuleVariables = function() {
	this.menuData = { object: null, hotspots: [], sections: {}, components: {}, hidden: false, autohide:{}};
	
	// Stores a local copy of the active config and active media object for use within this plugin.
	this.activeElements = this.sourceInstance.activeElements;
};


// Establish the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
MenuHandler.prototype.establishEventBindings = function() {
	var source = this;

	// If there are no controls defined yet for this instance, do this now.  Otherwise don't so that controls aren't created on each video.
	if (!this.menuData.object) {

		// Wait until the player behavior has been loaded.
		this.sourceInstance.main.addEventListener("OnPlayerBehaviorLoaded", function(event){ source.createMenus(source.layoutData, event.detail.data); });
	}

	this.sourceInstance.main.addEventListener("OnRequestDestroy", function(event) { source.destroy(event); });
};


// Destroy the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
MenuHandler.prototype.destroyEventBindings = function() {
	var source = this;

	if (this.sourceInstance.main !== null) {
		// Wait until the player behavior has been loaded.
		this.sourceInstance.main.removeEventListener("OnPlayerBehaviorLoaded", function(event){ source.createMenus(source.layoutData, event.detail.data); });
		this.sourceInstance.main.removeEventListener("OnRequestDestroy", function(event) { source.destroy(event); });
	}
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Component Initialization //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Creates the player's custom controls using the layout data retrieved from global data object 
/***********************************************************************************************************/
MenuHandler.prototype.createMenus = function(layoutData, baseData) {
	var source = this;

	this.menuData.autohide = layoutData.features.menus.properties.autohide;

	// Creates the container 
	var menusContainer = vertex.tools.createDivContainerWithProperties(this.sourceInstance.containers.uiContainer, {div_id: layoutData.features.menus.id, div_class: layoutData.features.menus.type});
    menusContainer.classList.add(layoutData.features.menus.class);

    this.menuData.object = menusContainer;
    this.storeIfHotspot(menusContainer, layoutData.features.menus.hotSpot);

    this.hideMenus(true, 0.0);

	// Creates the sections and their corresponding components
	var sectionList = layoutData.features.menus.sections;
	
	// Iterate through each section in the configuration.
	for (var section of sectionList) {
		
		// Create the current section DOM
		var menuSection = vertex.tools.createDivContainerWithProperties(menusContainer, {div_id: section.id, div_class: section.type});
		menuSection.classList.add(section.class);

		// Store the section for later
		this.menuData.sections[section.id] = menuSection;
		this.storeIfHotspot(menuSection, section.hotSpot);

		// Creates this section's components
		var componentList = section.components;			
		
		// Iterate through each component within the current section.
		for (var component of componentList) {
			
			var componentData = new Component(this.sourceInstance, {instanceName:this.instanceName+"-"+component.id, baseData:baseData}, component);

			// Stores this component in an associative array for later use 
			this.menuData.components[component.id] = componentData;
			this.storeIfHotspot(componentData.object, component.hotSpot);

			var componentObject = componentData.getComponentObject();
			menuSection.appendChild(componentObject);
		}
	}

	// Dispatch event that controls are ready.
    vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMenusReady", this);
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// General Controls Handlers /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 
/***********************************************************************************************************/
MenuHandler.prototype.storeIfHotspot = function(domElement, componentData) {
	if (componentData) {
		this.menuData.hotspots.push(domElement);
	}
};


// Hides the controls upon command if autohide allowed
/***********************************************************************************************************/
MenuHandler.prototype.autohideMenus = function(hideMenus, overrideInterval=-1) {
	
	// Only autohide controls if allowed
	if (this.menuData.autohide.status) {	
		this.hideMenus(hideMenus, overrideInterval);
	}
};


// Hides the controls upon command
/***********************************************************************************************************/
MenuHandler.prototype.hideMenus = function(hideMenus, overrideInterval=-1) {
    this.menuData.hidden = hideMenus;

    if (hideMenus) {
        vertex.tools.fadeOut(this.menuData.object, ((overrideInterval > -1) ? overrideInterval : this.menuData.autohide.fadeOutInterval));
    } else {
        vertex.tools.fadeIn(this.menuData.object, ((overrideInterval > -1) ? overrideInterval : this.menuData.autohide.fadeInInterval));
    }

    vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMenusDisplayStateChange", {hidden: this.menuData.hidden});
};


// Returns whether the controls are hidden or not.
/***********************************************************************************************************/
MenuHandler.prototype.isHidden = function() {
	return this.menuData.hidden;
};


// Allows a parent attach a listener to these controls.
/***********************************************************************************************************/
MenuHandler.prototype.addEventListener = function(event, eventListener) {
	this.menuData.object.addEventListener(event, function(event) { eventListener(event); });
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Helper Functions ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 
/***********************************************************************************************************/
MenuHandler.prototype.getSection = function(sectionId) {
	return this.menuData.sections[sectionId];
};

// 
/***********************************************************************************************************/
MenuHandler.prototype.getComponent = function(componentId) {
	return this.menuData.components[componentId];
};


// 
/***********************************************************************************************************/
MenuHandler.prototype.isContainedInHotspot = function(domElement) {
	//vertex.log(VERTEX_LOG.prod, this.menuData.hotspots, "hotspots");
	
	for (var hotspot of this.menuData.hotspots) {
		if (hotspot === domElement || hotspot.contains(domElement)) {
			return true;
		}
	}

	return false;
};


// Changes the current functional state of the object, then fires appropriate custom event
/***********************************************************************************************************/
MenuHandler.prototype.toggleVisibleState = function() {
	//console.log("IS SHOWING: "+vertex.tools.isShowing(this.menuData.object));
	
	if (!vertex.tools.isShowing(this.menuData.object)) {
		this.hideMenus(false, 200);
	} else {
		this.hideMenus(true, 100);
	}
};


// 
/***********************************************************************************************************/
MenuHandler.prototype.toggleFunctionalState = function(component) {
	component.toggleFunctionalState();
};


// 
/************************************************************************************/
MenuHandler.prototype.destroy = function(event) {
	this.destroyEventBindings();

};
