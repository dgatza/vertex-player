

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


// Errors Constructor
/***********************************************************************************************************/
function Errors(sourceInstance, instanceProperties) {
	this.sourceInstance = sourceInstance;
	this.instanceName = instanceProperties.instanceName;
	this.startTime = vertex.returnCurrentTimeInMS();

	this.data = {error_array:[], status:{is_initialized:false}, active_error:null, errorHideTimeout:null, errorFadeInterval:200};
	
	this.initializeErrorWindow(instanceProperties.playerContainer);

	// TEST //
	//this.reportPlaybackError(VERTEX_ERRORS.prefix + "1006", "Test error 1", null, "none");
	//this.reportPlaybackError(VERTEX_ERRORS.prefix + "1006", "Test error 1", null, null);
	//this.reportPlaybackError(VERTEX_ERRORS.prefix + "1006", "This is a test error message with more text than usual!", null, [ {button_name:"errorButton1", button_text:"Cancel", extra_classes:""}, {button_name:"errorButton2", button_text:"OK", extra_classes:" error_button_underscore"} ]);
	// TEST //

	vertex.logNewInstance(this.instanceName);
}

	
// Initializes the error window markup.
/***********************************************************************************************************/
Errors.prototype.initializeErrorWindow = function(baseContainer) {
	var errorElements = {};

	// Defined all of our DOM objects
	errorElements.errorBackground;
	errorElements.errorWindow;
	errorElements.errorWindowHeader;
	errorElements.errorWindowMessage;
	errorElements.errorButtonContainer;


	errorElements.errorBackground = document.createElement('div');
	errorElements.errorBackground.id = "errors";
	errorElements.errorBackground.className = "window_darken_error";
	errorElements.errorBackground.style.display = "none";
	baseContainer.appendChild(errorElements.errorBackground);

	
	errorElements.errorWindow = document.createElement('div');
	errorElements.errorWindow.id = "errorWindowObject";
	errorElements.errorWindow.className = "error_window";
	errorElements.errorBackground.appendChild(errorElements.errorWindow);

	
	errorElements.errorWindowHeader = document.createElement('div');
	errorElements.errorWindowHeader.id = "errorWindowHeader";
	errorElements.errorWindowHeader.className = "error_window_header";
	errorElements.errorWindow.appendChild(errorElements.errorWindowHeader);

	
	errorElements.errorWindowMessage = document.createElement('div');
	errorElements.errorWindowMessage.id = "errorWindowMessage";
	errorElements.errorWindowMessage.className = "error_window_message";
	errorElements.errorWindow.appendChild(errorElements.errorWindowMessage);

	
	errorElements.errorButtonContainer = document.createElement('div');
	errorElements.errorButtonContainer.id = "errorButtonContainer";
	errorElements.errorButtonContainer.className = "error_button_container";
	errorElements.errorWindow.appendChild(errorElements.errorButtonContainer);

	this.errorElements = errorElements;

	this.showErrorWindow(false, 0);

	this.data.status.is_initialized = true;
};


// Reports an error to the array and if there aren't any active errors, it immediately displays it.
/***********************************************************************************************************/
Errors.prototype.reportPlaybackError = function(errorCode, errorMessage, errorCallback, buttonData) {
	// NOTE Button Data is expected in this format:
	// [ {button_name:"errorButton1", button_text:"OK"}, {button_name:"errorButton2", button_text:"Cancel"} ];

	// Adds the error to the error array.
	this.data.error_array.push( {error_code:errorCode, error_message:errorMessage, error_callback:errorCallback, button_data:buttonData} );

	// If there are no active error messages, display it now.
	if (!this.data.active_error) {
		this.displayError();
	}
};


// Displays the oldest error in the error array
/***********************************************************************************************************/
Errors.prototype.displayError = function() {
	var adjustedIndex = 0;

	// Splices the next error object off of the array, redefining the active error object
	this.data.active_error = this.data.error_array.splice(0, 1)[0];
	
	// Populates the header and message elements with the resepctive data.
	this.setErrorHeader(this.data.active_error.error_code);
	this.setErrorMessage(this.data.active_error.error_message);

	// If the caller passed button data specifying
	if (this.data.active_error.button_data) {
		// If the caller passed the button data as "none", then don't place a button, otherwise, proceed.
		if (this.data.active_error.button_data !== "none") {
			// Iterates through the array in reverse so that the buttons specified in the array always appear in the order specified.
			for (var i=this.data.active_error.button_data.length; i > 0; i--) {
				adjustedIndex = i - 1;
				this.data.active_error.button_data[adjustedIndex].button_name = "errorButton"+i;
				this.createErrorButton(this.data.active_error.button_data[adjustedIndex].button_name, this.data.active_error.button_data[adjustedIndex].button_text, this.data.active_error.button_data[adjustedIndex].extra_classes);
			}
		}
	} else {
		this.data.active_error.button_data = [];
		this.data.active_error.button_data.push({button_name:"errorButton1", button_text:"OK", extra_classes:" error_button_underscore"});
		this.createErrorButton(this.data.active_error.button_data[0].button_name, this.data.active_error.button_data[0].button_text, this.data.active_error.button_data[0].extra_classes);
	}

	this.showErrorWindow(true, this.data.errorFadeInterval);

	// If events are ready, deispatch one now.
	if (typeof vertex.events !== "undefined" && typeof this.sourceInstance.main !== "undefined") {
		vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnThrowError", this.data.active_error);
	}
};


// This method doest the job of showing and hiding the actual error window.  When it hides the window, the reset method is called.
/***********************************************************************************************************/
Errors.prototype.showErrorWindow = function(showWindow, fadeInterval) {	
	if (showWindow) {
		vertex.tools.fadeIn(this.errorElements.errorBackground, fadeInterval);
	} else {
		vertex.tools.fadeOut(this.errorElements.errorBackground, fadeInterval);
		
		//If there is an active error, reset the error window now.
		if (this.data.active_error){
			this.setResetTimeout(fadeInterval);
		}
	}
};


// Creates a new error window button, adds it to the window and binds it to the error handler listener for use.
/***********************************************************************************************************/
Errors.prototype.createErrorButton = function(buttonName, buttonText, extraClasses="") {
	var source = this;
	var errorButton = document.createElement('div');
	errorButton.id = buttonName;
	errorButton.className = "error_button" + extraClasses;
	errorButton.innerHTML = buttonText;
	errorButton.onclick = function(event){source.errorCallbackHandler(event)};
	this.errorElements.errorButtonContainer.appendChild(errorButton);
};


// Unbinds the button click event using the name passed as a parameter.
/***********************************************************************************************************/
Errors.prototype.destroyErrorButton = function(buttonName) {
	var button = document.getElementById(buttonName);
	button.onclick = null;
	button = null;
};


// Unbinds all current error buttons and clears out the button divs.
/***********************************************************************************************************/
Errors.prototype.resetAllErrorButtons = function(buttonData) {
	if (buttonData) {
		for (var i=0; i < buttonData.length; i++) {
			this.destroyErrorButton(buttonData[i].button_name);
		}
	}
	
	// Clears all button divs out of the button container.
	this.errorElements.errorButtonContainer.innerHTML = "";
};


// Sets the reset timeout to reset the error window.
/***********************************************************************************************************/
Errors.prototype.setResetTimeout = function(timeoutInterval) {
	source = this;
	
	setTimeout(function(){
		source.resetErrorWindow(source.data.active_error);
	}, timeoutInterval);
};


// Resets the error window for another use.
/***********************************************************************************************************/
Errors.prototype.resetErrorWindow = function(errorData) {
	
	// If there is no error data being passed, then the error window hasn't been used yet.  Don't reset anything.
	if (errorData) {
		this.resetAllErrorButtons(errorData.button_data);

		this.setErrorHeader("");
		this.setErrorMessage("");

		this.data.active_error = null;
	}

	// If there are more errors to display, display the next one.
	if (this.data.error_array.length > 0) {
		this.displayError();
	}
};


// Updates the error header text.
/***********************************************************************************************************/
Errors.prototype.setErrorHeader = function(headerText) {
	this.errorElements.errorWindowHeader.innerHTML = headerText;
};


// Updates the error message text.
/***********************************************************************************************************/
Errors.prototype.setErrorMessage = function(messageText) {
	this.errorElements.errorWindowMessage.innerHTML = messageText;
};


// This is the error handler general call back used to forward events to any callbacks specified upon error report.
/***********************************************************************************************************/
Errors.prototype.errorCallbackHandler = function(event) {

	// If there is an active error, return data to callback if it exists and clear it now.
	if (this.data.active_error) {
		// Regardless of whether the button produces action or not, close the error upon user interaction.
		this.showErrorWindow(false, this.data.errorFadeInterval);
		
		// If events are ready, deispatch one now.
		if (typeof vertex.events !== "undefined" && typeof this.sourceInstance.main !== "undefined") {
			vertex.events.dispatchCustomEvent(this.sourceInstance.main, "OnClearError", this.data.active_error);
		}

		// If the caller of this error included a callback, forward the event now.
		if (this.data.active_error.error_callback) {
			this.data.active_error.error_callback(event);
		}
	}
};