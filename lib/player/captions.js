

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Captions Handler Class
//
//  File: 			lib/player/captions.js
//
//  Description: 	Handles the setup, maintenance and tear down of captions and text tracks within the player.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Captions Constructor
/***********************************************************************************************************/
function Captions(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();
	this.previousTracks = null;

	this.establishModuleVariables();
	this.establishEventBindings();

	// All Vertex Player classes should report their instances to log when ready.
	vertex.logNewInstance(this.instanceName);
}


// Establishes boilerplate variables and any other variables that will have module scope.
/***********************************************************************************************************/
Captions.prototype.establishModuleVariables = function() {
	this.captionData = {ready: false, started: false, menu: null, trackMap:[]};

	// Stores a local copy of the active config and active media object for use within this plugin.
	this.activeElements = this.sourceInstance.activeElements;
}


// Establish the bindings that the player handler should be tapped into.
/************************************************************************************/
Captions.prototype.establishEventBindings = function() {
	var source = this;

	this.sourceInstance.main.addEventListener("OnModelReady", function(event) { source.onModelReady(event); });
	this.sourceInstance.main.addEventListener("OnMenusReady", function(event) { source.onMenusReady(event); });
	this.sourceInstance.main.addEventListener("OnMediaCanPlay", function(event) { source.onMediaCanPlay(event); });
	this.sourceInstance.main.addEventListener("OnMediaComplete", function(event) { source.onMediaComplete(event); });
	this.sourceInstance.main.addEventListener("OnSubtitleMenuItemClicked", function(event) { source.onSubtitleMenuItemClicked(event); });
	this.sourceInstance.main.addEventListener("OnRequestDestroy", function(event) { source.destroy(event); });
};


// Destroy the bindings that the player handler should be tapped into.
/************************************************************************************/
Captions.prototype.destroyEventBindings = function() {
	var source = this;

	if (this.sourceInstance.main !== null) {
		this.sourceInstance.main.removeEventListener("OnModelReady", function(event) { source.onModelReady(event); });
		this.sourceInstance.main.removeEventListener("OnMenusReady", function(event) { source.onMenusReady(event); });
		this.sourceInstance.main.removeEventListener("OnMediaCanPlay", function(event) { source.onMediaCanPlay(event); });
		this.sourceInstance.main.removeEventListener("OnMediaComplete", function(event) { source.onMediaComplete(event); });
		this.sourceInstance.main.removeEventListener("OnSubtitleMenuItemClicked", function(event) { source.onSubtitleMenuItemClicked(event); });
		this.sourceInstance.main.removeEventListener("OnRequestDestroy", function(event) { source.destroy(event); });
	}
};


// Updates the caption data states when the playable media is ready.
/************************************************************************************/
Captions.prototype.onModelReady = function(event) {
	this.captionData.ready = true;
	this.captionData.started = false;
};


// Handles menu ready events.
/************************************************************************************/
Captions.prototype.onMenusReady = function(event) {
	var menuData = event.detail.data;

	this.captionData.menu = menuData.getComponent("subtitlesMenu");
};


// Updates the player's text tracks and text track menu when media is playable.
/************************************************************************************/
Captions.prototype.onMediaCanPlay = function(event) {
	
	if (this.captionData.ready && !this.captionData.started) {
		this.updateTextTracksMenu();
	}
};


// Handles tear down of the player on media complete
/************************************************************************************/
Captions.prototype.onMediaComplete = function(event) {
	
	// Remove old text tracks now that video is finishing.
	this.previousTracks = this.getTextTracks();
	this.captionData.menu.removeAllItems();
};


// Handles subtitle menu item click events.
/************************************************************************************/
Captions.prototype.onSubtitleMenuItemClicked = function(event) {
	var newIndex = event.detail.data.index;
	
	this.activeElements.player.switchTextTracks(newIndex);
};


// Retrieves an array of text track data that can be easily manipulated and compared.
/************************************************************************************/
Captions.prototype.getTextTracks = function() {
	var textTrackList = this.activeElements.player.textTracks();
	var textTracksNew = [];

	for (var i = 0; i < textTrackList.length; i++) {
		var track = textTrackList[i];
		if (track.kind) {
			var trackData = {kind: track.kind, label: track.label, language: track.language, id: track.id, mode: track.mode};
			textTracksNew.push(trackData);
		}
	}

	return textTracksNew;
}


// Updates the physical text tracks menu using the text track data.
/************************************************************************************/
Captions.prototype.updateTextTracksMenu = function() {
		
	var textTracksNew = this.getTextTracks();
	var previousTracksIndex = (this.previousTracks) ? this.previousTracks.length : 0;
	var textTracks = textTracksNew.slice(previousTracksIndex);

	this.captionData.ready = false;
	this.captionData.started = true;

	var trackIncrementor = previousTracksIndex; // Important: Used as the source index, which maps to the original index within the textTracks list.

	// If the menu already has items, clear it out now for new items
	if (this.captionData.menu.returnMenuItems().length > 0) {
		this.captionData.menu.removeAllItems();
	}

	// Iterate through all of the audio track and add each one.
	for (var i = 0; i < textTracks.length; i++) {
		var track = textTracks[i];

		var trackName = (track.kind === "metadata") ? "Off" : track.label;
		var selected = (track.kind === "metadata");

		this.captionData.menu.addItemToMenu({title:trackName, selected:selected, source_index:trackIncrementor});

		trackIncrementor++;
	}
};


// 
/************************************************************************************/
Captions.prototype.destroy = function(event) {
	this.destroyEventBindings();

};

