# sport-event-soundboard
This is simple yet powerfull MP3 player for sport events.  

## Features
- User interface is simple, maybe not so fancy looking, but everyone should be able to use it without any training or instructions.
- You can create playlists (profiles) for different events e.g. kayaking, foortball, price ceremony, etc.
- You can create list of jingles (1-16) for the event e.g. special sound effect for goal, or play national anthem in price ceremony.
- Change of music happens smoothly.
- Playing jingle is silencing music by 50%.
- There is an application programmin interface (API) to control the software from other services, such as Bitfocus Companion and Stram Deck.

## Installation for development
###
```
npm start
```

## Installation or production

Copy your mp3 files to ~/jingles and ~/music.

You can create different profiles using the software, but you can create those manually also (following strict JSON syntax). ~/profiles directory has JSON files to define diferent profiles. Each profile has `{name of the pprofile}.json`, with music and jingels. If you havce edited `default.json`,you can use it as an exmaple.  

## API interface 

API interface provides basic functional to control the software. You can use e.g. Bitfocus Companion and Stream Desk to control the software.

Configuration file for port: `config.json` in root directory (in the same with main.js)
```
{
  "httpPort": 3131
}
```

API calls:
```
GET http://127.0.0.1:3131/play
GET http://127.0.0.1:3131/pause
GET http://127.0.0.1:3131/stop
GET http://127.0.0.1:3131/next
GET http://127.0.0.1:3131/panic
GET http://127.0.0.1:3131/volume?level=0.75 (or level=75)
GET http://127.0.0.1:3131/jingle?file=goal.mp3
```
