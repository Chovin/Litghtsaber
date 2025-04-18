# Litghtsaber

Litghtsaber is a [PICO-8](https://www.lexaloffle.com/pico-8.php) game that uses ~~[PeerJS](https://peerjs.com/)~~ [Trystero](https://github.com/dmotz/trystero) to let you swing a litghtsaber around like a badass using your phone's accerlerometer. Deflect those blaster bolts! 😱

* It's completely browser-based which means all you need to play it are 2 devices with browsers! phone + phone, phone + laptop, tablet + tablet? Are you crazy? 🤨
* It's peer to peer, which means if you're on the same network, you'll get nice low, smooth latencies! That litghtsaber will swing like butter! (unless you're on overloaded hotel wifi 😩)
* Its peer to peer nature also means that we don't need a server. All we need to host it is a static file hosting service!
* It's got juicey sound effects and graphics. Go ahead, try not to feel like a badass. I dare you. 😎


*play online: https://chov.in/Litghtsaber/*  
*play the original: https://github.com/Chovin/Litghtsaber/tree/original*

## install

1. put it somewhere like Github Pages, REPL.it, or Surge.sh
2. you might need HTTPS for the peer to peer connection to work, so set it up for whichever hosting solution you're using! (this makes hosting it locally a bit more of a pain, so I wouldn't recommend it..)

## play

1. go to the url to load up the game
2. connect your phone via the QR code
3. litght up your litghtsaber and deflect those blaster bolts like your life depends on it!  

## FAQ

<details><summary>
    Why is my litghtsaber turning the wrong way?
</summary>
    <blockquote>Sorry, I'm left-handed. Press the "backwards" button and you should be all good!</blockquote>
</details>  

<details><summary>
    My litghtsaber <b>turns</b> weird.
</summary>
    <blockquote>Make sure you hold your phone such that phone's screen is perpendicular to the game screen (while facing the game, make sure your phone is facing either directly left, or right). The uh gyroscope in the litghtsaber needs to be at a certain angle to uh.. keep.. the plasma straight. ...Didn't you ever learn how to use a litghtsaber?</blockquote>
</details>  

<details><summary>
    My litghtsaber <b>moves</b> weird.
</summary>
    <blockquote>Yeahhh. Using the accelerometer alone means there's mathematically not enough data to account for sensor drift.. I try and get over that problem by looking for the average "rolling" drift, subtracting that from the current reading, and then for good measure (and to encourage hot potatoing by not forcing people to have to always stand at one spot), I slowly move the litghtsaber back to the center. I'd imagine there are ways to make it feel more natural.. AR apps get that extra info from the camera right? I've just not put enough time or research into it yet. For now, if you remember that the litghtsaber returns to the center, you should start to get used to it :)</blockquote>
</details>  

<details><summary>
    What's with the name?
</summary>
    <blockquote>It was a typo. I thought it was silly so I kept it.</blockquote>
</details>  

<details><summary>
    Where are you planning on taking this in the future? I want this feature and that feature in it!
</summary>
    <blockquote>I work on this rarely and usually only when I feel this project would fit nicely with some other event or situation, so I guess the plans are wherever the wind takes it. With that said, I do have some ideas like adding a waiting queue of devices since I usually have the game screen projected up somewhere with crowds around, personal, local, and global high-scores, some improvements on acceleration, and an awesome lightsaber screen and sound effects coming from your phone/controller! If you'd like to suggest an idea or hop into the conversation on some of these ones and others, check out the <a href="https://github.com/Chovin/Litghtsaber/issues">issues</a>! If you'd like to contribute and see these features sooner rather than later, please do! I'd love the help. Hop on and start <a href="$contributing">contributing</a>! ❤️ </blockquote>
</details>  

<details><summary>
    How did this start? What's with the weird quality and the choice to use PICO-8?
</summary>
    <blockquote>I use PICO-8 to try and instill creative wonder and excitement in the local programming communities I'm a part of. That's basically where this all started and unfortunately also explains why it's a mess right now 😅. This project has had several iterations over time--each one either trying to instill that wonder, rushed to show at an event, to show my peers how quick and easy you are able to do cool things with programming, or just for fun! There was no plan at the start and I just kept pulling this project up as the need arose. Unfortunately, that means overall quality and code quality is all over the place.. I'm liking how this is turning out though, so I'll probably clean it up some time soon.</blockquote>
 </details>

## issues

* audio doesn't work on chrome. I'd like to find a way to fix this without digging into PICO-8's output web files. Maybe an update of PICO-8 will fix it /shrug
* acceleration is pretty sucky! If you remember that the litghtsaber automatically floats back to the middle of the screen, you can get used to it after awhile.

## contributing

I'd love help on this! Unfortuntely the code in its current state is pretty illegible 😢 (see the [FAQ](#faq)).

I'll work on improving readability, but until then if you'd like to contribute, open an issue to let me know and I'll gladly walk you through the code.

Not sure where to start or you're curious if your idea is already being worked on? There are a bunch of [issues](https://github.com/Chovin/Litghtsaber/issues) open with bugs and ideas. Check those out and chime in! 

You don't have [PICO-8](https://www.lexaloffle.com/pico-8.php) but want to contribute? The game side of things is a PICO-8 cart exported for the web, but there is plenty of work that's pure JS, so feel free to jump in, we won't judge! (PICO-8 **is** pretty awesome though 😉)
