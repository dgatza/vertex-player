# Vertex Player
A JavaScript video player framework that greatly expands the utility of the base HTML5 video player component.  Vertex Player seeks to empower developers to build custom video player experiences that reflect their unique brand.

## Features
- Quick and Simple Integration - Embedding Vertex Player into your site is as simple as integrating the base HTML5 player component.
- Multi-format Video Support - Vertex Player allows playback of both static video files and Adaptive Bitrate Streams like HLS and MPEG_DASH.
- Custom UI and UI behavior support - Vertex player includes a UI builder engine, which allows developers to define any number of custom player UI themes and custom controls for the player, which can be selected dynamically from the player embed block.
- Custom plugin support - Vertex player allows developers to integrate support for 3rd party systems and APIs through user-defined plugins.
- Custom configurations - Developers can clone and expand on the default player configuration, which can be selected dynamically from the player embed block.
- Native HTML5 playback features - Includes native support for HTML5 video playback features like text tracks, audio tracks.


## Player Integration
Import the Vertex Player library in your page's head:
```
<script language="JavaScript" type="text/javascript" src="./path-to-vertex/lib/vertex-player-min.js"></script>
```


Define a player container:
```
var playerContainer = document.createElement('div');
document.body.appendChild(playerContainer);
```


Define a basic player configuration:
```
var playerConfiguration = {
    logLevel: 4, 			// Optional - Default: 1
    autoPlay: true, 			// Optional - Default: true
    loopPlay: true, 			// Optional - Default: false
    mediaObjects: [ 			// Required - Default: Playback error
        {
            url:'https://content.uplynk.com/7e70519c486d4139b7473f8b5c4af7b0.m3u8',
            title:'Caminandes'
        },
        {
            url:'http://www.bok.net/dash/tears_of_steel/cleartext/stream.mpd'
        }
    ]
}
```


Create a Vertex Player instance, passing container and configuration:
```
var playerInstance = new VertexPlayer(playerContainer, playerConfiguration);
```


Listeners can be created on the player for any particular event OR for all events using 'OnInstanceEvents':
```
playerInstance.establishPlayerListenerWithCallback("OnInstanceEvents", function(event){
    console.log("EVENT", event.detail.data);
});
```
