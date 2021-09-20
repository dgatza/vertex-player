

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  HTML5 Media Player Class
//
//  File: 			lib/player/html5-player.js
//
//  Description: 	Consolidates the base HTML5 media player functionality into an easy to use collection
//                 	of tools which can be easily integrated into any HTML5 project.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// HTML5Player Constructor
/***********************************************************************************************************/
function HTML5Player(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	this.establishModuleVariables(instanceProperties);
	this.establishEventBindings();

	this.createPlayerObjectWithDOM(instanceProperties.playerContainer, instanceProperties.playerCallback, instanceProperties.playerProperties);

	vertex.logNewInstance(this.instanceName);

	this.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.player_ready, event_data: this.mediaData});
}


// Establishes boilerplate variables and any other variables that will have module scope.
/************************************************************************************/
HTML5Player.prototype.establishModuleVariables = function(moduleData) {
	
	this.mediaData = {container: moduleData.playerContainer, callback: moduleData.playerCallback, properties:moduleData.playerProperties, source: null, type: null, player: null, callback: null, cookies: null, engine: {hls:null, dash:null}, metadata: null, volume: vertex.c.VOLUME_DEFAULT, status: {firstLoad:true, playersLoaded:0, playImmediately:false}};

	this.mediaData.cookies = new Cookies(this.sourceInstance, {instanceName:this.instanceName+"-keys"});

	var savedVolume = this.mediaData.cookies.getCookie("VERTEX_VOLUME");

	if (savedVolume !== null) {
		vertex.log(VERTEX_LOG.high, savedVolume, "Saved Volume");
		this.mediaData.volume = savedVolume;
	}

	// Stores a local copy of the active config and active media object for use within this plugin.
    this.activeElements = this.sourceInstance.activeElements;
}


// Establish the bindings that the player handler should be tapped into.
/************************************************************************************/
HTML5Player.prototype.establishEventBindings = function() {
	var source = this;

	if (this.sourceInstance.main !== null) {
		// Standard Setup Events
		this.sourceInstance.main.addEventListener("OnShowPlayerRequest", function(event) { source.onShowPlayerRequestHandler(event)} );

		// Common Interface Events
		this.sourceInstance.main.addEventListener("OnRequestDestroy", function(event) { source.destroy(event)} );
	}
};


// Destroy the bindings that the player handler should be tapped into.
/************************************************************************************/
HTML5Player.prototype.destroyEventBindings = function() {
	var source = this;

	if (this.sourceInstance.main !== null) {
		// Standard Setup Events
		this.sourceInstance.main.removeEventListener("OnShowPlayerRequest", function(event) { source.onShowPlayerRequestHandler(event)} );

		// Common Interface Events
		this.sourceInstance.main.removeEventListener("OnRequestDestroy", function(event) { source.destroy(event)} );

		// Place a listener on the video tag that listens for closure of native players
		videoObject.removeEventListener("webkitendfullscreen", function(event) {
			vertex.events.dispatchCustomEvent(source.sourceInstance.main, "OnNativePlayerClose", false);
		});
	}
};


// This method creates a new player element, embeds it and populates its base parameters.
/***********************************************************************************************************/
HTML5Player.prototype.createPlayerObjectWithDOM = function(playerContainer, playerCallback, playerProperties ) {
	var source = this;

	// Create the player elements
	videoObject = document.createElement('video');
	this.mediaData.source = document.createElement("source");

	playerContainer.appendChild(videoObject);
	videoObject.appendChild(this.mediaData.source);

	videoObject.id = this.instanceName+"-"+this.mediaData.status.playersLoaded;
	videoObject.className = "video-player";
	videoObject.preload = "auto";

	//videoObject.playsInline = true; //iOS Web support

	/*videoObject.poster = playerProperties.thumbnail*/;
	videoObject.volume = vertex.c.VOLUME_DEFAULT;
	
	//videoObject.defaultMuted = playerProperties.muted;
	//videoObject.autoplay = playerProperties.autoplay;
	videoObject.controls = false;

	this.mediaData.status.playImmediately = playerProperties.autoplay;

	// Place a listener on the video tag that listens for closure of native players
	videoObject.addEventListener("webkitendfullscreen", function(event) {
		vertex.events.dispatchCustomEvent(source.sourceInstance.main, "OnNativePlayerClose", false);
	});

	// If controls are allowed, create a click event to toggle play/pause
	if (this.sourceInstance.activeConfiguration.controls) {
    	
    	videoObject.onclick = function(event) {
    		vertex.events.dispatchCustomEvent(source.sourceInstance.main, "OnVideoComponentClicked", false);
    	}
	}


	this.setPlayerObjectWithDOM(videoObject, playerCallback);

	this.mediaData.status.playersLoaded++;
	
	return videoObject;
};


// This method creates a new player element, embeds it and populates its base parameters.
/***********************************************************************************************************/
HTML5Player.prototype.destroyPlayerObjectWithDOM = function() {
	this.unloadPlayer();
	this.mediaData.container.removeChild(this.mediaData.player);

	this.mediaData.player = null;
};


// This method creates a new player element, embeds it and populates its base parameters.
/***********************************************************************************************************/
HTML5Player.prototype.unloadPlayer = function() {
	this.mediaData.player.removeEventListener("webkitendfullscreen", function(event) {
		vertex.events.dispatchCustomEvent(source.sourceInstance.main, "OnNativePlayerClose", false);
	});

	this.mediaData.player.onclick = null;
	this.mediaData.player.pause();
	this.mediaData.player.removeAttribute('src'); // empty source
	this.mediaData.player.load();
};


// This method creates a new player element, embeds it and populates its base parameters.
/***********************************************************************************************************/
HTML5Player.prototype.updatePlayerObjectWithDOM = function(playerContainer, playerCallback, playerProperties ) {

	this.destroyPlayerObjectWithDOM();
	this.createPlayerObjectWithDOM(this.mediaData.container, this.mediaData.callback, this.mediaData.properties);

};


// This method responds to the OnShowPlayerRequest event.
/***********************************************************************************************************/
HTML5Player.prototype.onShowPlayerRequestHandler = function(event) {
	this.showPlayerObject(event.detail.data);
};


// This method shows or hides the player.
/***********************************************************************************************************/
HTML5Player.prototype.showPlayerObject = function(showPlayer) {
	
	if (showPlayer) {
		vertex.tools.show(this.mediaData.player);
	} else {
		vertex.tools.hide(this.mediaData.player);
	}
};


// This method establishes the media player dom element for later using the player's dom id.
/***********************************************************************************************************/
HTML5Player.prototype.setPlayerObjectWithName = function( playerName, playerCallback ) {
	setPlayerObjectWithDOM( document.getElementById( playerName ), playerCallback );
};


// This method establishes the media player dom element for later using the player's dom element.
/***********************************************************************************************************/
HTML5Player.prototype.setPlayerObjectWithDOM = function( playerObject, playerCallback ) {
	this.mediaData.player = playerObject;
	this.mediaData.callback = playerCallback;
	
	this.establishPlayerEventBindings( this.mediaData.player );
};


// This method returns the stored media player dom element.
/***********************************************************************************************************/
HTML5Player.prototype.getPlayerObject = function() {
	return this.mediaData.player;
};


// This method accepts a metadata object in order to start playback and perform a few other actions.
/***********************************************************************************************************/
HTML5Player.prototype.playMediaWithMetadata = function( metadataObject ) {
	//** TODO - Add extra stuff like captions and other stuff.
	
	this.mediaData.metadata = metadataObject;

	// If a thumbnail is found, update the player's poster now.
	if (metadataObject.data.thumbnail !== null && metadataObject.data.thumbnail.includes("http")) {
		this.mediaData.player.poster = metadataObject.data.thumbnail;
	}
	
	this.playMediaWithURL( metadataObject.data.url, ((typeof metadataObject.data.type !== "undefined") ? metadataObject.data.type : null));
};


// This method immediately plays a new video using the passed URL.
/***********************************************************************************************************/
HTML5Player.prototype.playMediaWithURL = function( mediaURL, mediaType=null ) {
	this.mediaData.status.playImmediately = true;

	this.loadMediaWithURL( mediaURL, mediaType );
};


// 
/***********************************************************************************************************/
HTML5Player.prototype.preloadMediaWithMetadata = function( metadataObject ) {
	
	this.mediaData.status.playImmediately = false;

	this.playMediaWithMetadata(metadataObject);
};


// 
/***********************************************************************************************************/
HTML5Player.prototype.loadMediaWithMetadata = function( metadataObject ) {
	this.mediaData.metadata = metadataObject;

	this.loadMediaWithURL(metadataObject.data.url, ((typeof metadataObject.data.type !== "undefined") ? metadataObject.data.type : null));
};


// This method loads a new video for later play, using the passed URL.
/***********************************************************************************************************/
HTML5Player.prototype.loadMediaWithURL = function( mediaURL, mediaType=null ) {
	source = this;

	// If this is a subsequent request to the original media request, update the player now.
	if (this.mediaData.status.playersLoaded > 1) {
		this.updatePlayerObjectWithDOM();
	}
	
	// If the media type is explicitely passed, use it, otherwise find out what type it is.
	if (mediaType) {
		this.mediaData.type = mediaType;
	} else {
		this.mediaData.type = this.getStreamType(mediaURL);
	}

	// Update the URL
	this.mediaData.source = mediaURL;

	// If the player has been defined, proceed now.
	if (this.mediaData.player) {

		// If the media is HLS, load HLS engine
		if (this.mediaData.type === vertex.c.STREAM_TYPES.hls) {
			if (!this.mediaData.engine.hls) {
				
				// Loads hls.js now when needed.
				this.sourceInstance.appendToAllScripts({script_id:"hls", script_path:"/lib/player/hls.js"}, function(event) {  source.hlsPlayerReady(event); });
			} else {
				this.hlsPlayerReady(null);
			}
		// If the media is MPEG-DASH, load DASH engine
	    } else if (this.mediaData.type === vertex.c.STREAM_TYPES.dash) {
	    	if (!this.mediaData.engine.dash) {
	    		
	    		// Loads dash.js now when needed.
	    		this.sourceInstance.appendToAllScripts({script_id:"dash", script_path:"/lib/player/dash.js"}, function(event) { source.dashPlayerReady(event); });	
	    	} else {
	    		this.dashPlayerReady(null);
	    	}

		// If the media is a static file (ie. mp4/ogg/webm), load that now.	
	    } else {
	    	this.html5PlayerReady();
	    }
	}
};


// This method is executed when the HLS player object is ready to go.
/***********************************************************************************************************/
HTML5Player.prototype.hlsPlayerReady = function(event) {
	var source = this;

	if (this.mediaData.engine.hls) {
		this.mediaData.engine.hls.destroy();
	}

	if (Hls.isSupported()) {
    	var hls = new Hls(); //{autoStartLoad: this.mediaData.player.autoplay});
    	
    	this.mediaData.engine.hls = hls;

    	hls.loadSource(this.mediaData.source);
    	hls.attachMedia(this.mediaData.player);
    	hls.on(Hls.Events.MANIFEST_LOADED,function() {
      		
    		// Dispatches 'MediaAvailable' event
      		source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_available, event_data: source.mediaData.engine.hls});

      		// Attaches audio tracks to the HTML5 video tag.
      		source.mediaData.player.audioTracks = hls.audioTracks;

      		//vertex.log(VERTEX_LOG.priority, hls.audioTracks, "AudioTracks");
      		//vertex.log(VERTEX_LOG.priority, source.mediaData.player.audioTracks, "HTML5 Audio Tracks");
    		
    		// Consolidate post-session-ready activity here.
			source.mediaSessionReady();
    	});

    // Try Native
	} else if (this.sourceInstance.client.clientData.supportsHLS) {
		this.html5PlayerReady();
	} else {
		this.sourceInstance.errors.reportPlaybackError(VERTEX_ERRORS.prefix + VERTEX_ERRORS.error_media_supported.code, VERTEX_ERRORS.error_media_supported.message, null, null);
	}
};


// This method is executed when the Dash player object is ready to go.
/***********************************************************************************************************/
HTML5Player.prototype.dashPlayerReady = function(event) {
	if (!this.mediaData.engine.dash) {
		var dashPlayer = new dashjs.MediaPlayer();
		dash = dashPlayer.create();

		dash.initialize(this.mediaData.player, this.mediaData.source, false);
		this.mediaData.engine.dash = dash;

		this.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_available, event_data: this.mediaData.engine.dash});

		vertex.log(VERTEX_LOG.priority, dash, "Dash");
		vertex.log(VERTEX_LOG.priority, dash.getTracksFor("text"), "Text");
		vertex.log(VERTEX_LOG.priority, this.mediaData.player.audioTracks, "HTML5 Audio Tracks");
	} else {
		// Loads a new media source
	    this.mediaData.engine.dash.attachSource(this.mediaData.source);
		
		// Dispatches 'MediaAvailable' event
		this.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_available, event_data: this.mediaData.engine.dash});
		
		//** TODO - Get Audio Tracks for DASH
		//this.mediaData.player.audioTracks = this.mediaData.engine.dash.getTracksFor("text");
	}

	// Consolidate post-session-ready activity here.
	this.mediaSessionReady();
};


// This method is executed when the HLS player object is ready to go.
/***********************************************************************************************************/
HTML5Player.prototype.html5PlayerReady = function(event) {
	this.mediaData.player.src = this.mediaData.source;
	    	
	// Dispatches 'MediaAvailable' event
	this.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_available, event_data: this.mediaData.player});

	// Consolidate post-session-ready activity here.
	this.mediaSessionReady();
};


// 
/***********************************************************************************************************/
HTML5Player.prototype.mediaSessionReady = function() {
	vertex.log(VERTEX_LOG.priority, "Media Session Ready!");

	// Ready to play
	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnSessionReady", this.activeElements);
	
	// If autoplay is true, play now.
	if (this.mediaData.status.playImmediately) {
		this.playMedia();
	}
};


// This method figures out which type of stream we need to use.
/***********************************************************************************************************/
HTML5Player.prototype.getStreamType = function( mediaURL ) {
	
	// Note: If a stream type is found in the list, it needs to be fully supported.
	for (var type in vertex.c.STREAM_TYPES) {
		if (mediaURL.search(vertex.c.STREAM_TYPES[type]) > 0) {
			return vertex.c.STREAM_TYPES[type];
		}
	}

	return null;
};


// This method toggles the play / pause method calls based on the current 'paused' state of the player.
/***********************************************************************************************************/
HTML5Player.prototype.playPauseMedia = function() {
	if (this.mediaData.player.paused) {
		this.playMedia();
	} else {
		this.pauseMedia();
	}
};


// This method attempts to play the current media.
/***********************************************************************************************************/
HTML5Player.prototype.playMedia = function(iteration=0) {
	
	// If player just loaded, set these initial values for first play.
	if (this.mediaData.status.firstLoad) {
		this.mediaData.status.firstLoad = false;
		
		// For first load, it sets the initial volume
		this.setVolume(this.mediaData.volume);
	}

	// If the player exists, attempt to play now.
	if (this.mediaData.player) {
		var promise = this.mediaData.player.play();

		// If the promise is undefined, then autoplay is blocked, mute now and handle accordingly.
		if (promise !== undefined) {
			promise.then(_ => {
				if (iteration === 0) {
					vertex.log(VERTEX_LOG.priority, "Autoplay With Sound Allowed!");
					vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnAutoPlaySuccess", this.activeElements);
				} else {
					vertex.log(VERTEX_LOG.priority, "Autoplay Without Sound Allowed!");
					vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnMutedAutoPlaySuccess", this.activeElements);
				}
			}).catch(error => {
				vertex.log(VERTEX_LOG.priority, "Autoplay With Sound Blocked By Browser!");
				vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnAutoPlayBlocked", this.activeElements);

				// Attempt to mute and autoplay again.  Some browsers allow autoplay only when muted.
				if (iteration === 0) {
					this.muteMedia(true);

					vertex.log(VERTEX_LOG.priority, "Attempting Autoplay Without Sound...");
					vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnMutedAutoPlayAttempted", this.activeElements);

					this.playMedia(1);
				} else {
					vertex.log(VERTEX_LOG.priority, "Autoplay Failed Completely!");
					this.setVolume(this.mediaData.volume);
					vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnAutoPlayFail", this.activeElements);
				}
			});
		}
	}
};


// This method attempts to pause the current media.
/***********************************************************************************************************/
HTML5Player.prototype.pauseMedia = function() {
	if (this.mediaData.player) {
		this.mediaData.player.pause();
	}
};


// This method attempts to load/reload the current media
/***********************************************************************************************************/
HTML5Player.prototype.loadMedia = function() {
	if (this.mediaData.player) {
		this.mediaData.player.load();
	}
};


// This method attempts to seek to a new point in the current media
/***********************************************************************************************************/
HTML5Player.prototype.seekMedia = function(seekPoint) {
	if (this.mediaData.player) {
		this.mediaData.player.currentTime = seekPoint;
	}
};


// This method attempts to seek to a new point in the current media
/***********************************************************************************************************/
HTML5Player.prototype.seekMediaProgress = function(seekProgress) {
	var seekPoint = Math.round(this.mediaDuration() * seekProgress);
	
	this.seekMedia(seekPoint);
};


// This method attempts to skip forward or back in the media using a skip interval
/***********************************************************************************************************/
HTML5Player.prototype.skipMedia = function(skipInterval) {
	if (this.mediaData.player) {
		if ((this.mediaData.player.currentTime + skipInterval) < 0) {
			this.mediaData.player.currentTime = 0;
		} else if ((this.mediaData.player.currentTime + skipInterval) > this.mediaData.player.duration) {
			this.mediaData.player.currentTime = this.mediaData.player.duration - 2;
		} else {
			this.mediaData.player.currentTime += skipInterval;
		}
	}
};

// This method attempts to mute/unmute the current media using the passed boolean.
/***********************************************************************************************************/
HTML5Player.prototype.muteMedia = function( muteAudio ) {
	if (this.mediaData.player) {
		
		// Saves the volume level and sets to 0 on mute.
		if (muteAudio) {
			this.mediaData.volume = this.mediaData.player.volume;
			this.mediaData.player.volume = 0.0;
		
		// Sets volume level to saved value on unmute.
		} else {
			this.mediaData.player.volume = this.mediaData.volume;
		}

		this.mediaData.player.muted = muteAudio;
	}
};


// This method attempts to mute/unmute the current media using the passed boolean.
/***********************************************************************************************************/
HTML5Player.prototype.toggleMute = function() {
	if (this.mediaData.player) {
		this.muteMedia(!this.mediaData.player.muted);
		//this.mediaData.player.muted = !this.mediaData.player.muted;
	}
};


// This method attempts to update the player volume 
/***********************************************************************************************************/
HTML5Player.prototype.setVolume = function( volumeLevel, saveNewValue=true ) {
	if (this.mediaData.player) {
		if (volumeLevel > 0.0) {
			this.mediaData.volume = volumeLevel;
			this.muteMedia(false);
		} else {
			this.muteMedia(true);
		}

		this.mediaData.player.volume = volumeLevel;

		// If the new value should be saved, update that now
		if (saveNewValue) {
			this.mediaData.cookies.setCookie("VERTEX_VOLUME", volumeLevel, vertex.c.INTERVALS.time_3_month.ms);
		}
	}
};


// This method attempts to mute/unmute the current media using the passed boolean.
/***********************************************************************************************************/
HTML5Player.prototype.increaseVolume = function() {
	if (this.mediaData.player) {
		var currentVolume = this.mediaVolume();
		var newVolume = ((currentVolume+0.1) <= 1.0) ? (currentVolume+0.1) : 1.0;
		
		this.setVolume(newVolume);
	}
};


// This method attempts to mute/unmute the current media using the passed boolean.
/***********************************************************************************************************/
HTML5Player.prototype.decreaseVolume = function() {
	if (this.mediaData.player) {
		var currentVolume = this.mediaVolume();
		var newVolume = ((currentVolume-0.1) >= 0.0) ? (currentVolume-0.1) : 0.0;
		
		this.setVolume(newVolume);
	}
};


// This method resizes the media player dom element using the passed dimensions.
/***********************************************************************************************************/
HTML5Player.prototype.updatePlayerWithDimensions = function( playerWidth, playerHeight ) {
	if (this.mediaData.player) {
		this.mediaData.player.width = playerWidth;
		this.mediaData.player.height = playerHeight;
	}
};


// This method returns the player muted value.
/***********************************************************************************************************/
HTML5Player.prototype.mediaPaused = function() {
	return ((this.mediaData.player) ? this.mediaData.player.paused : true);
};


// This method returns the player muted value.
/***********************************************************************************************************/
HTML5Player.prototype.mediaMuted = function() {
	return ((this.mediaData.player) ? (this.mediaData.player.muted || this.mediaData.player.volume === 0.0) : true);
};


// This method returns the player muted value.
/***********************************************************************************************************/
HTML5Player.prototype.mediaProgressTime = function() {
	return ((this.mediaData.player) ? this.mediaData.player.currentTime : 0);
};


// This method returns the player muted value.
/***********************************************************************************************************/
HTML5Player.prototype.mediaProgressPercentage = function() {
	return ((this.mediaData.player) ? (this.mediaData.player.currentTime / this.mediaData.player.duration) : 0);
};


// This method returns the player muted value.
/***********************************************************************************************************/
HTML5Player.prototype.mediaVolume = function() {
	return ((this.mediaData.player) ? this.mediaData.player.volume : 0);
};


// This method returns the player muted value.
/***********************************************************************************************************/
HTML5Player.prototype.mediaDuration = function() {
	return ((this.mediaData.player) ? Math.floor(this.mediaData.player.duration) : 0);
};


// This method returns the player muted value.
/***********************************************************************************************************/
HTML5Player.prototype.mediaPlayer = function() {
	return this.mediaData.player;
};


// This method returns the player muted value.
/***********************************************************************************************************/
HTML5Player.prototype.audioTracks = function() {
	return ((this.mediaData.player) ? this.mediaData.player.audioTracks : null);
};


// 
/***********************************************************************************************************/
HTML5Player.prototype.switchAudioTracks = function(trackIndex) {
	
	if (this.mediaData.player) {
		
		if (this.mediaData.type === vertex.c.STREAM_TYPES.hls) {
			if (trackIndex > -1 && trackIndex < this.mediaData.player.audioTracks.length) {
				if (this.mediaData.engine.hls !== null) {
					this.mediaData.engine.hls.audioTrack = trackIndex;
				} else {
					for (var i=0; i < this.mediaData.player.audioTracks.length; i++) {
						this.mediaData.player.audioTracks[i].enabled = false;
					}

					this.mediaData.player.audioTracks[trackIndex].enabled = true;
				}
			}/* else {
				TODO: Dash Audio track handling
			}*/
		}
	}
};


// This method returns the player muted value.
/***********************************************************************************************************/
HTML5Player.prototype.textTracks = function() {
	return ((this.mediaData.player) ? this.mediaData.player.textTracks : null);
};


// 
/***********************************************************************************************************/
HTML5Player.prototype.switchTextTracks = function(trackIndex) {
	
	if (this.mediaData.player) {

		for (var i = 0; i < this.mediaData.player.textTracks.length; i++) {
			this.mediaData.player.textTracks[i].mode = "hidden";
		}

		this.mediaData.player.textTracks[trackIndex].mode = "showing";
	}
};


// This method establishes the media player's listeners which are inevitably passed to a callback.
/***********************************************************************************************************/
HTML5Player.prototype.establishPlayerEventBindings = function( playerObject ) {
	var source = this;

	if (playerObject) {
		playerObject.onplay = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_resume, event_data: event}); };
		playerObject.onpause = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_pause, event_data: event}); };
		playerObject.oncanplay = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_canplay, event_data: event}); };
		playerObject.oncanplaythrough = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_cached, event_data: event}); };
		playerObject.onended = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_complete, event_data: event}); };
		playerObject.onloadstart = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_loading, event_data: event}); };
		playerObject.onprogress = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_progress, event_data: event}); };
		playerObject.ontimeupdate = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.playhead_change, event_data: event}); };
		playerObject.onvolumechange = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.volume_change, event_data: event}); };
		playerObject.onwaiting = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_buffering, event_data: event}); };
		playerObject.onerror = function(event) { source.mediaStatusHandler({event_type: vertex.c.PLAYER_EVENTS.media_error, event_data: playerObject.error}); };
	}
};


// This method establishes the media player's listeners which are inevitably passed to a callback.
/***********************************************************************************************************/
HTML5Player.prototype.destroyPlayerEventBindings = function( playerObject ) {
	var source = this;

	if (playerObject) {
		playerObject.onplay = null;
		playerObject.onpause = null;
		playerObject.oncanplay = null;
		playerObject.oncanplaythrough = null;
		playerObject.onended = null;
		playerObject.onloadstart = null;
		playerObject.onprogress = null;
		playerObject.ontimeupdate = null;
		playerObject.onvolumechange = null;
		playerObject.onwaiting = null;
		playerObject.onerror = null;
	}
};


// This method catches all player events and redirects them to the callback function if defined.
/***********************************************************************************************************/
HTML5Player.prototype.mediaStatusHandler = function( mediaStatus ) {
	
	if (this.mediaData) {
		if (this.mediaData.callback) {
			this.mediaData.callback( mediaStatus );
		}
	}
};


// This method 
/***********************************************************************************************************/
HTML5Player.prototype.destroy = function(event) {

	// Unloads Player
	this.destroyPlayerEventBindings();
	this.destroyPlayerObjectWithDOM();

	// Destroys support objects
	this.mediaData.source = null;
	this.mediaData.engine = null;
	this.mediaData.player = null;
	this.mediaData.callback = null;
	this.mediaData = null;

	vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnHTML5PlayerDestroyed", false);
};