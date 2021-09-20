

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Player Handler Controller Class
//
//  File: 			lib/player/player-handler.js
//
//  Description:   	This class serves as the primary controller for the video playback experience.  It's
//  				reponsible for interfacing with the HTML5 player component, managing the media object
//  				data and also managing the playback model and sequential playback handling.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	lib/player/html5-player.js
//  
//  Test Streams:
//  https://link.theplatform.com/s/Np8MhC/wYTLlpOQ6Vid?feed=New%20Brand%20Video%20API%20Feed&formats=m3u&embedded=true&tracking=true&platform=web&rays=defghijkcba
//	https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd
//	http://www.bok.net/dash/tears_of_steel/cleartext/stream.mpd
//	
//	https://content.uplynk.com/7e70519c486d4139b7473f8b5c4af7b0.m3u8 // Llama
//	http://www.streambox.fr/playlists/x36xhzz/x36xhzz.m3u8 // Big Buck Bunny
//	
//	Test Files:
//	http://clips.vorwaerts-gmbh.de/big_buck_bunny.ogv
//	http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4
//	http://clips.vorwaerts-gmbh.de/big_buck_bunny.webm
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// PlayerHandler Constructor
/***********************************************************************************************************/
function PlayerHandler(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	this.establishEventBindings();
	
	this.prepareNewMedia(instanceProperties.mediaObjects);

	vertex.logNewInstance(this.instanceName);
};


// Establishes the media object and active elements in preparation for playback.
/***********************************************************************************************************/
PlayerHandler.prototype.prepareNewMedia = function(mediaObjects) {
	this.mediaObjects = mediaObjects;
	this.activeMediaObject = {
		loaded: false,
		played: false,
		completed: false,
		data: null,
		type: null,
		index: -1
	}

	// Stores a local copy of the active config and active media object for use within this plugin.
    this.activeElements = this.sourceInstance.activeElements;
};


// Establishes boilerplate variables and any other variables that will have module scope.
/***********************************************************************************************************/
PlayerHandler.prototype.establishModuleVariables = function(mediaObjects) {
	this.preloadFirstMediaObject = false;
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// Event Handlers //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Establish the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
PlayerHandler.prototype.establishEventBindings = function() {
	var source = this;

	if (this.sourceInstance.main !== null) {

		// Standard Setup Events
		this.sourceInstance.main.addEventListener("OnPlayerControllerReady", function(event) {source.videoPlayerAvailable(event)});
		this.sourceInstance.main.addEventListener("OnModelReady", function(event) {source.videoModelAvailable(event)});

		// Common Interface Events
		this.sourceInstance.main.addEventListener("OnRequestDestroy", function(event) {source.destroy(source, event)});
		this.sourceInstance.main.addEventListener("OnRequestMediaPreload", function(event) {source.requestMediaPreload(event)});
		this.sourceInstance.main.addEventListener("OnRequestMediaUpdate", function(event) {source.requestMediaUpdate(event)});
		this.sourceInstance.main.addEventListener("OnRequestMediaPlay", function(event) {source.requestMediaPlay(event)});
		this.sourceInstance.main.addEventListener("OnRequestMediaPause", function(event) {source.requestMediaPause(event)});
		this.sourceInstance.main.addEventListener("OnRequestMediaPlayPause", function(event) {source.requestMediaPlayPause(event)});
		this.sourceInstance.main.addEventListener("OnRequestMediaSeek", function(event) {source.requestMediaSeek(event)});
		this.sourceInstance.main.addEventListener("OnRequestMediaMute", function(event) {source.requestMediaMute(event)});

		this.sourceInstance.main.addEventListener("OnMediaCanPlay", function(event) { source.onMediaCanPlay(event); });
	}
};


// Destroy the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
PlayerHandler.prototype.destroyEventBindings = function() {
	var source = this;

	if (this.sourceInstance.main !== null) {
		// Standard Setup Events
		this.sourceInstance.main.removeEventListener("OnPlayerControllerReady", function(event) {source.videoPlayerAvailable(event)});
		this.sourceInstance.main.removeEventListener("OnModelReady", function(event) {source.videoModelAvailable(event)});

		// Common Interface Events
		this.sourceInstance.main.removeEventListener("OnRequestDestroy", function(event) {source.destroy(source, event)});
		this.sourceInstance.main.removeEventListener("OnRequestMediaPreload", function(event) {source.requestMediaPreload(event)});
		this.sourceInstance.main.removeEventListener("OnRequestMediaUpdate", function(event) {source.requestMediaUpdate(event)});
		this.sourceInstance.main.removeEventListener("OnRequestMediaPlay", function(event) {source.requestMediaPlay(event)});
		this.sourceInstance.main.removeEventListener("OnRequestMediaPause", function(event) {source.requestMediaPause(event)});
		this.sourceInstance.main.removeEventListener("OnRequestMediaPlayPause", function(event) {source.requestMediaPlayPause(event)});
		this.sourceInstance.main.removeEventListener("OnRequestMediaSeek", function(event) {source.requestMediaSeek(event)});
		this.sourceInstance.main.removeEventListener("OnRequestMediaMute", function(event) {source.requestMediaMute(event)});

		this.sourceInstance.main.removeEventListener("OnMediaCanPlay", function(event) { source.onMediaCanPlay(event); });
	}
};


// Called when the player handler is fully initialized.
/***********************************************************************************************************/
PlayerHandler.prototype.videoPlayerAvailable = function(event) {
	
	// If the player is online, proceed.
	if (this.sourceInstance.client.clientData.onLine) {
		
		// Test whether the current connection is open to the web...
		//source.sourceInstance.client.checkIfConnectionOpen(function(connectionOpen){
			
			// If it's determined that the connection is open to the web, proceed with player.
			//if (connectionOpen) {
				
				this.loadPlayer();
				this.loadModel(); // Retrieve media now...
			/*} else {
				vertex.logError("CONNECTION BLOCKED!");

				//** TODO - HANDLE connection blocked.
			}	
		});*/
	} else {
		vertex.logError("CONNECTION UNAVAILABLE");

		//** TODO - HANDLE no connection
	}
};


// Checks for a resume point
/***********************************************************************************************************/
PlayerHandler.prototype.onMediaCanPlay = function(event) {
	
	if (this.activeMediaObject.data.resume > 0) {
		this.playerInstance.seekMedia(this.activeMediaObject.data.resume);
		
		vertex.log(VERTEX_LOG.high, "Media Resumed @ "+this.activeMediaObject.data.resume+" Sec.");

		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaResume", {player: this.playerInstance, media: this.activeMediaObject, resume:this.activeMediaObject.data.resume });
		this.activeMediaObject.data.resume = 0;
	}
}


// 
/***********************************************************************************************************/
PlayerHandler.prototype.requestMediaPreload = function(event) {
	this.preloadFirstMediaObject = true;
	this.requestMediaUpdate(event);
};


// This method responds to requests to play new media
/***********************************************************************************************************/
PlayerHandler.prototype.requestMediaUpdate = function(event) {
	this.prepareNewMedia(event.detail.data); // Store the new media data.
	this.loadModel(); // Process the media data, creating a new model.
};


// This method
/***********************************************************************************************************/
PlayerHandler.prototype.requestMediaPlay = function(event) {
	this.playerInstance.playMedia();
};


// This method
/***********************************************************************************************************/
PlayerHandler.prototype.requestMediaPause = function(event) {
	this.playerInstance.pauseMedia();
};


// This method
/***********************************************************************************************************/
PlayerHandler.prototype.requestMediaPlayPause = function(event) {
	this.playerInstance.playPauseMedia();
};


// This method
/***********************************************************************************************************/
PlayerHandler.prototype.requestMediaSeek = function(event) {
	this.playerInstance.seekMedia(event.detail.data);
};


// This method
/***********************************************************************************************************/
PlayerHandler.prototype.requestMediaMute = function(event) {
	this.playerInstance.muteMedia(event.detail.data);
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// Player Handlers /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// This method loads the HTML5 Player component for video playback.
/***********************************************************************************************************/
PlayerHandler.prototype.loadPlayer = function() {
	var source = this;
	var instanceProperties = {
		instanceName: this.instanceName+"-html5player",
		playerContainer: this.sourceInstance.containers.videoContainer,
		playerProperties: {autoplay:this.activeElements.config.autoPlay, controls:this.activeElements.config.controls, muted:true, width:720, height:480, thumbnail:null},
		playerCallback: function(event) { source.playerEventHandler(event); }
	};
	
	this.playerInstance = new HTML5Player(this.sourceInstance, instanceProperties);

	// Updates the active elements object with the active player.
	this.activeElements.player = this.playerInstance;
};


// This method iterates to the next media object and coordinates the assembly of the composite model object.
/***********************************************************************************************************/
PlayerHandler.prototype.loadModel = function(overrideIndex = -1) {
	var nextIndex = (overrideIndex > -1) ? overrideIndex : this.activeMediaObject.index + 1;

	// If there are defined media objects, proceed with loading one now.
	if (this.mediaObjects && this.mediaObjects.length > 0) {

		// Reset Status Flags
		this.activeMediaObject.loaded = false;
		this.activeMediaObject.played = false;
		this.activeMediaObject.completed = false;
		
		// If there's another media object to play, load it up now.
		if (nextIndex < this.mediaObjects.length) {

			// Set up media object's data and index
			this.activeMediaObject.index = nextIndex;
			this.activeMediaObject.data = this.mediaObjects[nextIndex];

			// Check for passed values and fill with defaults if none.
			this.activeMediaObject.data.title = ((typeof this.activeMediaObject.data.title !== 'undefined') ? this.activeMediaObject.data.title : "");
			this.activeMediaObject.data.thumbnail = ((typeof this.activeMediaObject.data.thumbnail !== 'undefined') ? this.activeMediaObject.data.thumbnail : "");

			// Updates the active elements object with the active media
			this.activeElements.media = this.activeMediaObject;
			
			// If there's a defined playback url, then it's Direct Playback
			if (typeof this.mediaObjects[nextIndex].url !== 'undefined') {
				this.activeMediaObject.type = vertex.c.PLAYBACK_TYPES.direct;
				
				vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnModelReady", this.activeElements );
				
			// If there's a defined playback id with no playback url, then it's API Play
			} else if (typeof this.mediaObjects[nextIndex].id !== 'undefined') {
				this.activeMediaObject.type = vertex.c.PLAYBACK_TYPES.api;
				vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnModelRequested", this.activeElements );
			
			// If there's neither a playback URL or a playback ID, then dispatch an error.
			} else {
				vertex.logError("INVALID CONTENT!");

				vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaObjectError", this.mediaObjects);

				//** TODO - HANDLE 'Missing Content Error'
			}

		// If there aren't any more media objects, then handle the end of playlist
		} else {
			// If loopPlay is true, reset the playlist now.
			if (this.activeElements.config.loopPlay) {
				this.loadModel(0);
			} else {
				//this.playerInstance.seekMedia(0);

				//** TODO - Show Thumbnail DOM
			}

			vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnAllMediaCompleted", this.mediaObjects);
		}

	// If there's no content defined in the first place, then dispatch an error.
	} else {
		vertex.log(VERTEX_LOG.priority, "No Media, waiting...");

		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnReadyForMedia", false);

		//vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnShowLoadingRequest", false);

		//this.sourceInstance.errors.reportPlaybackError(VERTEX_ERRORS.prefix + VERTEX_ERRORS.error_content_missing.code, VERTEX_ERRORS.error_content_missing.message, null, "none");
	}
};


// Called when the video playback model is available.
/***********************************************************************************************************/
PlayerHandler.prototype.videoModelAvailable = function(event) {
	vertex.log(VERTEX_LOG.priority, "Model Ready!");

	// Updates the active media object with the one populated by the API.
	this.activeMediaObject = event.detail.data.media;

	// Updates the active elements object with the active media
	this.activeElements.media = this.activeMediaObject;

	// Replaces the current media object in the list with the newly populated one from the API.
	this.mediaObjects[this.activeMediaObject.index] = this.activeMediaObject.data;
	
	// Decides whether it should play or preload the data.
	if (!this.preloadFirstMediaObject) {
		
		// Plays the media with the newly received metadata.
		this.playerInstance.playMediaWithMetadata( this.activeMediaObject );
	} else {
		
		// Preloads the active media object for later play.
		this.playerInstance.preloadMediaWithMetadata( this.activeMediaObject );
	}
};


// This method handles HTML5 Player component specific playback events in real time.
/***********************************************************************************************************/
PlayerHandler.prototype.playerEventHandler = function(event) {
	vertex.log(VERTEX_LOG.dev, event); // Default event logging

	// Player Ready
	if (event.event_type === vertex.c.PLAYER_EVENTS.player_ready) {
		vertex.log(VERTEX_LOG.priority, "Player Ready!");
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnPlayerReady", this.activeElements);

	// Media Available
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_available) {
		vertex.log(VERTEX_LOG.medium, "Media Available!");
		
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaAvailable", this.activeElements);

	// Media Loading
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_loading) {
		
		if (!this.activeMediaObject.loaded) {
			this.activeMediaObject.loaded = true;

			vertex.log(VERTEX_LOG.medium, "Media Loaded!");
			vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaReady", this.activeElements);
		}

	// Media progressing / playing
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_progress) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaDownloading", this.activeElements);

	// Media complete
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_complete) {
		
		if (!this.activeMediaObject.completed) {
			this.activeMediaObject.completed = true;

			vertex.log(VERTEX_LOG.high, "Media Complete!");
			vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaComplete", this.activeElements);

			// Load the next video if available.
			this.loadModel();
		}

	// Media Resume
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_resume) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaPlay", this.activeElements);

	// Media Pause
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_pause) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaPause", this.activeElements);

	// Media Error
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_error) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaError", this.activeElements);
		this.sourceInstance.errors.reportPlaybackError(VERTEX_ERRORS.prefix + VERTEX_ERRORS.error_media_playback.code, VERTEX_ERRORS.error_media_playback.message, null, null);
	
	// Media Buffering
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_buffer) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaBuffering", this.activeElements);

	// Media Cached
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_canplay) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaCanPlay", this.activeElements);

	// Media Cached
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.media_cached) {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaCached", this.activeElements);

	// Playhead Update
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.playhead_change) {
		
		// If the activeMediaObject hasn't played yet, proceed here.
		if (!this.activeMediaObject.played) {
			this.activeMediaObject.played = true;

			vertex.log(VERTEX_LOG.high, "Media Playing!");
			vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaPlayStart", this.activeElements);

			// Show the player now that it's playing
			this.playerInstance.showPlayerObject(true);
		}

		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnMediaPlaying", this.activeElements);
	// Volume Update
	} else if (event.event_type === vertex.c.PLAYER_EVENTS.volume_change) {
		//vertex.log(VERTEX_LOG.medium, "Media Available");
		vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnVolumeUpdate", event);
	}
};


// This method should be used for tear-down.
/***********************************************************************************************************/
PlayerHandler.prototype.destroy = function(source, event) {
	source.mediaObjects = null;
	source.activeMediaObject = null;
	source.playerInstance = null;

	this.destroyEventBindings();
};
