

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Default Behavior Class
//
//  File: 			themes/vertex-standard/default-behavior.js
//
//  Description: 	This class defines the custom functionality for all of the components defined within
//  				the theme.  This functionality extends beyond the standard component behavior.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// DefaultBehavior Constructor
/***********************************************************************************************************/
function DefaultBehavior(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	this.uiContainer = this.sourceInstance.containers.uiContainer;

	// Establish common variables and listeners
	this.establishModuleVariables();
	this.establishEventBindings();

	// All Vertex Player classes should report their instances to log when ready.
	vertex.logNewInstance(this.instanceName);
}


// Establishes boilerplate variables and any other variables that will have module scope.
/***********************************************************************************************************/
DefaultBehavior.prototype.establishModuleVariables = function() {
	this.controls = null;
	this.menus = null;
	this.status = {playing:false};
	this.dynamicControls = {};
	this.previousStates = {title:""};

	// Stores a local copy of the active config and active media object for use within this plugin.
	this.activeElements = this.sourceInstance.activeElements;
};


// Establish the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
DefaultBehavior.prototype.establishEventBindings = function() {
	var source = this;

	// [INIT] Controls Ready Listener
	this.sourceInstance.main.addEventListener("OnControlsReady", function(event) { source.onControlsReady(event); });
	this.sourceInstance.main.addEventListener("OnMenusReady", function(event) { source.onMenusReady(event); });

	// Title Component Listeners
	this.sourceInstance.main.addEventListener("OnModelReady", function(event) { source.onModelAvailable(event); });
	
	// Timeline Component Listeners
	this.sourceInstance.main.addEventListener("OnMediaPlaying", function(event) { source.onTimelineUpdating(event); });
	this.sourceInstance.main.addEventListener("OnTimelineComponentChanged", function(event) { source.onTimelineComponentUpdated(event); });
	
	// Play / Pause Component Listeners
	this.sourceInstance.main.addEventListener("OnMediaPlay", function(event) { source.onMediaPlay(event); });
	this.sourceInstance.main.addEventListener("OnMediaPause", function(event) { source.onMediaPause(event); });
	this.sourceInstance.main.addEventListener("OnPlayComponentClicked", function(event) { source.onPlayPauseComponentClicked(event); });
	this.sourceInstance.main.addEventListener("OnPauseComponentClicked", function(event) { source.onPlayPauseComponentClicked(event); });
	this.sourceInstance.main.addEventListener("OnMediaComplete", function(event) { source.onMediaComplete(event); });

	// Volume / Mute Component Listeners
	this.sourceInstance.main.addEventListener("OnVolumeUpdate", function(event) { source.onVolumeUpdate(event); });
	this.sourceInstance.main.addEventListener("OnMuteComponentClicked", function(event) { source.onMuteUnmuteComponentClicked(event); });
	this.sourceInstance.main.addEventListener("OnUnmuteComponentClicked", function(event) { source.onMuteUnmuteComponentClicked(event); });
	this.sourceInstance.main.addEventListener("OnVolumeComponentChange", function(event) { source.onVolumeComponentUpdate(event); });

	// Fullscreen Component Listeners
	this.sourceInstance.main.addEventListener("OnFullScreenStateChanged", function(event) { source.onFullScreenChanged(event); });

	// RR Component Listeners
	this.sourceInstance.main.addEventListener("OnRRComponentClicked", function(event) { source.onRRComponentClicked(event); });

	// FF Component Listeners
	this.sourceInstance.main.addEventListener("OnFFComponentClicked", function(event) { source.onFFComponentClicked(event); });	

	// Menu Items Clicked
	this.sourceInstance.main.addEventListener("OnAudioMenuItemClicked", function(event) { source.onMenuItemsClicked(event) });
	this.sourceInstance.main.addEventListener("OnSubtitleMenuItemClicked", function(event) { source.onMenuItemsClicked(event) });

	this.sourceInstance.main.addEventListener("OnMenusDisplayStateChange", function(event) { source.onMenuDisplayStateChanged(event) });

	this.sourceInstance.main.addEventListener("OnKeyPress", function(event) { source.onKeyPress(event) });

	// Destroy
	this.sourceInstance.main.addEventListener("OnRequestDestroy", function(event) { source.destroy(event); });

	window.addEventListener("resize", function(event) { source.onPlayerContainerResize(); });
};


// Removes the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
DefaultBehavior.prototype.destroyEventBindings = function() {
	var source = this;

	if (this.sourceInstance.main !== null) {
		// [INIT] Controls Ready Listener
		this.sourceInstance.main.removeEventListener("OnControlsReady", function(event) { source.onControlsReady(event); });
		this.sourceInstance.main.removeEventListener("OnMenusReady", function(event) { source.onMenusReady(event); });

		// Title Component Listeners
		this.sourceInstance.main.removeEventListener("OnModelReady", function(event) { source.onModelAvailable(event); });
		
		// Timeline Component Listeners
		this.sourceInstance.main.removeEventListener("OnMediaPlaying", function(event) { source.onTimelineUpdating(event); });
		this.sourceInstance.main.removeEventListener("OnTimelineComponentChanged", function(event) { source.onTimelineComponentUpdated(event); });
		
		// Play / Pause Component Listeners
		this.sourceInstance.main.removeEventListener("OnMediaPlay", function(event) { source.onMediaPlay(event); });
		this.sourceInstance.main.removeEventListener("OnMediaPause", function(event) { source.onMediaPause(event); });
		this.sourceInstance.main.removeEventListener("OnPlayComponentClicked", function(event) { source.onPlayPauseComponentClicked(event); });
		this.sourceInstance.main.removeEventListener("OnPauseComponentClicked", function(event) { source.onPlayPauseComponentClicked(event); });
		this.sourceInstance.main.removeEventListener("OnMediaComplete", function(event) { source.onMediaComplete(event); });

		// Volume / Mute Component Listeners
		this.sourceInstance.main.removeEventListener("OnVolumeUpdate", function(event) { source.onVolumeUpdate(event); });
		this.sourceInstance.main.removeEventListener("OnMuteComponentClicked", function(event) { source.onMuteUnmuteComponentClicked(event); });
		this.sourceInstance.main.removeEventListener("OnUnmuteComponentClicked", function(event) { source.onMuteUnmuteComponentClicked(event); });
		this.sourceInstance.main.removeEventListener("OnVolumeComponentChange", function(event) { source.onVolumeComponentUpdate(event); });

		// Fullscreen Component Listeners
		this.sourceInstance.main.removeEventListener("OnFullScreenStateChanged", function(event) { source.onFullScreenChanged(event); });

		// RR Component Listeners
		this.sourceInstance.main.removeEventListener("OnRRComponentClicked", function(event) { source.onRRComponentClicked(event); });

		// FF Component Listeners
		this.sourceInstance.main.removeEventListener("OnFFComponentClicked", function(event) { source.onFFComponentClicked(event); });	

		// Menu Items Clicked
		this.sourceInstance.main.removeEventListener("OnAudioMenuItemClicked", function(event) { source.onMenuItemsClicked(event) });
		this.sourceInstance.main.removeEventListener("OnSubtitleMenuItemClicked", function(event) { source.onMenuItemsClicked(event) });

		this.sourceInstance.main.removeEventListener("OnMenusDisplayStateChange", function(event) { source.onMenuDisplayStateChanged(event) });

		this.sourceInstance.main.removeEventListener("OnKeyPress", function(event) { source.onKeyPress(event) });

		// Destroy
		this.sourceInstance.main.removeEventListener("OnRequestDestroy", function(event) { source.destroy(event); });
		
		this.sourceInstance.main.removeEventListener("resize", function(event) { source.onPlayerContainerResize(); });
	}

	window.removeEventListener("resize", function(event) { source.onPlayerContainerResize(); });
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// Specific Controls Handling /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Allows this class to set up some general listeners on the newly created controls.
/***********************************************************************************************************/
DefaultBehavior.prototype.onKeyPress = function(event){
	var key = event.detail.data.key;

	// Play / Pause
	if (key === vertex.c.KEY_CODE.space) {
		this.activeElements.player.playPauseMedia();

	// RW
	} else if (key === vertex.c.KEY_CODE.arrow_left) {
		this.activeElements.player.skipMedia(-30);

	// FF
	} else if (key === vertex.c.KEY_CODE.arrow_right) {
		this.activeElements.player.skipMedia(30);

	// VOLUME +
	} else if (key === vertex.c.KEY_CODE.arrow_up) {
		this.activeElements.player.increaseVolume();

	// VOLUME -
	} else if (key === vertex.c.KEY_CODE.arrow_down) {
		this.activeElements.player.decreaseVolume();
	}
};


// Allows this class to set up some general listeners on the newly created controls.
/***********************************************************************************************************/
DefaultBehavior.prototype.onPlayerContainerResize = function() {
	var windowSize = {width: window.innerWidth, height: window.innerHeight};

	if (typeof this.dynamicControls !== "undefined") {
		if (typeof this.dynamicControls.title !== "undefined") {
			var flexSpaceWidth = this.calculateFlexSpaceWidth(windowSize)+"px";
			this.dynamicControls.title.object.style.width = flexSpaceWidth;
		}
	}
}


// Taking hardcoded contols sizes, this calculates the flexible space that's avilable to the title component.
/***********************************************************************************************************/
DefaultBehavior.prototype.calculateFlexSpaceWidth = function(windowSize) {
	var controlsOutterPadding = 36;
	var titleMargin = 10;
	var components = [
		{name: "controlsMuteButton", width: 44},
		{name: "controlsVolume", width: 91},
		{name: "controlsCastButton", width: 44},
		{name: "controlsSubtitleButton", width: 44},
		{name: "controlsFullScreenButton", width: 44},
	];

	var cumulativeWidth = controlsOutterPadding + titleMargin;

	for (var i=0; i < components.length; i++) {
		//console.log("Component["+components[i].name+"].visible = ",this.controls.getComponent(components[i].name).isVisible());
		
		if (this.controls.getComponent(components[i].name).isVisible() && !this.controls.getComponent(components[i].name).object.classList.contains("mobile")) {
			cumulativeWidth += components[i].width;
		}
	}

	return this.uiContainer.clientWidth - cumulativeWidth;
}


// Allows this class to set up some general listeners on the newly created controls.
/***********************************************************************************************************/
DefaultBehavior.prototype.onControlsReady = function(event) {

	// Assumes the controls data created by the controls handler
	this.controls = event.detail.data;

	this.dynamicControls.title = this.controls.getComponent("controlsTitle");
	this.onPlayerContainerResize();

	vertex.log(VERTEX_LOG.priority, "Player Controls Ready!");

	this.updateTitleComponent( this.returnDecoratedTitle() );

	var muteComponent = this.controls.getComponent("controlsMuteButton");
	var volumeComponent = this.controls.getComponent("controlsVolume");

	// If there's no volumeOpen property established yet, do it now.
	if (typeof volumeComponent.properties.volumeOpen !== "undefined") {
		volumeComponent.properties.volumeOpen = true;
	}

	if (this.sourceInstance.client.clientData.supportsTouches) {
		muteComponent.object.classList.add("mobile");
		volumeComponent.object.classList.add("mobile");
	}

	// Make sure the volume controls have the latest values.
	this.updateVolumeControlsWithLatestValues();
};


// Handles onMenusReady events.
/***********************************************************************************************************/
DefaultBehavior.prototype.onMenusReady = function(event) {
	var source = this;

	this.menus = event.detail.data;

	var languageControls = this.controls.getComponent("controlsSubtitleButton");
	var subtitlesMenu = this.menus.getComponent("subtitlesMenu");

	languageControls.setBaseState(vertex.c.COMPONENT_BASE_STATES.enabled, 150);

	languageControls.object.onclick = function(event) {
		source.onMenuItemsClicked();
	}
};


// Handles onMenuItemsClicked events.
/***********************************************************************************************************/
DefaultBehavior.prototype.onMenuItemsClicked = function(event) {
	this.menus.toggleVisibleState();
};


// Handles display state changes on menus.
/***********************************************************************************************************/
DefaultBehavior.prototype.onMenuDisplayStateChanged = function(event) {
	var languageControls = this.controls.getComponent("controlsSubtitleButton");
	
	languageControls.setButtonAsActive((!event.detail.data.hidden));
};


// INPUT: Updates the custom UI based on the player's updates.
/***********************************************************************************************************/
DefaultBehavior.prototype.onTimelineUpdating = function(event) {

	if (!this.status.playing) {
		this.status.playing = true;

		var playPauseButton = this.controls.getComponent("controlsPlayButton");
		
		playPauseButton.setVisualStateByName("play");

		this.onPlayerContainerResize();
	}

	// If the controls exist
	if (this.controls) {
		// Timeline
		var timelineComponent = this.controls.getComponent("controlsTimeline");

		var mediaProgress = this.activeElements.player.mediaProgressPercentage();
		var mediaTime = Math.floor(this.activeElements.player.mediaProgressTime());
		var mediaDuration = this.activeElements.player.mediaDuration();

		// Timer Component
		var timer = this.controls.getComponent("controlsTimer");

		// Update Title component
		if (this.activeElements.media.data.title !== "") {
			this.updateTitleComponent( this.returnDecoratedTitle() );
		}

		// If the max value needs to update, do it now.
		if (timelineComponent.properties.max !== mediaDuration) {
			timelineComponent.properties.max = mediaDuration;
		}

		if (timelineComponent.sliderHoverEmphasized()) {
			timelineComponent.updateSliderHoverText( vertex.tools.changeTimeFormat(mediaTime) );
		}

		timer.updateTimerComponent(mediaTime, (mediaDuration-mediaTime), "-%d");
		timelineComponent.setSliderValueWithPercentage(mediaProgress);
	}
};


// OUTPUT: Updates the player's position based on custom UI interaction.
/***********************************************************************************************************/
DefaultBehavior.prototype.onTimelineComponentUpdated = function(event) {
	this.activeElements.player.seekMediaProgress( event.detail.data.ratio );
};


// When the model's available, populate the custom UI with title and duration
/***********************************************************************************************************/
DefaultBehavior.prototype.onModelAvailable = function(event) {

	if (this.controls) {
		if (this.activeElements.media.data.title !== "") {
			this.updateTitleComponent( this.returnDecoratedTitle() );
			this.onPlayerContainerResize();
		}
	}
};


// Returns a processed title with a specific format if the particular components are present, otherwise, it returns whatever it has.
/***********************************************************************************************************/
DefaultBehavior.prototype.returnDecoratedTitle = function() {
	
	// If there are active media elements
	if (this.activeElements.media !== null) {
		return ((typeof this.activeElements.media.data.program !== "undefined" && this.activeElements.media.data.program && this.activeElements.media.data.program !== "") ? "<span class='bold'>"+this.activeElements.media.data.program+"</span> - " : "") + this.activeElements.media.data.title;
	} else {
		return "";
	}
};


// Updates the title component when called with whatever text is passed.
/***********************************************************************************************************/
DefaultBehavior.prototype.updateTitleComponent = function(titleText) {
	var titleComponent = this.dynamicControls.title;

	// Protects this component from updating every times it's called, only when it needs to update.
	if (titleText !== this.previousStates.title) {
		
		// Update the component state and value.
		if (titleText !== "") {
			titleComponent.updateTextComponent(titleText);
			titleComponent.setBaseState(vertex.c.COMPONENT_BASE_STATES.enabled);
		} else {
			titleComponent.updateTextComponent(titleText);
			titleComponent.setBaseState(vertex.c.COMPONENT_BASE_STATES.hidden);
		}

		// Store this for later updates.
		this.previousStates.title = titleText;
	}
};


// INPUT: Updates the custom UI based on the player's updates.
/***********************************************************************************************************/
DefaultBehavior.prototype.onMediaPlay = function(event) {
	if (this.controls) {
		var playPauseButton = this.controls.getComponent("controlsPlayButton");
		playPauseButton.setVisualStateByName("play");

		this.onPlayerContainerResize();
	}
};


// INPUT: Updates the custom UI based on the player's updates.
/***********************************************************************************************************/
DefaultBehavior.prototype.onMediaPause = function(event) {
	if (this.controls) {
		var playPauseButton = this.controls.getComponent("controlsPlayButton");

		this.status.playing = false;
		
		playPauseButton.setVisualStateByName("pause");
	}
};


// INPUT: Updates the custom UI based on the player's updates.
/***********************************************************************************************************/
DefaultBehavior.prototype.onMediaComplete = function(event) {
	var playPauseButton = this.controls.getComponent("controlsPlayButton");

	this.status.playing = false;
		
	playPauseButton.setVisualStateByName("pause");
};


// OUTPUT: Updates the player's position based on custom UI interaction.
/***********************************************************************************************************/
DefaultBehavior.prototype.onPlayPauseComponentClicked = function(event) {
	this.controls.toggleFunctionalState(this.controls.getComponent("controlsPlayButton"));
	this.activeElements.player.playPauseMedia();
};


// OUTPUT: Updates the player's position based on custom UI interaction.
/***********************************************************************************************************/
DefaultBehavior.prototype.onRRComponentClicked = function(event) {
	this.activeElements.player.skipMedia(-30);
};


// OUTPUT: Updates the player's position based on custom UI interaction.
/***********************************************************************************************************/
DefaultBehavior.prototype.onFFComponentClicked = function(event) {
	this.activeElements.player.skipMedia(30);
};


// INPUT: Updates the custom UI based on the player's updates.
/***********************************************************************************************************/
DefaultBehavior.prototype.onVolumeUpdate = function(event){
	//this.activeElements.player = event.detail.data.player;

	this.updateVolumeControlsWithLatestValues();
};


// INPUT: Updates the custom UI based on the player's updates.
/***********************************************************************************************************/
DefaultBehavior.prototype.updateVolumeControlsWithLatestValues = function(){
	if (this.controls) {
		var muteComponent = this.controls.getComponent("controlsMuteButton");
		var volumeComponent = this.controls.getComponent("controlsVolume");
		
		var volumeLevel = this.activeElements.player.mediaVolume();
		
		volumeComponent.setSliderValueWithPercentage(volumeLevel);

		this.updateMuteComponentVisualState(muteComponent);
	}
};


// OUTPUT: Updates the player's position based on custom UI interaction.
/***********************************************************************************************************/
DefaultBehavior.prototype.onMuteUnmuteComponentClicked = function(event){
	this.activeElements.player.toggleMute();
};


// Updates the visual state of the mute button based on the volume of the player.
/***********************************************************************************************************/
DefaultBehavior.prototype.updateMuteComponentVisualState = function(muteComponent) {
	muteComponent.setVisualStateByName( ((!this.activeElements.player.mediaMuted() && this.activeElements.player.mediaVolume() > 0.0) ? "unmute" : "mute" ) );

	if (this.sourceInstance.client.clientData.supportsTouches) {
		muteComponent.object.classList.add("mobile");
	}
};


// OUTPUT: Updates the player's position based on custom UI interaction.
/***********************************************************************************************************/
DefaultBehavior.prototype.onVolumeComponentUpdate = function(event){
	this.activeElements.player.setVolume(event.detail.data.ratio);
};


// Handles the fullscreen button state when the fullscreen event is detected
/***********************************************************************************************************/
DefaultBehavior.prototype.onFullScreenChanged = function(event) {
	
	var fullscreenComponent = this.controls.getComponent("controlsFullScreenButton");
	var isFullscreen = event.detail.data.fullscreen;
	var visualState = (isFullscreen) ? "fullscreen" : "normal";

	fullscreenComponent.setVisualStateByName(visualState);
};


// Runs tear down on the this class.
/************************************************************************************/
DefaultBehavior.prototype.destroy = function(event) {
	this.destroyEventBindings();

	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnDefaultBehaviorDestroyed", true);

	vertex.tools.destroyAllChildren(this);
};
