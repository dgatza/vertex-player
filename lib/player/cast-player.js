

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Chromecast Sender Player Class
//
//  File:           lib/player/cast-player.js
//
//  Description:    WIP
//
//  Author(s):      Doug Gatza
//
//  Dependencies:   NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// CastPlayer Constructor
/***********************************************************************************************************/
function CastPlayer(sourceInstance, instanceProperties) {
    this.sourceInstance = sourceInstance;
    this.instanceName = instanceProperties.instanceName;
    this.startTime = vertex.returnCurrentTimeInMS();

    this.establishModuleVariables();
    this.establishEventBindings();

    vertex.logNewInstance(this.instanceName);
}


// Establishes boilerplate variables and any other variables that will have module scope.
/***********************************************************************************************************/
CastPlayer.prototype.establishModuleVariables = function() {
    
    this.castData = {session: {user_initiated: false}, status: {cast_available: false, cast_init: false}, player:{}, controller:{}, default_button:null, button_component:null};

    // Stores a local copy of the active config and active media object for use within this plugin.
    this.activeElements = this.sourceInstance.activeElements;
    
    /*
    this.castData = {
        CAPTION_CONVERTER_URL: window.location.protocol + "//" + window.location.hostname + "/caption.php?smil=",

        isChromeQualified: ((!/iphone|ipad|android|mobile|trident|edge/i.test(navigator.userAgent)) ? ((/chrome/i.test(navigator.userAgent)) ? true : false) : false),
    };

    //only initialize for chrome
    if (!this.castData.isChromeQualified) {
        return;
    }

    //show chromecast when the browser and platform qualifies, and the extension was detected. 
    
    this.currentVolume = 0.5;
    this.autoplay = true;
    this.modifiers = null;
    this.castData.session.user_initiated = false;
    this.currentTime = 0;
    this.extensions = [];
    */
};


// Establish the bindings that the player handler should be tapped into.
/***********************************************************************************************************/
CastPlayer.prototype.establishEventBindings = function() {
    var source = this;

    window.__onGCastApiAvailable = function (isAvailable) { source.castAPIAvailable(isAvailable); };

    // Load the Chromecast Library now
    this.sourceInstance.appendToAllScripts({script_id:"castplayer", script_path:"https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"}, function(event) {  vertex.events.dispatchCustomEvent(source.sourceInstance.main, "OnCastAPILoaded", source); });

    // Standard Listeners
    this.sourceInstance.main.addEventListener("OnControlsReady", function(event) { source.onControlsReady(event); });

    this.sourceInstance.main.addEventListener("OnCastOnComponentClicked", function(event) { source.onCastOnButtonClicked(event); });
    this.sourceInstance.main.addEventListener("OnCastOffComponentClicked", function(event) { source.onCastOffButtonClicked(event); });


    this.sourceInstance.main.addEventListener("OnMediaPlay", function(event) { source.onMediaPlay(event); });
    this.sourceInstance.main.addEventListener("OnMediaPause", function(event) { source.onMediaPause(event); });
};


// 
/***********************************************************************************************************/
CastPlayer.prototype.castAPIAvailable = function(isAvailable) {
    if (isAvailable) {
        // Deactivate for now until ready
        //this.initializeCastInstance();
    }
};


// 
/***********************************************************************************************************/
CastPlayer.prototype.initializeCastInstance = function() {
    var source = this;
    var applicationId = this.getApplicationId();

    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: applicationId,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });

    // Add Default Google Cast Button
    this.castButton = document.createElement('button', 'google-cast-button');
    this.castButton.id = "googlecast";
    this.castButton.className = "google_cast_button";
    this.castButton.style.display = "none";
    this.sourceInstance.main.appendChild(this.castButton);


    this.castData.status.cast_available = true;
    this.castData.player = new cast.framework.RemotePlayer();
    this.castData.controller = new cast.framework.RemotePlayerController(this.castData.player);
    
    this.castData.status.cast_init = true;

    // If the component is ready, update it now.
    if (this.castData.button_component !== null) {
        this.updateCastButtonBaseState();
    }

    this.addCastListeners();
};


// 
/***********************************************************************************************************/
CastPlayer.prototype.onControlsReady = function (event) {
    var source = this;
    var playerControls = event.detail.data;

    this.castData.button_component = playerControls.getComponent("controlsCastButton");

    // If initialization has already finished, update the component now.
    if (this.castData.status.cast_init) {
        this.updateCastButtonBaseState();
    }
};


// 
/***********************************************************************************************************/
CastPlayer.prototype.updateCastButtonBaseState = function () {
    vertex.log(VERTEX_LOG.priority, this.castData.status.cast_available, "Chromecast Available");

    var baseState = ((this.castData.status.cast_available) ? vertex.c.COMPONENT_BASE_STATES.enabled : vertex.c.COMPONENT_BASE_STATES.hidden);
    this.castData.button_component.setBaseState( baseState );
}


// 
/***********************************************************************************************************/
CastPlayer.prototype.onCastOnButtonClicked = function (event) {
    vertex.log(VERTEX_LOG.priority, this.castData.status.cast_available, "CastOn Button Press");
    this.castButton.click();
}


// 
/***********************************************************************************************************/
CastPlayer.prototype.onCastOffButtonClicked = function (event) {
    vertex.log(VERTEX_LOG.priority, this.castData.status.cast_available, "CastOff Button Press");
    this.castButton.click();
}


// 
/***********************************************************************************************************/
CastPlayer.prototype.onMediaPlay = function (event) {
    //console.log("Play Event = ", event);

    if (this.activeElements.player === null) {
        this.activeElements.player = event.detail.data.player;
        this.activeElements.media = event.detail.data.media;
    }
}


// 
/***********************************************************************************************************/
CastPlayer.prototype.onMediaPause = function (event) {
    //console.log("Pause Event = ", event);
}


// 
/***********************************************************************************************************/
CastPlayer.prototype.getApplicationId = function () {
    /*var applicationId;

    if (window.location.hostname === "localhost" && this.getQueryString('devDomain') === "nezzoh") {
        applicationId = '6A9E4C2C'; //Nezzoh Dev Application ID
        window.castPlayer.castData.CAPTION_CONVERTER_URL = window.castPlayer.castData.CAPTION_CONVERTER_URL.replace("localhost", "player.beachbodyondemand.com");
    } else if (window.location.hostname === "localhost") {
        applicationId = '5CCB46AD'; //QA S3
        window.castPlayer.castData.CAPTION_CONVERTER_URL = window.castPlayer.castData.CAPTION_CONVERTER_URL.replace("localhost", "player-qa6.beachbodyondemand.com");
    } else if (bbPlayer.config.data.videoDomain.indexOf('-qa') > -1) {
        applicationId = '5CCB46AD'; //QA S3
    } else {
        applicationId = 'E096F2EF'; //PROD S3
    }*/

    return 'E096F2EF'; //applicationId;
};


// These listeners require the RemotePlayerControlller which is created in the initialized function.
/***********************************************************************************************************/
CastPlayer.prototype.addCastListeners = function () {
    this.castData.controller.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, this.handleReceiverEvents.bind(this));
    this.castData.controller.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, this.handleReceiverEvents.bind(this));
    this.castData.controller.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, this.handleReceiverEvents.bind(this));
    this.castData.controller.addEventListener(cast.framework.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED, this.handleReceiverEvents.bind(this));
    this.castData.controller.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, this.handleReceiverEvents.bind(this));
};


// 
/***********************************************************************************************************/
CastPlayer.prototype.removeCastListeners = function () {
    this.castData.controller.removeEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, this.handleReceiverEvents.bind(this));
    this.castData.controller.removeEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, this.handleReceiverEvents.bind(this));
    this.castData.controller.removeEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, this.handleReceiverEvents.bind(this));
    this.castData.controller.removeEventListener(cast.framework.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED, this.handleReceiverEvents.bind(this));
    this.castData.controller.removeEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, this.handleReceiverEvents.bind(this));
};


// Handles receiver events
/***********************************************************************************************************/
CastPlayer.prototype.handleReceiverEvents = function (event) {
    //try {
        vertex.log(VERTEX_LOG.priority, event, "CHROMECAST");
        //console.error(event);
        switch (event.type) {
            case cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED:
                
                if (event.value) {
                    //this.extensions.castui.uimanager(event.value);
                    this.castData.session.user_initiated = true;
                    this.castingManager();

                } else {

                    //this.extensions.castui.displayDefaultSenderState();
                    this.castData.session.user_initiated = false;
                    this.removeCastListeners();
                }
                
                break;
            case cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED:
                /*
                if (event.value) {
                    this.currentTime = event.value;
                }
                //update sender timeline
                this.extensions.castui.onReceiverProgress();
                */
                break;
            case cast.framework.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED:
                /*
                this.extensions.castui.uimanager(arguments[0].value);

                if (!arguments[0].value) {
                    var vp = $pdk.controller.getVideoProxy();
                    var isComplete = vp.currentTime / vp.duration;
                    if (isComplete > .98) {
                        this.extensions.castui.displayDefaultSenderState();
                        $pdk.controller.seekToPercentage(99.99);
                    } else {
                        $pdk.controller.seekToPosition(1000 * this.currentTime)
                    }
                }
                */
                break;
            case cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED:
                switch (arguments[0].value) {

                    case chrome.cast.media.PlayerState.BUFFERING:

                        //this.extensions.castui.setCastIcon("load");

                        break;
                    case chrome.cast.media.PlayerState.PLAYING:

                        //this.extensions.castui.setCastIcon("pause");

                        break;
                    case chrome.cast.media.PlayerState.PAUSED:

                        //this.extensions.castui.setCastIcon("play");

                        break;
                    case chrome.cast.media.PlayerState.IDLE:

                        // if (this.getSession().getMediaSession().customIdle === true) {
                        //     //no media is loaded. restore default sender state.
                        //     this.extensions.castui.displayDefaultSenderState();
                        //     $pdk.controller.seekToPercentage(99.99);
                        // } else {
                        //     //debugger;
                        // }

                        break;
                }
                break;
        }
    /*} catch (err) {
        console.error('castPlayer.extensions.castui, it will self correct.', err.message);
    }*/
};


// 
/***********************************************************************************************************/
CastPlayer.prototype.getSession = function () {
    return cast.framework.CastContext.getInstance().getCurrentSession();
}


// 
/***********************************************************************************************************/
CastPlayer.prototype.getPlayer = function () {
    return this.castData.player;
}


// 
/***********************************************************************************************************/
CastPlayer.prototype.getPlayerController = function () {
    return this.castData.controller;
}


/*************************************** CONTROLLER HOOKS ******************************************/
/***************************************************************************************************/
/**
 * Responsible for managing casting sessions and UI behavior. 
 * Casting rules
 */


// 
/***********************************************************************************************************/
CastPlayer.prototype.castingManager = function () {


    //we must have the google cast player
    if (!this.castData.player) {
        return;
    }

    //we must have the player controller
    if (!this.castData.controller) {
        return;
    }

    // only cast for different releases
    /*var msession = this.getSession().getMediaSession();
    if (msession && msession.media.contentId === this.getConfig("releaseUrl")) {
        return;
    }*/

    //launch app when there is no session
    if (this.getSession()) {
        this.launchApplication();
    }

};


// 
/***********************************************************************************************************/
CastPlayer.prototype.launchApplication = function () {
    var mediaUrl = this.getConfig('releaseURL');
    var mediaInfo = this.getMediaInfo(mediaUrl);

    // set text tracks
    mediaInfo.textTrackStyle = this.extensions.tracks.getTextTrackStyle();

    // set captions
    mediaInfo.tracks = this.extensions.tracks.getCaptions();

    // set custom data
    mediaInfo.customData = this.extensions.metrics.getCustomData(mediaUrl);

    var request = new chrome.cast.media.LoadRequest(mediaInfo);

    // start content with this caption
    var ccTrackId = this.extensions.tracks.getCaptionTrackId();
    if (ccTrackId) {
        request.activeTrackIds = [ccTrackId];
    }

    // set start time
    request.currentTime = this.getCurrentTime();

    request.autoplay = true;

    this.getSession().addMessageListener("urn:x-cast:beachbody.chromecast.debug", function (urn, data) {
        // console.info("raw data", JSON.parse(data))
        try {
            if (JSON.parse(data)["_data"]) {
                var data = JSON.parse(data)["_data"];
                if (!data.hasOwnProperty('eventDetails')) {
                    console.info("RECEIVEREVENT:: ", JSON.parse(data)["_data"]);
                }
            } else {
                console.info(">>> RECEIVEREVENT:: ", JSON.parse(data));
            }

        } catch (e) {
            console.error(e)
        }

    })
    this.getSession().loadMedia(request).then(
        function () {
            $pdk.controller.pause(true);
            $pdk.controller.dispatchEvent("castConnected", {
                isCasted: true
            });
            if (globalData.currentAudioTrack.index) {
                this.extensions.tracks.updateAudio(globalData.currentAudioTrack.index);
            }
        }.bind(this),
        function (e) {
            console.error('Load failed ' + e);
        });

}

/**
 * Responsible for playback controls
 */
/*CastPlayer.prototype.playbackManager = function (type, data) {
    //we must have a session
    if (!this.getSession()) {
        switch (type) {
            case "mute":
                this.playbackManager.initmute = data;
                break;
            case "volumechange":
                this.playbackManager.initvol = data;
                break;
        }
        return;
    }


    switch (type) {
        case "volumechange":
            this.currentVolume = data / 100;
            this.getSession().setVolume(this.currentVolume);
            break;
        case "mute":
            this.getSession().setMute(data);
            break;
        case "play":
            break;
        case "pause":
            break;
        case "seek":
            if (this.castData.player.canSeek) {
                var percent = 100 * data.end.currentTime / data.end.duration;
                this.castData.player.currentTime = this.castData.controller.getSeekTime(percent, this.castData.player.duration);
                this.castData.controller.seek();
            }
            break;
    }
    //initialize mute 
    if (this.playbackManager.initmute) {
        var val = this.playbackManager.initmute;
        this.playbackManager.initmute = null;
        //type = 'volumechange';
        this.playbackManager('mute', val);

    }
    //initialize volume
    if (this.playbackManager.initvol) {
        var val = this.playbackManager.initvol;
        this.playbackManager.initvol = null;
        this.playbackManager('volumechange', val);

    }

};



/*************************************** ADD GOOGLE CAST COMPONENT ***********************************/

/*var gCastButton = document.createElement('button', 'google-cast-button');

gCastButton.id = "googlecast";
gCastButton.className = "google_cast_button";

$('#player').after(gCastButton);


/**
 * Initialize the module after checking for the availability of chrome and the cast api. 
 */
/*CastPlayer.prototype.initialize = function () {
    this.extensions = [
        this.loadExtension("./js/modules/castextensions/castTracks.js"+versionControlString("?"), this.initExtension.bind(this)),
        this.loadExtension("./js/modules/castextensions/castUI.js"+versionControlString("?"), this.initExtension.bind(this)),
        this.loadExtension("./js/modules/castextensions/castMetrics.js"+versionControlString("?"), this.initExtension.bind(this)),
    ];

    this.addpdklisteners();
};

CastPlayer.prototype.getQueryString = function (field, url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    var string = reg.exec(href);
    return string ? string[1] : null;
}

CastPlayer.prototype.getConfig = function (param) {
    try {
        return bbPlayer.config.data[param];
    } catch (e) {
        return new Error("Invalide Config Parameter: " + param)
    }
}

/**
 * @desc Load all cast extensions 
 */
/*CastPlayer.prototype.loadExtension = function (ext, cb) {
    var elem = document.createElement('script');
    elem.type = 'application/javascript';
    elem.src = ext;
    elem.onload = cb;
    elem.onerror = function () {
        console.error('Chromecast CastPlayer extension load error: ', ext);
    }
    document.head.appendChild(elem);
    return ext;
}

CastPlayer.prototype.initExtension = function () {
    if (Object.keys(window.cast.bbext).length === this.extensions.length) {
        // initialize all. 
        var extensions = {};

        Object.keys(window.cast.bbext).forEach(function (key, idx, arr) {
            var ext = new window.cast.bbext[key]();
            extensions[ext.name] = ext;
            extensions[ext.name].register();
        }.bind(this))

        // locked and loaded
        this.extensions = extensions;
    }
}

/*************************************** PDK HOOKS ***************************************/
/*****************************************************************************************/
/*CastPlayer.prototype.addpdklisteners = function () {
    $pdk.controller.addEventListener("OnModifierSwap", this.handleEvents.bind(this));
    $pdk.controller.addEventListener("BB.ResumeContent", this.handleEvents.bind(this));
    $pdk.controller.addEventListener("BB.RestartContent", this.handleEvents.bind(this));
    $pdk.controller.addEventListener("OnMediaSeek", this.handleEvents.bind(this));
    $pdk.controller.addEventListener("OnMute", this.handleEvents.bind(this));
    $pdk.controller.addEventListener("OnVolumeChange", this.handleEvents.bind(this));
    $pdk.controller.addEventListener("OnMediaStart", this.handleEvents.bind(this));
    $pdk.controller.addEventListener("SubtitleStylesUpdated", this.handleEvents.bind(this));
    $pdk.controller.addEventListener("BBOverlayVisible", this.handleEvents.bind(this));
    $("#player")[0].addEventListener("OnShowStylesMenu", this.handleEvents.bind(this));
    $("#player")[0].addEventListener("OnResumeClear", this.handleEvents.bind(this));
    $("#player")[0].addEventListener("OnMenuActive", this.handleEvents.bind(this));

    $pdk.controller.addEventListener("OnAudioTrackSwitched", function (e) {
        this.extensions.tracks.updateAudio(e.data.newAudioTrack.index);
    }.bind(this));
    $pdk.controller.addEventListener("OnGetSubtitleLanguage", function (event) {
        this.extensions.tracks.updateCaptions(event.data.langCode);
    }.bind(this));



    $pdk.controller.addEventListener("OnMediaLoadStart", function (event) {

        if (!event.data.baseClip.isAd) {
            if (!this.modifiers) {
                // check for modifiers
                this.getModifiers(event.data.baseClip.contentCustomData);
            }
            //manage layout
            this.extensions.castui.uimanager();
        }
    }.bind(this))

    $pdk.controller.addEventListener("OnMediaPlaying", function (event) {
        this.extensions.castui.addCastIconComponent();
    }.bind(this));
};

CastPlayer.prototype.removePdkListeners = function () {
    $pdk.controller.removeEventListener("OnPlayerLoaded", this.handleEvents.bind(this));
    $pdk.controller.removeEventListener("BB.ResumeContent", this.handleEvents.bind(this));
    $pdk.controller.removeEventListener("BB.RestartContent", this.handleEvents.bind(this));
    $pdk.controller.removeEventListener("OnMediaPlaying", this.handleEvents.bind(this));
    $pdk.controller.removeEventListener("OnMediaLoadStart", this.handleEvents.bind(this));
};

/**
 * HandleEvents will behave as middleware.  This will perform validation before passing final control to the event listeners. 
 */
/*CastPlayer.prototype.handleEvents = function (event) {

    // allow even to pass if user already initiated session.
    if (!this.castData.session.user_initiated) {
        return;
    }

    switch (event.type) {
        case "SubtitleStylesUpdated":
            if (this.getSession()) {
                var textTrackStyle = this.extensions.tracks.getTextTrackStyle();
                var tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(null, textTrackStyle);

                this.getSession().getMediaSession().editTracksInfo(tracksInfoRequest, function (e) {
                    $pdk.controller.dispatchEvent("castConnected", {
                        isCasted: true
                    });
                }, function (e) {
                    console.log(e)
                });
            }

            break;
        case "BBOverlayVisible":
            if (event.data.status === true && this.castData.player.isConnected) {
                $pdk.controller.dispatchEvent("castConnected", {
                    isCasted: true
                });
            }
            break;
        case "OnShowStylesMenu":
            if (event.status === false) {
                //hide carl controls
                $pdk.controller.dispatchEvent("castConnected", {
                    isCasted: true
                });
            }
            break;
        case "BB.ResumeContent":
        case "BB.RestartContent":
            //only perform this when casted
            if (this.getSession() && this.castData.player.isConnected && this.castData.player.isMediaLoaded) {

                $pdk.controller.pause(true);
                $pdk.controller.seekToPosition((event.hasOwnProperty("data") && event.data !== undefined) ? event.data.data : 2000);
                $pdk.controller.dispatchEvent("castConnected", {
                    isCasted: true
                });
                this.extensions.castui.loadCastingLayout();
                this.extensions.castui.setCastIcon("load");

            }
            break;
        case "OnMenuActive":
            if (!event.detail.status && this.castData.player.isConnected) {
                $pdk.controller.dispatchEvent("castConnected", {
                    isCasted: true
                });
            }
            break;
        case "OnResumeClear":
            //bboverlayhandler manages the carl controls and will reveal them after it clears the resume disagnostic
            //this tells it to hide those controls when we're already casted. 
            if (this.castData.player.playerState === "PLAYING" || this.castData.player.playerState === "PAUSED") {
                $pdk.controller.pause(true);
                $pdk.controller.dispatchEvent("castConnected", {
                    isCasted: true
                });
            }
            break;
        case "OnMediaSeek":
            this.playbackManager("seek", event.data);
            break;
        case "OnMediaStart":
            //manage casting
            if (!event.data.baseClip.isAd) {
                this.castingManager();
            }
            this.removePdkListeners();
            break;
        case "OnMute":
            this.playbackManager("mute", event.data);
            break;
        case "OnVolumeChange":
            this.playbackManager("volumechange", event.data);
            break;
    }
};

/**
 * Get list of modifiers and store them in castPlayer.modifiers property.
 * @param {Object} data
 * @param {Boolean}
 */
/*CastPlayer.prototype.getModifiers = function (data) {

    var regx = /relatedVideos/;
    var store = [];
    var res = false;
    // add current clip
    store.push(this.getConfig('mpxReferenceID'));

    for (var item in data) {
        if (regx.test(item)) {
            store.push(data[item]);
            res = true;
        }
    }

    if (store.length > 1) {
        this.modifiers = store;
    } else {
        this.modifiers = null;
    }

    return res;
}

CastPlayer.prototype.getMediaInfo = function (mediaUrl) {
    var mediaInfo = new chrome.cast.media.MediaInfo(this.getConfig("releaseURL") + "&platform=chromecast", 'application/x-mpegurl');
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();

    mediaInfo.metadata.title = (bbConfig.dataSource === DATA_SOURCES.api) ? this.getConfig("coreData").metadata.title : this.getConfig("videoFeed").entries[0].title;
    mediaInfo.metadata.subtitle = (bbConfig.dataSource === DATA_SOURCES.api) ? this.getConfig("coreData").metadata.description : this.getConfig("videoFeed").entries[0].description;
    var thumbnailUrl = (bbConfig.dataSource === DATA_SOURCES.api) ? this.getConfig("coreData").thumbnail[0].image : this.getConfig("videoFeed").entries[0]["plmedia$defaultThumbnailUrl"];
    mediaInfo.metadata.images = [{
        'url': thumbnailUrl
    }];

    return mediaInfo;
}


CastPlayer.prototype.getCurrentTime = function () {
    var response;
    // get cast player time if this is a modifier
    if (this.castData.player.mediaInfo && this.castData.player.mediaInfo.customData && this.modifiers && this.modifiers.indexOf(this.getConfig("mpxReferenceID")) > -1) {
        // get cast player time when switching to modifier
        //if (this.modifiers && this.modifiers.indexOf(this.GUID) > -1) {
        response = this.castData.player.currentTime;
    } else {
        // get pdk time
        response = $pdk.controller.getVideoProxy().currentTime;
    }

    return response;
}


/*************************************** GOOGLE CAST HOOKS *****************************************/
/***************************************************************************************************/

