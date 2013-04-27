/**
 * This is a test with audio tag and Node.js. We're basically streaming every keycode pressed on
 * the keyboard. Every client connected on the socket will receive the data, if the keycode match
 * with on one of those specified, the song will be played.
 * We also have the "record" feature. The keys will be stored on localstorage. The "play" button will
 * fire the song execution.
 */

(function () {

	var notes = {}, 
		recordedFlow = [],
		isRecording = false, 
		timer = null,
		started = false,
		connection = null;

	window.onload = function () {
		setConnection();
		setEvents();
		setNotes();
	}

	/**
	 * This function will do the connection between the client and the server adding the callbacks.
	 * We know when the connection is open, when an error happened and when a message was received
	 */
	var setConnection = function () {
		// if user is running mozilla then use it's built-in WebSocket
	    window.WebSocket = window.WebSocket || window.MozWebSocket;

	    if (!window.WebSocket) {
	        console.log('Sorry, but your browser doesn\'t ' + 'support WebSockets.');

	        return null;
	    }

	    //the string should contain the IP adress from the node server
	    connection = new WebSocket('ws://192.168.2.102:1337');

	    connection.onopen = function () {
	        console.log('connection opened')
	        started = true;
	    };

	    connection.onerror = function (error) {
	        console.log('Sorry, but there\'s some problem with your ' + 'connection or the server is down');
	    };

	    connection.onmessage = function (message) {
	        
	        try {
	            var json = JSON.parse(message.data);
	        } catch (e) {
	            console.log('This doesn\'t look like a valid JSON: ', message.data);
	            return;
	        }

	        console.log('message', json)

	        playNote(JSON.parse(json.utf8Data))
	    };
	}

	/**
	 * Set the buttons events
	 */
	var setEvents = function() {

		window.onkeydown = keyController;

		document.getElementById('record').onclick = function () {
			isRecording = true;	
		}

		document.getElementById('stop').onclick = function () {
			isRecording = false;	

			if (window.localStorage) {
				window.localStorage.setItem('recordedSong', JSON.stringify(recordedFlow));
			}

			if (timer) {
				clearInterval(timer);
			}
		}

		document.getElementById('clear').onclick = function () {
			recordedFlow = [];

			if (window.localStorage) {
				window.localStorage.clear();
			}
		}

		document.getElementById('play').onclick = function () { 
			playRecorded();
		}
	}

	/**
	 * Callback passed on window.keydown event
	 */
	var keyController = function (ev) {

		playNote(ev.keyCode);
		
		if (started) {
			connection.send(JSON.stringify(ev.keyCode));
		}

		if (isRecording) {
			addNote(ev.keyCode, ev.timeStamp);
		}
	}

	/**
	 * Adds a specif note to recorded streaming
	 */
	var addNote = function (key, time) {
		recordedFlow.push({key: key, time: time});
	}

	/**
	 * Get the stored keys from localStorage
	 */
	var getData = function () {
		if (window.localStorage) {
			return JSON.parse(window.localStorage.getItem('recordedSong'));
		}
	}

	/**
	 * Play the notes stored on localStorage
	 */
	var playRecorded = function () {

		var data = getData(), 
			executionTime = 0, 
			notesIterator = 0, 
			dataLength = data ? data.length : 0; 

		for (var i = 0, len = dataLength; i < len; i++) {
			data[i].execTime = data[i].time - data[0].time;
		}

		if (dataLength) {

			timer = setInterval(function () {

				if (data[notesIterator].execTime <= executionTime) {
					// playNote(data[notesIterator].key);
					keyController({keyCode: data[notesIterator].key})
					notesIterator++;
				}

				executionTime += 4;

				if (notesIterator === dataLength) {
					clearInterval(timer);
				}

			}, 1);
		}
		
	}

	/**
	 * Set the notes object with the audio tag elements reference
	 */
	var setNotes = function () {
		var notesArray = document.getElementsByTagName('audio');

		notes = {
			'do': notesArray[0],
			dos: notesArray[1],
			re: notesArray[2],
			res: notesArray[3],
			mi: notesArray[4],
			fa: notesArray[5],
			fas: notesArray[6],
			sol: notesArray[7],
			sols: notesArray[8],
			la: notesArray[9],
			las: notesArray[10],
			si: notesArray[11]
		}
	}

	/**
	 * Calls the method "play" from a specific audio tag element according
	 * with the pressed key
	 */
	var playNote = function (note) {

		switch (note) {
			case 65:
				notes['do'].play();
			break;
			case 87:
				notes['dos'].play();
			break;

			case 83:
				notes['re'].play();
			break;
			case 69:
				notes['res'].play();
			break;
			case 68:
				notes['mi'].play();
			break;
			case 70:
				notes['fa'].play();
			break;
			case 84:
				notes['fas'].play();
			break;
			case 71:
				notes['sol'].play();
			break;
			case 89:
				notes['sols'].play();
			break;
			case 72:
				notes['la'].play();
			break;
			case 85:
				notes['las'].play();
			break;
			case 74:
				notes['si'].play();
			break;
		}
	}

})()