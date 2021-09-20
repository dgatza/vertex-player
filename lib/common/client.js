

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Client Class
//
//  File: 			lib/common/client.js
//
//  Description:	Retrieves browser and capability data that the player uses to configure playback.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	libs/common/browser.js
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Client Constructor
/***********************************************************************************************************/
function Client(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();
	
	
	this.clientData = {};

	this.clientData.appCodeName = vertex.browser.navigatorObject.appCodeName;
	this.clientData.appName = vertex.browser.navigatorObject.appName;
	this.clientData.appVersion = vertex.browser.navigatorObject.appVersion;
	this.clientData.cookieEnabled = vertex.browser.navigatorObject.cookieEnabled;
	this.clientData.geolocation = vertex.browser.navigatorObject.geolocation;
	this.clientData.language = vertex.browser.navigatorObject.language;
	this.clientData.onLine = vertex.browser.navigatorObject.onLine;
	this.clientData.pageURL = window.location.href;
	this.clientData.platform = vertex.browser.navigatorObject.platform;
	this.clientData.product = vertex.browser.navigatorObject.product;
	this.clientData.userAgent = vertex.browser.navigatorObject.userAgent;
	
	this.clientData.supportsHLS = vertex.browser.clientBrowserSupportsHLS();
	this.clientData.supportsAudioTracks = vertex.browser.clientBrowserSupportsAudioTracks();
	this.clientData.supportsMSE = vertex.browser.clientBrowserSupportsMSE();
	this.clientData.supportsChromecast = vertex.browser.clientBrowserSupportsChromecast();
	this.clientData.supportsTouches = vertex.browser.clientBrowserSupportsTouches();
	
	this.clientData.browserMSIE = vertex.browser.clientBrowserIsMSIE();
	this.clientData.deviceAndroid = vertex.browser.clientDeviceIsAndroid();
	this.clientData.deviceiOS = vertex.browser.clientDeviceIsIOS();


	this.establishEventBindings();
	this.logClient();

	vertex.logNewInstance(this.instanceName);
}


/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Capability Tests /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


// Establish the bindings that the player handler should be tapped into.
/************************************************************************************/
Client.prototype.establishEventBindings = function() {
	var source = this;

	window.ononline = function(event) { source.connectionStateChanged(event); }
	window.onoffline = function(event) { source.connectionStateChanged(event); }
};


// Outputs a log of the client's properties and capabilities within the console log.
/************************************************************************************/
Client.prototype.logClient = function() {
	vertex.logBreak(VERTEX_LOG.priority);
	
	// Iterate through each client property and log their values.
	for (var property in this.clientData) {
		vertex.log(VERTEX_LOG.priority, this.clientData[property], "Client."+property);
	}

	vertex.logBreak(VERTEX_LOG.priority);
};


// Responds to the connection state of the client changing.
/************************************************************************************/
Client.prototype.connectionStateChanged = function(event) {
	this.clientData.onLine = (event.type === "online");

	var connectMessage = (this.clientData.onLine) ? VERTEX_ERRORS.error_connection_restored.message : VERTEX_ERRORS.error_connection_lost.message;
	var timeoutInterval = (this.clientData.onLine) ? 5000 : -1;

	vertex.log(VERTEX_LOG.prod, this.clientData.onLine, "Connected");

	vertex.events.dispatchCustomEvent(this.sourceInstance.main,"OnConnectedStateChanged", {connected:this.clientData.onLine, message:connectMessage, timeout:timeoutInterval, fadeinterval:800});
};
