

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Conviva Data Class
//
//  File: 			lib/plugins/conviva-data.js
//
//  Description: 	Allows you to connect Vertex Player to Conviva's player metrics service.  This was created
//					as an example of how an advanced video metrics platform could interface with the player.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	./conviva/conviva-core-sdk.min.js
//					./conviva/conviva-html5native-impl.js
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// ConvivaData Constructor
/***********************************************************************************************************/
function ConvivaData(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	this.establishModuleVariables();

	// Tying into player events is how your plugin stays plugged into the inner workings of the player.
	this.establishEventBindings();

	// All Vertex Player classes should report their instances to log when ready.
	vertex.logNewInstance(this.instanceName);
}


// Establishes all event bindings needed for this plugin to function properly
/***********************************************************************************************************/
ConvivaData.prototype.establishModuleVariables = function() {
	this.convivaScripts = [
		{script_id:"conviva-core", script_path:"/plugins/vertex/conviva/conviva-core-sdk.min.js"},
		{script_id:"conviva-html5", script_path:"/plugins/vertex/conviva/conviva-html5native-impl.js"}
	];

	this.convivaData = {status:{started:false}};
	this.convivaData.params = {};

	this.loadConvivaLibraries();

	// Stores a local copy of the active config and active media object for use within this plugin.
	this.activeElements = this.sourceInstance.activeElements;
};


// Establishes player event bindings for this plugin
/***********************************************************************************************************/
ConvivaData.prototype.establishEventBindings = function() {
	var source = this;

	this.sourceInstance.main.addEventListener("OnModelReady", function(event) { source.initializeConvivaSession(); });
	this.sourceInstance.main.addEventListener("OnMediaError", function(event) { source.onMediaError(event); });
	this.sourceInstance.main.addEventListener("OnMediaComplete", function(event) { source.onMediaComplete(event); });
}


// Removes player event bindings for this plugin
/***********************************************************************************************************/
ConvivaData.prototype.destroyEventBindings = function() {
	var source = this;
	
	if (this.sourceInstance.main !== null) {
		this.sourceInstance.main.removeEventListener("OnModelReady", function(event) { source.initializeConvivaSession(); });
		this.sourceInstance.main.removeEventListener("OnMediaError", function(event) { source.onMediaError(event); });
		this.sourceInstance.main.removeEventListener("OnMediaComplete", function(event) { source.onMediaComplete(event); });
	}
}


// Loads Conviva's third-party libraries for use within this plugin.
/***********************************************************************************************************/
ConvivaData.prototype.loadConvivaLibraries = function() {
	var source = this;
	var script = this.convivaScripts[0];

	this.sourceInstance.appendToAllScripts(script, function(event) { 
		vertex.log(VERTEX_LOG.priority, "Conviva Script Ready: "+script.script_id); 

		script = source.convivaScripts[1];

		source.sourceInstance.appendToAllScripts(script, function(event) {
			vertex.log(VERTEX_LOG.priority, "Conviva Script Ready: "+script.script_id);
		});
	});
}


// Defines Conviva's configuration data.
/***********************************************************************************************************/
ConvivaData.prototype.defineConvivaConfiguration = function() {
	this.convivaData.params.customerKey = this.activeElements.config.activeEnv.conviva; // during test phase
	//this.convivaData.params.touchstoneServiceURL = "https://YOUR_CONVIVA_PREFIX.testonly.conviva.com";
	this.convivaData.params.url = this.activeElements.media.data.url;
	this.convivaData.params.assetName = "["+this.activeElements.media.data.id+"] "+this.activeElements.media.data.program +" - "+this.activeElements.media.data.title;
	this.convivaData.params.live = false;
	this.convivaData.params.viewerId = this.activeElements.config.customData.tealiumVisitorId;
	this.convivaData.params.applicationName = vertex.foundation.playerString;
	this.convivaData.params.duration = this.activeElements.media.data.duration; //Duration in seconds
	this.convivaData.params.resource = "OF-UPLYNK";
	this.convivaData.params.encodedFrameRate = 30; // Encoded Framerate in fps
	this.convivaData.params.mediaPlayer = this.activeElements.player.mediaPlayer();
}


// Initializes a new conviva session when the player is ready.
/***********************************************************************************************************/
ConvivaData.prototype.initializeConvivaSession = function() {
	var source = this;

	if (!this.convivaData.status.started) {
		this.convivaData.status.started = true;

		if (this.activeElements.media.type === vertex.c.PLAYBACK_TYPES.api) {

			this.defineConvivaConfiguration();

			vertex.log(VERTEX_LOG.priority, this.convivaData.params, "Conviva Params")

			this.convivaData.systemSettings = new Conviva.SystemSettings();
			

			// Touchstone Testing Only! //
			
			//this.convivaData.systemSettings.logLevel = SystemSettings.LogLevel.DEBUG;
			
			// Touchstone Testing Only! //
			

			this.convivaData.systemInterface = new Conviva.SystemInterface(
			        new Conviva.Impl.Html5Time(),
			        new Conviva.Impl.Html5Timer(),
			        new Conviva.Impl.Html5Http(),
			        new Conviva.Impl.Html5Storage(),
			        new Conviva.Impl.Html5Metadata(),
			        new Conviva.Impl.Html5Logging()
			);

			this.convivaData.systemFactory = new Conviva.SystemFactory(this.convivaData.systemInterface, this.convivaData.systemSettings);
			 
			//Customer integration
			this.convivaData.clientSettings = new Conviva.ClientSettings(this.convivaData.params.customerKey);
			this.convivaData.clientSettings.gatewayUrl = this.convivaData.params.touchstoneServiceURL;
			 
			this.convivaData.client = new Conviva.Client(this.convivaData.clientSettings, this.convivaData.systemFactory);
			 
			this.convivaData.playerStateManager = this.convivaData.client.getPlayerStateManager();
			 
			//Create metadata
			this.convivaData.convivaMetadata = new Conviva.ContentMetadata();
			this.convivaData.convivaMetadata.assetName = this.convivaData.params.assetName;
			this.convivaData.convivaMetadata.streamUrl = this.convivaData.params.url;
			this.convivaData.convivaMetadata.streamType = this.convivaData.params.live ? Conviva.ContentMetadata.StreamType.LIVE : Conviva.ContentMetadata.StreamType.VOD;
			this.convivaData.convivaMetadata.applicationName = this.convivaData.params.applicationName;
			this.convivaData.convivaMetadata.viewerId = this.convivaData.params.viewerId;
			this.convivaData.convivaMetadata.duration = this.convivaData.params.duration;
			this.convivaData.convivaMetadata.defaultResource = this.convivaData.params.resource;
			this.convivaData.convivaMetadata.encodedFrameRate = this.convivaData.params.encodedFrameRate;
			
			// TODO - Custom c3 tags // this.convivaData.convivaMetadata.customData = {"tag1" : "value1", "tag2" : "100", "tag3" : "false"};
			  
			 
			// Create a Conviva monitoring session.
			this.convivaData.sessionKey = this.convivaData.client.createSession(this.convivaData.convivaMetadata);
			this.convivaData.html5PlayerInterface = new Conviva.Impl.Html5PlayerInterface(this.convivaData.playerStateManager, this.convivaData.params.mediaPlayer, this.convivaData.systemFactory);
			 
			// this.convivaData.sessionKey was obtained as shown above
			this.convivaData.client.attachPlayer(this.convivaData.sessionKey, this.convivaData.playerStateManager);

			vertex.log(VERTEX_LOG.priority, "Ready!", "Conviva Video Metrics");
		} else {
			vertex.log(VERTEX_LOG.priority, "Video Session Not Eligible", "Conviva Video Metrics");
		}
	}
}


// Handles media error events
/***********************************************************************************************************/
ConvivaData.prototype.onMediaError = function(event) {
	this.convivaData.client.reportError(this.convivaData.sessionKey, "["+VERTEX_ERRORS.error_media_playback.code+"] "+VERTEX_ERRORS.error_media_playback.message, Conviva.Client.ErrorSeverity.WARNING);
		
	// cleanupSession only if you are sure that the content cannot resume from error state
	this.cleanupSession();
}


// Handles media complete events.
/***********************************************************************************************************/
ConvivaData.prototype.onMediaComplete = function(event) {
	this.cleanupSession();
}


// Cleans up the active Conviva session.
/***********************************************************************************************************/
ConvivaData.prototype.cleanupSession = function() {
	if (this.convivaData.status.started) {
		this.convivaData.status.started = false;

		if (this.convivaData.html5PlayerInterface) {
			this.convivaData.html5PlayerInterface.cleanup();
			this.convivaData.html5PlayerInterface = null;
		}

		if (this.convivaData.client) {
			this.convivaData.client.releasePlayerStateManager(this.convivaData.playerStateManager);
			
			this.convivaData.playerStateManager = null;
			
			this.convivaData.client.cleanupSession(this.convivaData.sessionKey);
		}
	}
}


// Runs cleanup on this class when it's finished
/***********************************************************************************************************/
ConvivaData.prototype.destroy = function() {
	this.cleanupSession();

	this.destroyEventBindings();

	return {success: true};
};
