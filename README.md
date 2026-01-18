# sport-event-soundboard
This MP3 player for sport events. 

## Features
- User interface is simple, maybe not so fancy looking, but everyone shouls know how to use it withjout any training.
- You can create playlists (profiles) for different events e.g. kayaking, foortball, price ceremony, etc.
- You can creat list of jingles for the event e.g. speacial sound effects for goal, or play national anthem in price ceremony.
- Change of music happens smoothly
- Playing Jingle is silencing music by 50%.
- There is an application programmin interface (API) is control the software from some other services or hardware, such as Bitfocus Companion and Stram Deck.

## Installation for development
###
```
npm start
```

## Installation or production

## API interface 
```
GET http://127.0.0.1:3131/play
GET http://127.0.0.1:3131/pause
GET http://127.0.0.1:3131/stop
GET http://127.0.0.1:3131/next
GET http://127.0.0.1:3131/panic
GET http://127.0.0.1:3131/volume?level=0.75 (or level=75)
GET http://127.0.0.1:3131/jingle?file=goal.mp3
```
