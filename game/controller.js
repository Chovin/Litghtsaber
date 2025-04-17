import {joinRoom} from 'https://esm.run/trystero@0.21.0'

var pico8_gpio = new Array(128);

const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789';
function new_code() {
let array = new Uint8Array(4);
window.crypto.getRandomValues(array);
array = array.map(x => validChars.charCodeAt(x % validChars.length));
const code = String.fromCharCode.apply(null, array);
  return code;
}
const code = new_code();

console.log(code)
let actual_code = 'litghtsaber_' + code
let base_url = window.location.href.split('game')[0]
let url = base_url + "controller/" + "?code=" + code
let qr = new QRCode(document.getElementById('qr'), {
  text: url,
})


$("#msgcontainer").removeClass('top_msg middle_msg invisible_msg');
$("#msgcontainer").addClass('middle_msg visible_msg');

let game_paused = false
function pauseShortly(callback = () => {}) {
  setTimeout(function() {
    if (!game_paused) {
      Module.pico8TogglePaused();
      game_paused = true
    }
    setTimeout(() => {
      callback()
    }, 3000)
  }, 7000)
}
pauseShortly()

const players = []
var peer = null;

function newPeer() {
  const room = joinRoom({appId: 'litghtsaber',
    relayUrls: [
      "wss://relay.damus.io",
      "wss://nos.lol",
      "wss://nostr.fmt.wiz.biz",
      "wss://nostrelay.circum.space"

    ]
  }, code)
  const [sendData, getData] = room.makeAction('data')
  function yourTurn() {
    console.log(`sending turn to ${players[0]}`)
    sendData({msg: "you're up!"}, players[0])
  }
  function resumeGame() {
    yourTurn()
    Module.pico8TogglePaused();
    game_paused = false
  }

  room.onPeerJoin(peerId => {
    players.push(peerId)
    sendData({msg: "I'm the game"}, peerId)
    console.log(`${peerId} joined`)
    if (game_paused && peerId == players[0]) {
      resumeGame()
      $("#msgcontainer").removeClass('right_msg top_msg middle_msg');
      $("#msgcontainer").addClass('right_msg');
      document.getElementById("msgheader").innerText = "NEXT PLAYERS"
    }
  })

  room.onPeerLeave(peerId => {
    if (peerId == players[0]) {
      Module.pico8Reset()
      if (players.length >= 1) {
        yourTurn()
        pauseShortly(resumeGame)
      } else {
        pauseShortly()
      }
    }
    players.splice(players.indexOf(peerId), 1)
    
  })
  
  getData((data, peerId) => {
    if (peerId == players[0] && data.msg == "data") {
      pico8_gpio = data.data
    } else {
      console.log(data)
    }
  })
}
try {
  newPeer()
} catch(error) {
  console.log(error)
// newPeer()
}
export { pico8_gpio }
window.pico8_gpio = pico8_gpio
