

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Browser Class
//
//  File: 			lib/common/browser.js
//
//  Description:   	This class contains a series of tools used by the player to determine what features the
//					browser is capable of supporting.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Browser Constructor
/***********************************************************************************************************/
function Browser(instanceProperties) {
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	this.navigatorObject = this.locateNavigator();

	vertex.logNewInstance(this.instanceName);
}


/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Capability Tests /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


// The method returns the window's navigator object using some deduction.
/************************************************************************************/
Browser.prototype.locateNavigator = function() {
	if (typeof navigator !== "undefined") {
		return navigator;
	} else if (typeof window.navigator !== "undefined") {
		return window.navigator;
	}
}


// Checks whether the client's browser is able to play HLS content
/************************************************************************************/
Browser.prototype.clientBrowserSupportsHLS = function() {
	
	// Creates an HTML5 video tag for testing 'canPlayType' and 'audioTracks'
	var testTag = ((typeof document !== "undefined") ? document.createElement('video') : null);
	var hlsSupported = ((testTag) ? (testTag.canPlayType("application/x-mpegURL") !== "") : false);

	return hlsSupported;
};


// Checks whether the client's browser supports audio tracks
/************************************************************************************/
Browser.prototype.clientBrowserSupportsAudioTracks = function() {
	
	// Creates an HTML5 video tag for testing 'canPlayType' and 'audioTracks'
	var testTag = ((typeof document !== "undefined") ? document.createElement('video') : null);
	var audioTracksSupported = ((testTag) ? (typeof testTag.audioTracks !== "undefined") : false);

	return audioTracksSupported;
};


// Checks whether the client's browser supports media source extensions
/************************************************************************************/
Browser.prototype.clientBrowserSupportsMSE = function() {
	var mseSupported = ((typeof MediaSource !== "undefined") ? true : false);

	return mseSupported;
};


// Checks whether the client's browser should stream chromecast
/************************************************************************************/
Browser.prototype.clientBrowserSupportsChromecast = function() {
	var chromecastSupported = ((!/iphone|ipad|android|mobile|trident|edge/i.test(this.navigatorObject.userAgent)) ? ((/chrome/i.test(this.navigatorObject.userAgent)) ? true : false) : false);
    
    return chromecastSupported;
};


// Checks whether the client's browser supports touch screen devices
/************************************************************************************/
Browser.prototype.clientBrowserSupportsTouches = function() {
	var touchesSupported = (('ontouchstart' in window) || (this.navigatorObject.msMaxTouchPoints > 0));

	return touchesSupported;
};


// Checks whether the client is running on an Android device
/************************************************************************************/
Browser.prototype.clientBrowserIsMSIE = function() {
	var ua = this.navigatorObject.userAgent;
    var msie = ua.indexOf("MSIE ");
	var isMSIE = (msie > 0);

	return isMSIE;
};


// Checks whether the client is running on an Android device
/************************************************************************************/
Browser.prototype.clientDeviceIsAndroid = function() {
	var isAndroid = (this.navigatorObject.userAgent.indexOf("android") > -1);

	return isAndroid;
};


// Checks whether the client is running on an iOS device //** TODO - When needed.
/************************************************************************************/
Browser.prototype.clientDeviceIsIOS = function() {
	var isIOS = (this.navigatorObject.platform.search(new RegExp(/[ipad|iphone|ipod]/, "i")) > -1);

	return isIOS;
};
