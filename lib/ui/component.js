

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Component Class
//
//  File: 			lib/ui/component.js
//
//  Description: 	This class is the component template class used by the controls-handler to create all
//					of the player's components and menus.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Component Constructor
/***********************************************************************************************************/
function Component(sourceInstance, instanceProperties, dataObject) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	// Breaking out each variable vs a straight replace of componentData with dataObject, protects the integrity of the expected object.
	this.id = dataObject.id;
	this.class = dataObject.class;
	this.type = dataObject.type;
	
	// Primary component elements
	this.elements = {};
	this.object = null;
	this.properties = dataObject.properties;

	// The component's various states
	this.baseState = dataObject.properties.baseState; // Available States: 'component.enabled' (enabled), 'component.disabled' (disabled), 'component.hidden' (hidden)
	this.visualState = null;
	this.functionalState = null;

	// Creates the current object using the properties
	this.createComponentObject();

	vertex.logNewInstance(this.instanceName);
}


// Creates the component object.
/***********************************************************************************************************/
Component.prototype.createComponentObject = function() {

	// creates an object and applies id and base class to it 
	var componentObject = vertex.tools.createDivContainerWithProperties(null, {div_id: this.id, div_class: this.type});

	// applies component-specific class 
	componentObject.classList.add(this.class);

	// Assigns the object to this instance's "object" property
	this.object = componentObject;

	// adds custom functionalities to the object based on its type 
	switch (this.type) {
		case "text_std":
			this.createText();
			break;
		case "btn_std":
			this.createButtonStandard();
			break;
		case "toggle_sync":
			this.createToggleSync();
			break;
		case "toggle_async":
			this.createToggleAsync();
			break;
		case "slider_std":
			this.createSliderStandard();
			break;
		case "slider_timeline":
			this.createSliderTimeline();
			break;
		case "menu_std":
			this.createMenuStandard();
			break;
		default:
	}

	this.setBaseState(this.baseState); // Set/Apply the initial base state now.

	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnComponentReady", this);
};


/***********************************************************************************************************/
/***************************** Component Init Methods *******************************/
/***********************************************************************************************************/


// Creates controls slider DOM element
/***********************************************************************************************************/
Component.prototype.createSliderStandard = function() {
	var source = this;
	var sliderData = this.properties;
	var defaultRatio = (sliderData.value - sliderData.min) / (sliderData.max - sliderData.min) * 100; // initialize slider's default positions


	// Slider Container
	this.elements.container = vertex.tools.createDivContainerWithProperties(this.object, {div_class: "slider_container"});
	
	// Slider Track Bar
	this.elements.trackBar = vertex.tools.createDivContainerWithProperties(this.elements.container, {div_class: "track_bar"});
	
	// Slider Progress Bar
	this.elements.progressBar = vertex.tools.createDivContainerWithProperties(this.elements.container, {div_class: "progress_bar"});
	this.elements.progressBar.style['width'] = defaultRatio + "%";
	
	// Slider Dragger
	this.elements.thumb = vertex.tools.createDivContainerWithProperties(this.elements.container, {div_class: "thumb"});
	this.elements.thumb.style['left'] = defaultRatio + "%";
	this.elements.thumb.setAttribute('draggable', false);

	// Disables web's default dragging functionality.
	this.elements.thumb.ondragstart = function() {
		return false;
	};


	// Initiates all click and/or drag operations
	this.elements.container.onmousedown = function(event) {
	    
	    // If the current component is enabled, proceed with action
	    if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
	    	
	    	// If the element is not the scrubber, then calculate the new position.
	    	if (event.target !== source.elements.thumb) {
		    	source.properties.scrubbing = true;
				
		    	//vertex.log(VERTEX_LOG.prod, event, "event");

				var newSliderData = source.calculateSliderInsights(source.elements.container, event.offsetX, source.properties);
				var newSliderPosition = newSliderData.pos;

				// changes display state
				source.properties.value = newSliderPosition;
				source.properties.ratio = newSliderData.ratio;

				source.setSliderValueWithPercentage(source.properties.ratio, false);
			} else {
				source.properties.scrubbing = true;
			}
		}
	}


	// Completes all click and/or drag operations
	document.addEventListener('mouseup', function(event) {
	    
	    //vertex.log(VERTEX_LOG.prod, event, "event");

	    // If the current component is enabled, proceed with action
		if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
		    
		    // If the current component is scrubbing...
		    if (source.properties.scrubbing) {
			    source.properties.scrubbing = false;

			    // Fires the slider component's event.
				vertex.events.dispatchCustomEvent(source.sourceInstance.main, source.properties.functionalState, {value: source.properties.value, ratio:source.properties.ratio}); 
			}
		}
	});


	// Updates all components that are current scrubbing.
	document.addEventListener('mousemove', function(event) { 
		event.stopPropagation();

		// If the current component is enabled, proceed with action
		if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {	
			//vertex.log(VERTEX_LOG.prod, source.elements.container.offsetLeft, "parentX");
			//vertex.log(VERTEX_LOG.prod, event, "event");

			// Update the position if there's movement and the component is still scrubbing.
			if (source.properties.scrubbing) {
				var mouseX = (event.target === source.elements.thumb) ? source.elements.thumb.offsetLeft+event.layerX : event.offsetX;
				var newSliderData = source.calculateSliderInsights(source.elements.container, mouseX, source.properties);
				var newSliderPosition = newSliderData.pos;
			    
			    // If the slider value is not equal to the new slider position, update the slider value now.
			    if (source.properties.value !== newSliderPosition) {

			    	// Changes the slider value
			    	source.properties.value = newSliderPosition;
			    	source.properties.ratio = newSliderData.ratio;

			    	// Updates the slider thumb's position
			    	source.setSliderValueWithPercentage(source.properties.ratio, false);
			    }
		    }
		}	        
	});
};


// Creates a timeline slider DOM element
/***********************************************************************************************************/
Component.prototype.createSliderTimeline = function() {
	var source = this;
	this.createSliderStandard();

	// Creates a timeline timecodeHover that shows on hover
	this.elements.timecodeHover = vertex.tools.createDivContainerWithProperties(this.elements.container, {div_class: "timeline_thumbnail"});
	
	vertex.tools.hide(this.elements.timecodeHover);

	// Binds a mouseover event for start hover
	this.elements.container.onmouseover = function(event) {
		
		// If the current component is enabled, proceed with action
		if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
			// Shows timecodeHover
			vertex.tools.show(source.elements.timecodeHover);
		}
	}

	// Binds a mouseout event for end hover
	this.elements.container.onmouseout = function(event) {
		
		// If the current component is enabled, proceed with action
		if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
			// Hides timecodeHover
			vertex.tools.hide(source.elements.timecodeHover);
		}
	}


	// When the timecodeHover is visible, move it too.
	document.addEventListener('mousemove', function(event) { 
		
		// If the current component is enabled, proceed with action
		if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
			
			// If the hover component is visible, run the following code now.
			if ( vertex.tools.isShowing(source.elements.timecodeHover) ) {
					var onThumb = (event.target === source.elements.thumb);
					var mouseX = (onThumb) ? source.elements.thumb.offsetLeft : event.offsetX;
					var newSliderData = source.calculateSliderInsights(source.elements.container, mouseX, source.properties);
					var newSliderPosition = newSliderData.pos;
					var newMarginLeft = (source.elements.timecodeHover.offsetWidth / 3) * -1;

					if (onThumb) {
						source.elements.timecodeHover.classList.add("emphasis");
					} else {
						source.elements.timecodeHover.classList.remove("emphasis");
						source.elements.timecodeHover.innerHTML = vertex.tools.changeTimeFormat(newSliderPosition);
					}

					// Shows the timecodeHover with the new value 
					source.elements.timecodeHover.style.marginLeft = newMarginLeft + "px";
					source.elements.timecodeHover.style.left = (newSliderData.ratio * 100) + "%";
			}
		}
	});
};


// 
/***********************************************************************************************************/
Component.prototype.updateSliderHoverText = function(hoverText) {
	this.elements.timecodeHover.innerHTML = hoverText;
};


// 
/***********************************************************************************************************/
Component.prototype.sliderHoverEmphasized = function() {
	return this.elements.timecodeHover.classList.contains("emphasis");
};


// Creates controls text DOM element
/***********************************************************************************************************/
Component.prototype.createText = function() {
	if (typeof this.properties.clickable.status !== "undefined" && this.properties.clickable.status) {
		var source = this;

		// Adds a pointer cursor to the text.
		this.object.classList.add("clickable");

		// Creates a click event to capture use input
		this.object.onclick = function(event) {
			
			// If the current component is enabled, proceed with action
			if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
				
				// If a URL is found, open a new tab with the URL
				if (source.properties.clickable.action.search("://") > -1) {
					vertex.tools.openInNewTab(source.properties.clickable.action);
				
				// Otherwise, it's assumed that action is an event to dispatch
				} else {
					vertex.events.dispatchCustomEvent(source.sourceInstance.main, source.properties.clickable.action, source);
				}
			}
		}
	}

	this.updateTextComponent(this.properties.defaultText);
};


// Creates a standard button DOM element 
/***********************************************************************************************************/
Component.prototype.createButtonStandard = function() {
	var source = this;
	
	// Adds icon
	this.elements.icon = vertex.tools.createDivContainerWithProperties(this.object, {div_class: "icon"});
	
	// Dispatch custom click event
	this.object.onclick = function(event) {
		
		// If the current component is enabled, proceed with action
		if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
			var customEvent = source.properties.functionalStates.availableStates[0].name;
			vertex.events.dispatchCustomEvent(source.sourceInstance.main, customEvent, source);
		}
	}
};


// Creates a synchronous toggle DOM element
/***********************************************************************************************************/
Component.prototype.createToggleSync = function() {
	var source = this;
	
	// Adds icon
	this.elements.icon = vertex.tools.createDivContainerWithProperties(this.object, {div_class: "icon"});

	// assigns default values to visual and functional states 
	this.visualState = this.properties.visualStates.defaultState;
	this.functionalState = this.properties.functionalStates.defaultState;

	// Applies default visual state
	var defaultState = this.properties.visualStates.availableStates[this.visualState].name;
	
	this.setVisualStateByIndex(this.visualState);

	// Dispatch custom click event
	this.object.onclick = function(event) {
		
		// If the current component is enabled, proceed with action
		if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
			var customEvent = source.properties.functionalStates.availableStates[source.functionalState].name;
			vertex.events.dispatchCustomEvent(source.sourceInstance.main, customEvent, source);
		}
	}
};


// Creates an asynchronous toggle DOM element
/***********************************************************************************************************/
Component.prototype.createToggleAsync = function() {
	var source = this;
	
	// Adds icon
	this.elements.icon = vertex.tools.createDivContainerWithProperties(this.object, {div_class: "icon"});

	// assigns default values to visual and functional states
	this.visualState = this.properties.visualStates.defaultState;
	this.functionalState = this.properties.functionalStates.defaultState;

	// Applies default display state
	var defaultState = this.properties.visualStates.availableStates[this.visualState].name;
	this.object.classList.add(defaultState);

	// Dispatch custom click event
	this.object.onclick = function(event) {
		
		// If the current component is enabled, proceed with action
		if (source.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
			var newState = source.properties.functionalStates.availableStates[source.functionalState].name;
			vertex.events.dispatchCustomEvent(source.sourceInstance.main, newState, source);
		}
	}
};


// Creates an asynchronous toggle DOM element
/***********************************************************************************************************/
Component.prototype.createMenuStandard = function() {
	var source = this;
	var menuData = this.properties;

	this.elements.menuParent = vertex.tools.createDivContainerWithProperties(this.object, {div_class: "menu_parent"});
	this.elements.menuParent.innerHTML = "<span class='bold'>"+menuData.menuTitle+"</span>";

	this.menuitems = [];

	// Menu Container
	this.elements.menuContainer = vertex.tools.createDivContainerWithProperties(this.elements.menuParent, {div_class: "menu_std_container"});
};


// Adds a single menu item to the current menu.
/***********************************************************************************************************/
Component.prototype.addItemToMenu = function(itemData, insertIndex=-1) {
	var source = this;
	var currentIndex = itemData.source_index;
	var menuItem = vertex.tools.createDivContainerWithProperties(this.elements.menuContainer, {div_class: "menu_item"});
	
	menuItem.innerHTML = "<div class='icon'></div>"+itemData.title;

	// If the current item is to be selected, add that class now.
	if (itemData.selected) {
		menuItem.classList.add("selected");
	}

	
	menuItem.onclick = function(event) {
		
		// Updates the selected state of the selected menu item.
		for (var item of source.menuitems) {

			// If the current item in the list matches THIS menuitem, then set it to selected, otherwise remove the selected class.
			if (item === menuItem) {
				menuItem.classList.add("selected");
			} else {
				item.classList.remove("selected");
			}
		}

		vertex.events.dispatchCustomEvent(source.sourceInstance.main, source.properties.functionalState, {index: currentIndex}); 
	}

	// Inserts the new menu item into the menuitems array
	if (insertIndex === -1) {
		this.menuitems.push(menuItem);

	// Inserts the new menu item into the menuitems array at a specific index and reorders the menu UI in the intended order.
	} else {
		this.menuitems.splice(insertIndex, 0, menuItem);
		this.moveMenuItemBeforeReferenceItem(this.menuitems[insertIndex], this.menuitems[(insertIndex+1)]);
	}
};


// Removes a menu item child DOM from its current place and then inserts it before a reference child DOM in the tree.
/***********************************************************************************************************/
Component.prototype.moveMenuItemBeforeReferenceItem = function(moveChild, referenceChild) {
	var removedChild = this.elements.menuContainer.removeChild(moveChild);
	this.elements.menuContainer.insertBefore(removedChild, referenceChild);
}


// Clears all menu items out of the current menu.
/***********************************************************************************************************/
Component.prototype.removeAllItems = function() {
	
	// If the menuContainer exists, proceed with clearing it.
	if (typeof this.elements.menuContainer !== "undefined") {
		this.elements.menuContainer.innerHTML = "";
		this.menuitems = [];
	}
};


// Returns a list of menu item objects to the caller.
/***********************************************************************************************************/
Component.prototype.returnMenuItems = function() {
	return this.menuitems;
};


/***********************************************************************************************************/
/******************************** Component Helpers *********************************/
/***********************************************************************************************************/


// Returns the component object element
/***********************************************************************************************************/
Component.prototype.getComponentObject = function() {
	return this.object;
};


// Returns the component object's properties
/***********************************************************************************************************/
Component.prototype.getComponentProperties = function() {
	return this.properties; 
}; 


// Compares the top level and all low level components to the passed component
/***********************************************************************************************************/
Component.prototype.isSameAsComponent = function(comparisonObject) {
	
	// If the object is the same, then return true immediately.
	if (this.object === comparisonObject) {
		return true;
	} else {
		// Cycle through the object's elements and check if they match the current object.
		for (var element in this.elements) {

			// If the current element is the same as the comparison, then the objects are the same.
			if (this.elements[element] === comparisonObject) {
				return true;
			}
		}
	}

	return false;
};


// Returns whether the current component is visible.
/***********************************************************************************************************/
Component.prototype.isVisible = function() {
	return (this.object.style.display !== "none" || this.object.style.opacity !== "0");
};


// Returns the bounding box rectangle for the current component for measuring.
/***********************************************************************************************************/
Component.prototype.boundingBoxRect = function() {
	
	if (!this.isVisible()) {
		this.object.style.display = "block";
		var boundingBox = this.object.getBoundingClientRect();
		this.object.style.display = "none";
		
		return boundingBox;
	} else {
		return this.object.getBoundingClientRect();
	}
};


// Sets the current slider's position using a value
/***********************************************************************************************************/
Component.prototype.setSliderValueWithPosition = function(newValue, external = true) {
	
	// Translates the slider's value to a ratio.
	var newRatio = (newValue - this.properties.min) / (this.properties.max - this.properties.min);

	// Set's the slider using the new ratio.
	this.setSliderValueWithPercentage(newRatio, external);
};


// Sets the current slider's position using a percentage based value.
/***********************************************************************************************************/
Component.prototype.setSliderValueWithPercentage = function(newRatio, external = true) {
	
	// If the slider isn't being manipulated update position now.
	if (!this.properties.scrubbing || (this.properties.scrubbing && !external)) {
		
		// Enforces the slider's boundaries
		newRatio = (newRatio < 0.0) ? 0.0 : newRatio;
		newRatio = (newRatio > 1.0) ? 1.0 : newRatio;

		// Magnifies the ratio by a factor of 100 so that we get fully qualified CSS percentages
		magnifiedRatio = String((newRatio * 100))+"%";

		// TEST
		//vertex.log(VERTEX_LOG.prod, "ratio = "+magnifiedRatio);

		// Updates the slider elements' CSS properties.
		this.elements.thumb.style.left = magnifiedRatio;
		this.elements.progressBar.style['width'] = magnifiedRatio;
	}
};


// Sets the current slider's position using a percentage based value.
/***********************************************************************************************************/
Component.prototype.toggleButtonAsActive = function() {
	this.elements.icon.classList.toggle('active');
};


// Sets the current slider's position using a percentage based value.
/***********************************************************************************************************/
Component.prototype.setButtonAsActive = function(setActive) {
	if (setActive) {
		this.elements.icon.classList.add('active');
	} else {
		this.elements.icon.classList.remove('active');
	}
};


// Makes a number of calculations that re-aligns the current state of the slider.
/***********************************************************************************************************/
Component.prototype.calculateSliderInsights = function(container, mouseX, sliderData) {

	// Calculate slider thumb position.
    var clientLeft = container.offsetLeft;
    var mouseDistance = mouseX - clientLeft;

    // TEST
    //vertex.log(VERTEX_LOG.prod, "container.width = "+container.offsetWidth+"container.x = "+container.offsetLeft+", mouseX = "+mouseX+", mouseDistance = "+mouseDistance);

    // If the position is less than 0, set it to 0 now.
    if (mouseDistance < 0) {
        mouseDistance = 0;
    }

    // If the position if greater than the range, set it to the range now.
    if (mouseDistance > container.offsetWidth) {
        mouseDistance = container.offsetWidth;
    }

    // Calculate the position percentage.
    var positionRatio = mouseDistance / container.offsetWidth;
    
    // Calculates the new translated pixel position based on the positionRatio + slider position minimum.
    var insightsPayload = {pos: Math.round((sliderData.max - sliderData.min) * positionRatio + sliderData.min), ratio: positionRatio, dist: mouseDistance}
   	
    return insightsPayload;
};


// 
/***********************************************************************************************************/
Component.prototype.updateTextComponent = function(newText) {
	this.object.innerHTML = newText;
};


// 
/***********************************************************************************************************/
Component.prototype.updateTimerComponent = function(time, duration, pattern) {
	var timerText = "";

	time = (time === -1 || isNaN(time)) ? "00:00" :  vertex.tools.changeTimeFormat(time);
	duration = (duration === -1 || isNaN(duration)) ? "00:00" :  vertex.tools.changeTimeFormat(duration);

	timerText = pattern.replace("%t", time);
	timerText = timerText.replace("%d", duration);

	this.object.innerHTML = timerText;
};


/***********************************************************************************************************/
/******************************* Component State Helpers ****************************/
/***********************************************************************************************************/


// Changes the base state of the object, depending the state index passed
/***********************************************************************************************************/
Component.prototype.setBaseState = function(stateIndex, fadeInterval=0) {
	// TEST //vertex.log(VERTEX_LOG.prod, "BASE STATE = "+stateIndex);

	this.baseState = stateIndex;

	// NOTE: 1 = enabled (default), 2 = disabled, 3 = hidden
	if (this.baseState === vertex.c.COMPONENT_BASE_STATES.enabled) {
		this.object.classList.remove("disabled");
		
		vertex.tools.fadeIn(this.object, fadeInterval, "inline-block");
	}
	else if (this.baseState === vertex.c.COMPONENT_BASE_STATES.disabled) {	
		this.object.classList.add("disabled");
		
		vertex.tools.fadeIn(this.object, fadeInterval, "inline-block");
	}
	else if (this.baseState === vertex.c.COMPONENT_BASE_STATES.hidden) {
		this.object.classList.remove("disabled");
		
		vertex.tools.fadeOut(this.object, fadeInterval);
	}
};


// Changes the visual state of the object, based on the state index passed
/***********************************************************************************************************/
Component.prototype.setVisualStateByIndex = function(stateIndex) {
	this.setVisualStateByName(this.properties.visualStates.availableStates[stateIndex].name);
};


// Changes the visual state of the object, based on the state index passed
/***********************************************************************************************************/
Component.prototype.setVisualStateByName = function(stateName) {
	
	// Removes old display class and adds new class to reflect new display state
	this.object.className = "";
	
	this.visualState = stateName;
	
	this.object.classList.add(this.type);  // base class
	this.object.classList.add(this.class);  // component-specific class
	this.object.classList.add(this.visualState);  // new display class

};


// Changes the current functional state of the object, then fires appropriate custom event
/***********************************************************************************************************/
Component.prototype.setFunctionalState = function(stateIndex) {
	this.functionalState = stateIndex;

	// fires custom event, depending on new functional state
	var eventName = this.properties.functionalStates.availableStates[stateIndex].name;

	//vertex.events.dispatchCustomEvent(this.sourceInstance.main, eventName, this);
};


// Changes the current functional state of the object, then fires appropriate custom event
/***********************************************************************************************************/
Component.prototype.toggleFunctionalState = function() {
	
	if ((this.functionalState + 1) < this.properties.functionalStates.availableStates.length) {
		this.functionalState++;
	} else {
		this.functionalState = 0;
	}

	this.setFunctionalState(this.functionalState);
};


// Changes the current functional state of the object, then fires appropriate custom event
/***********************************************************************************************************/
Component.prototype.destroy = function() {
	this.object.innerHTML = "";
	this.object = null;
};
