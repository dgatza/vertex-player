

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Audio Tracks Handler Class
//
//  File: 			lib/player/audiotracks.js
//
//  Description: 	This class extends the HTML5 player component and handles audio tracks for the active media.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// AudioTracks Constructor
/***********************************************************************************************************/
function AudioTracks(sourceInstance, instanceProperties) {
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
AudioTracks.prototype.establishModuleVariables = function() {
	this.audioData = {ready: false, started: false, menu:null};
	
	// Stores a local copy of the active config and active media object for use within this plugin.
	this.activeElements = this.sourceInstance.activeElements;
}


// Establish the bindings that the player handler should be tapped into.
/************************************************************************************/
AudioTracks.prototype.establishEventBindings = function() {
	var source = this;
	
	this.sourceInstance.main.addEventListener("OnModelReady", function(event) { source.onModelReady(event); });
	this.sourceInstance.main.addEventListener("OnMenusReady", function(event) { source.onMenusReady(event); });
	this.sourceInstance.main.addEventListener("OnMediaCanPlay", function(event) { source.updateAudioTracksMenu(event); });
	this.sourceInstance.main.addEventListener("OnAudioMenuItemClicked", function(event) { source.onAudioTracksMenuItemClicked(event); });
	this.sourceInstance.main.addEventListener("OnRequestDestroy", function(event) { source.destroy(event); });
};


// Destroy the bindings that the player handler should be tapped into.
/************************************************************************************/
AudioTracks.prototype.destroyEventBindings = function() {
	var source = this;
	
	if (this.sourceInstance.main !== null) {
		this.sourceInstance.main.removeEventListener("OnModelReady", function(event) { source.onModelReady(event); });
		this.sourceInstance.main.removeEventListener("OnMenusReady", function(event) { source.onMenusReady(event); });
		this.sourceInstance.main.removeEventListener("OnMediaCanPlay", function(event) { source.updateAudioTracksMenu(event); });
		this.sourceInstance.main.removeEventListener("OnAudioMenuItemClicked", function(event) { source.onAudioTracksMenuItemClicked(event); });
		this.sourceInstance.main.removeEventListener("OnRequestDestroy", function(event) { source.destroy(event); });
	}
};


// 
/************************************************************************************/
AudioTracks.prototype.onModelReady = function(event) {
	this.audioData.ready = true;
	this.audioData.started = false;
}


// 
/************************************************************************************/
AudioTracks.prototype.onMenusReady = function(event) {
	var menuData = event.detail.data;

	this.audioData.menu = menuData.getComponent("audioMenu");
}


// 
/************************************************************************************/
AudioTracks.prototype.updateAudioTracksMenu = function(event) {
	var audioTracks = this.activeElements.player.audioTracks();

	if (audioTracks) {
		if (this.audioData.ready && !this.audioData.started) {
			this.audioData.ready = false;
			this.audioData.started = true;

			// If the menu already has items, clear it out now for new items
			if (this.audioData.menu.returnMenuItems().length > 0) {
				this.audioData.menu.removeAllItems();
			}

			// Iterate through all of the audio track and add each one.
			for (var i = 0; i < audioTracks.length; i++) {
				var track = audioTracks[i];
				var trackName = (typeof track.name !== "undefined") ? track.name : track.label;
				trackName = ( !vertex.tools.isEmptyString(trackName) ) ? trackName : "Native Audio";

				var trackSelected = (typeof track.default !== "undefined") ? track.default : track.enabled;
				
				this.audioData.menu.addItemToMenu({title:trackName, selected:trackSelected, source_index:i});
			}
		}
	}
};


// 
/************************************************************************************/
AudioTracks.prototype.onAudioTracksMenuItemClicked = function(event) {
	var newIndex = event.detail.data.index;

	this.activeElements.player.switchAudioTracks(newIndex);
}


// 
/************************************************************************************/
AudioTracks.prototype.destroy = function(event) {
	this.destroyEventBindings();

};
