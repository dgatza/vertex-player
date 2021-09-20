	

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  
//  Constants Class
//
//  File: 			lib/common/constants.js
//
//  Description:   	This class contains the player's global constants.
//
//  Author(s):     	Doug Gatza
//
//  Dependencies:  	NA 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Stream Types
vertex.c.STREAM_TYPES = {
	hls: "m3u",
	dash: "mpd",
	static: "static"
};


// Playback Types
vertex.c.PLAYBACK_TYPES = {
	direct: 0,
	api: 1
};


// Player Events
vertex.c.PLAYER_EVENTS = {
	player_ready: 			"player_ready",
	media_available: 		"media_available", 
	media_loading: 			"loading",
	media_progress: 		"progress",
	media_complete: 		"complete",
	media_pause: 			"pause",
	media_resume: 			"play",
	media_canplay: 			"canplay",
	media_cached: 			"media_cached",
	media_buffering: 		"buffering",
	media_error: 			"error",
	playhead_change: 		"playhead_change",
	volume_change: 			"volume_change"
};


// Vertex Events
vertex.c.VERTEX_EVENTS = {
	player_ready: 	"OnPlayerReady"					
};


// Base States
vertex.c.COMPONENT_BASE_STATES = {
	enabled: 	"component.enabled",
	disabled: 	"component.disabled",
	hidden: 	"component.hidden"
};


// Audio Constants
vertex.c.VOLUME_DEFAULT = 0.70;


// Keyboard Constants
vertex.c.KEY_CODE = {
	space: "Space",
	enter: "Enter",
	escape: "Escape",
	arrow_left: "ArrowLeft",
	arrow_right: "ArrowRight",
	arrow_up: "ArrowUp",
	arrow_down: "ArrowDown"
};


// Interval Constants
vertex.c.INTERVALS = {
	time_1_min: 		{ms: 60000, sec: 60},
	time_2_min: 		{ms: 120000, sec: 120},
	time_3_min: 		{ms: 180000, sec: 180},
	time_4_min: 		{ms: 240000, sec: 240},
	time_5_min: 		{ms: 300000, sec: 300},
	time_10_min: 		{ms: 600000, sec: 600},
	time_15_min: 		{ms: 900000, sec: 900},
	time_30_min: 		{ms: 1800000, sec: 1800},
	time_1_hour: 		{ms: 3600000, sec: 3600},
	time_2_hour: 		{ms: 7200000, sec: 7200},
	time_4_hour: 		{ms: 14400000, sec: 14400},
	time_8_hour: 		{ms: 28800000, sec: 28800},
	time_12_hour: 		{ms: 43200000, sec: 43200},
	time_16_hour: 		{ms: 57600000, sec: 57600},
	time_1_day: 		{ms: 86400000, sec: 86400},
	time_2_day: 		{ms: 172800000, sec: 172800},
	time_3_day: 		{ms: 259200000, sec: 259200},
	time_5_day: 		{ms: 432000000, sec: 432000},
	time_1_week: 		{ms: 604800000, sec: 604800},
	time_2_week: 		{ms: 1209600000, sec: 1209600},
	time_1_month: 		{ms: 2419200000, sec: 2419200},
	time_3_month: 		{ms: 7257600000, sec: 7257600},
	time_6_month: 		{ms: 14515200000, sec: 14515200},
	time_1_year: 		{ms: 29030400000, sec: 29030400}
};
