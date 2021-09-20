

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Config Class
//
//  File: 			lib/common/config.js
//
//  Description:   	This class handles remote configurations that need to be pulled from a remote resource before proceeding.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Config Constructor
/***********************************************************************************************************/
function Config(sourceInstance, instanceProperties) {
    this.sourceInstance = sourceInstance;
    this.instanceName = instanceProperties.instanceName;
    this.startTime = vertex.returnCurrentTimeInMS();

    this.callbackMethod = instanceProperties.callback;

    this.establishModuleVariables();

    this.loadBaseConfig();

    vertex.logNewInstance(this.instanceName);
}


/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Capability Tests /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


// Establishes boilerplate variables and any other variables that will have module scope.
/***********************************************************************************************************/
Config.prototype.establishModuleVariables = function() {
    
    this.host = window.location.host;

    vertex.log(VERTEX_LOG.high, "Player Host: "+this.host);
};


// 
/***********************************************************************************************************/
Config.prototype.loadBaseConfig = function() {
	var source = this;

	// The player hits an important step here, where the configuration is needed.  A failure here will result in a failure to play.
	vertex.tools.loadDataFromRemoteAPI("GET", {doc_source:this, doc_id:"base_config", doc_path:vertex.foundation.baseURL+"/configs/"+this.sourceInstance.configIdentifier+"/config.json"}, [{key:"Content-Type", value:"application/json"}], null, function(source, event) {
		if (event.status == vertex.c.HTTP_STATUS.ok) {
			source.baseConfigurationLoaded(event.response);
		} else {
			vertex.log(VERTEX_LOG.prod, source, "FAIL");
			source.sourceInstance.errors.reportPlaybackError(VERTEX_ERRORS.prefix + VERTEX_ERRORS.error_origin.code, VERTEX_ERRORS.error_origin.message, null, null);
		}
	});
};


// 
/***********************************************************************************************************/
Config.prototype.baseConfigurationLoaded = function(configData) {
	this.sourceConfiguration = JSON.parse(configData);

	if (!this.sourceConfiguration.requiresRemoteConfig) {
		this.sourceInstance[this.callbackMethod](this.sourceConfiguration);
	} else {
		this.loadRemoteConfig(this.sourceConfiguration);
	}
}


// 
/***********************************************************************************************************/
Config.prototype.loadRemoteConfig = function(baseConfigData) {
	var remoteConfigPath = this.findConfigIdentifier(baseConfigData);
}


// 
/***********************************************************************************************************/
Config.prototype.findConfigIdentifier = function(baseConfigData) {
	var availableHosts = baseConfigData.hosts;
	var hostData = null
	var envData = null;

	// Iterates through each env looking for the correct one.
	for (var host of availableHosts) {
		if (this.host.search(host.key) > -1) {
			envData = this.getPathWithEnv(baseConfigData.configs, host.env);
		}
	}

	// If the environment data was matched correctly, proceed forward.
	if (envData !== null) {
  		
		this.sourceConfiguration.activeEnv = envData;

  		// The player hits an important step here, where the configuration is needed.  A failure here will result in a failure to play.
		vertex.tools.loadDataFromRemoteAPI("GET", {doc_source:this, doc_id:"remote_config", doc_path:envData.path}, [{key:"Content-Type", value:"application/json"}, {key:"x-api-key", value:envData.key}], null, function(source, event) {
			if (event.status == vertex.c.HTTP_STATUS.ok) {
				source.remoteConfigurationLoaded(source.sourceConfiguration, event.response);
			} else {
				vertex.log(VERTEX_LOG.prod, source, "FAIL");
				source.sourceInstance.errors.reportPlaybackError(VERTEX_ERRORS.prefix + VERTEX_ERRORS.error_origin.code, VERTEX_ERRORS.error_origin.message, null, null);
			}
		});

	// If the environment data was not matched, fail and stop here.
  	} else {
  		vertex.log(VERTEX_LOG.prod, this, "FAIL");
		this.sourceInstance.errors.reportPlaybackError(VERTEX_ERRORS.prefix + VERTEX_ERRORS.error_origin.code, VERTEX_ERRORS.error_origin.message, null, null);
  	}
};


// 
/***********************************************************************************************************/
Config.prototype.remoteConfigurationLoaded = function(baseConfigData, remoteConfigData) {
	remoteConfigData = JSON.parse(remoteConfigData);
	
	this.remoteConfiguration = remoteConfigData;

	// TEST
	//vertex.log(VERTEX_LOG.prod, remoteConfigData, "REMOTE");
	// TEST

	// If there are api-services, proceed.
	if (typeof remoteConfigData.apiServices !== "undefined") {
		
		// Video API - MediaData
		baseConfigData.dataSources.videodata.endpoint = (typeof remoteConfigData.apiServices["video-api-v1"].uris.mediaData !== "undefined") ? remoteConfigData.apiServices["video-api-v1"].uris.mediaData : baseConfigData.dataSources.videodata.endpoint;
		baseConfigData.dataSources.videodata.headers.api_key.key = (typeof remoteConfigData.apiServices["video-api-v1"].auth.header_key !== "undefined") ? remoteConfigData.apiServices["video-api-v1"].auth.header_key : baseConfigData.dataSources.videodata.headers.api_key.key;
		baseConfigData.dataSources.videodata.headers.api_key.value = (typeof remoteConfigData.apiServices["video-api-v1"].auth.header_value !== "undefined") ? remoteConfigData.apiServices["video-api-v1"].auth.header_value : baseConfigData.dataSources.videodata.headers.api_key.value;

		// Video API - Waiver
		baseConfigData.dataSources.acceptwaiver.endpoint = (typeof remoteConfigData.apiServices["video-api-v1"].uris.waiver !== "undefined") ? remoteConfigData.apiServices["video-api-v1"].uris.waiver : baseConfigData.dataSources.acceptwaiver.endpoint;
		baseConfigData.dataSources.acceptwaiver.headers.api_key.key = (typeof remoteConfigData.apiServices["video-api-v1"].auth.header_key !== "undefined") ? remoteConfigData.apiServices["video-api-v1"].auth.header_key : baseConfigData.dataSources.acceptwaiver.headers.api_key.key;
		baseConfigData.dataSources.acceptwaiver.headers.api_key.value = (typeof remoteConfigData.apiServices["video-api-v1"].auth.header_value !== "undefined") ? remoteConfigData.apiServices["video-api-v1"].auth.header_value : baseConfigData.dataSources.acceptwaiver.headers.api_key.value;

		// VHS API - Heartbeats
		baseConfigData.dataSources.vhsdata.endpoint = (typeof remoteConfigData.apiServices["platform-vhs-v1"].uris.heartbeats !== "undefined") ? remoteConfigData.apiServices["platform-vhs-v1"].uris.heartbeats : baseConfigData.dataSources.vhsdata.endpoint;
		baseConfigData.dataSources.vhsdata.headers.api_key.key = (typeof remoteConfigData.apiServices["platform-vhs-v1"].auth.header_key !== "undefined") ? remoteConfigData.apiServices["platform-vhs-v1"].auth.header_key : baseConfigData.dataSources.vhsdata.headers.api_key.key;
		baseConfigData.dataSources.vhsdata.headers.api_key.value = (typeof remoteConfigData.apiServices["platform-vhs-v1"].auth.header_value !== "undefined") ? remoteConfigData.apiServices["platform-vhs-v1"].auth.header_value : baseConfigData.dataSources.vhsdata.headers.api_key.value;

		this.sourceConfiguration = baseConfigData;
		this.sourceInstance[this.callbackMethod](this.sourceConfiguration);
	} else {
		vertex.log(VERTEX_LOG.prod, remoteConfigData, "FAIL");
		vertex.log(VERTEX_LOG.prod, source, "FAIL");
		source.sourceInstance.errors.reportPlaybackError(VERTEX_ERRORS.prefix + VERTEX_ERRORS.error_origin_data.code, VERTEX_ERRORS.error_origin_data.message, null, null);
	}
}


// 
/***********************************************************************************************************/
Config.prototype.getPathWithEnv = function(envData, envValue) {
	
	// Iterates through each env looking for the correct one.
	for (var env of envData) {
		if (envValue === env.env) {
			return env;
		}
	}

	return null;
}
