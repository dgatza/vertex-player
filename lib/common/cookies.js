

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Cookie Handler Class
//
//  File: 			lib/common/cookies.js
//
//  Description: 	This class is used for saving, retrieving and destroying settings store within the browser
//					cookies.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Cookies Constructor
/***********************************************************************************************************/
function Cookies(instanceProperties) {
	// All Vertex Player classes should include an instanceName and startTime declaration.
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	// All Vertex Player classes should report their instances to log when ready.
	vertex.logNewInstance(this.instanceName);
}


// Sets a browser cookie using the name, value and expiration interval in MS
/***********************************************************************************************************/
Cookies.prototype.setCookie = function(cookieName, cookieValue, expirationInterval) {
	var expirationDate = new Date();
	expirationDate.setTime(expirationDate.getTime() + expirationInterval);
	
	var fullCookieValue = escape(cookieValue) + ((expirationInterval == null) ? "" : "; expires=" + expirationDate.toUTCString());
	document.cookie = cookieName + "=" + fullCookieValue;
}


// Gets a cookie by name, [expects: this.getCookie('ui_font_size');];
/***********************************************************************************************************/
Cookies.prototype.getCookie = function(cookieName) {
	var i,x,y,ARRcookies = document.cookie.split(";");
	
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g,"");
	  
		if (x == cookieName) {
			return unescape(y);
		}
	}
	
	return null;
}


// Destroys a cookie using the cookie name.
/***********************************************************************************************************/
Cookies.prototype.destroyCookie = function(cookieName) {
		document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}