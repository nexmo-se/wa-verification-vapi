import container from '../container/index.js';

const router = container.express.Router();

const { HOST, APPLICATION_ID } = container.config;

router.get('/', async (req, res, next) => {
	res.json({ status: "Ok" });
});

router.post('/answer', async (req, res, next) => {
	// TODO:
	// - Check if number exists in rooms and has roomUuid
	// - If so, return NCCO. Otherwise return error

	// {
	// 	"region_url": "https://api-us-3.vonage.com",
	// 	"from": "18483014897",
	// 	"to": "447441448589",
	// 	"uuid": "75cfd97e2d00d1e54c178892c8324aee",
	// 	"conversation_uuid": "CON-d224d8c9-0ae8-4f10-9e62-4a0145d1c9de"
	// }
	
	try {
		console.log("/vapi/answer req.body ::: ", JSON.stringify(req.body));
		let { to } = req.body;

		if (!to) {
			throw(`to is required.`);
		}
		
		const room = await container.roomsService.getARoom("lvn", to);
		if (!room) {
			throw(`Room with lvn ${to} not found. Throwing empty NCCO.`);
		}
		if (!room.roomUuid) {
			throw(`Room with lvn ${to} missing roomUuid.`);
		}

		res.json([{
			"action": "input",
			"eventUrl": [ `${HOST}/vapi/input/${room.roomUuid}/${to}` ],
			"type": [ "speech" ],
			"speech": {
				"endOnSilence": 5,
				"startTimeout": 10,
				"maxDuration": 60,
				"saveAudio": true
			}
		}]);
	} catch(error) {
		console.error("/vapi/answer ERROR ::: ", error);
		res.json([]);
	}
});

router.post('/events', async (req, res, next) => {
	// TODO:
	// - Check if number exists in rooms and has roomUuid
	// - If so, blast events to roomUuid socket room

	// {
	// 	"headers": {},
	// 	"from": "18483014897",
	// 	"to": "447441448589",
	// 	"uuid": "75cfd97e2d00d1e54c178892c8324aee",
	// 	"conversation_uuid": "CON-d224d8c9-0ae8-4f10-9e62-4a0145d1c9de",
	// 	"status": "ringing",
	// 	"direction": "inbound",
	// 	"timestamp": "2023-08-10T03:46:16.011Z"
	// }
	
	try {
		console.log("/vapi/events req.body ::: ", JSON.stringify(req.body));
		let { to, direction } = req.body;

		if (!to) {
			throw(`to is required.`);
		}
		if (direction !== "inbound") {
			throw(`Only listening to inbound calls.`);
		}
		
		const room = await container.roomsService.getARoom("lvn", to);
		console.log("/vapi/events room found ::: ", JSON.stringify(room));
		if (!room) {
			throw(`Room with lvn ${to} not found.`);
		}
		if (!room.roomUuid) {
			throw(`Room with lvn ${to} missing roomUuid.`);
		}

		const key = `${APPLICATION_ID}_room_${room.roomUuid}`;
		container.io.to(key).emit("event", { event: "call:event", data: req.body});
		console.log(`/vapi/events ::: notified room ${key}`);

		res.json({ status: "Ok" });
	} catch(error) {
		console.error("/vapi/events ERROR ::: ", error);
		res.json({
			status: "Error",
			error
		});
	}
});

router.post('/input/:roomUuid/:lvn', async (req, res, next) => {
	// {
	// 	"speech": {
	// 		"results": [{
	// 			"confidence": "0.7579611",
	// 			"text": "your verification code is 83576 3 your verification code is 83576 3"
	// 		}, {
	// 			"confidence": "0.7360194",
	// 			"text": "your verification code is 8 35763 your verification code is 83576 3"
	// 		}],
	// 		"recording_url": "https://api-us.nexmo.com/v1/files/087fe72e-cdec-4b95-8aa0-feee638ebc6f"
	// 	},
	// 	"dtmf": {
	// 		"digits": null,
	// 		"timed_out": false
	// 	},
	// 	"from": "18483014897",
	// 	"to": "447441448589",
	// 	"uuid": "e53f67674a7802e4b9409f16ceba104a",
	// 	"conversation_uuid": "CON-e2b23b23-0003-485a-a161-7d622c9f708e",
	// 	"timestamp": "2023-08-10T07:06:53.277Z"
	// }

	// {
	// 	"speech": {
	// 		"error": "ERR1: Failed to analyze audio"
	// 	},
	// 	"dtmf": {
	// 		"digits": null,
	// 		"timed_out": false
	// 	},
	// 	"from": "18483014897",
	// 	"to": "447441448589",
	// 	"uuid": "75cfd97e2d00d1e54c178892c8324aee",
	// 	"conversation_uuid": "CON-d224d8c9-0ae8-4f10-9e62-4a0145d1c9de",
	// 	"timestamp": "2023-08-10T03:46:28.716Z"
	// }

	// TODO:
	// - Check if number and roomUuid exists in rooms
	// - If so, blast transcription to roomUuid socket room

	try {
		console.log("/vapi/input req.body ::: ", JSON.stringify(req.body));
		let { speech, to } = req.body;
		let { roomUuid, lvn } = req.params;

		if (!speech || !to) {
			throw(`speech and to is required.`);
		}
		if (speech.error && !speech.recording_url) {
			throw(`Error: ${speech.error}`);
		}
		if (speech.timeout_reason && !speech.recording_url) {
			throw(`Timeout: ${speech.timeout_reason}`);
		}
		if (!speech.results && !speech.recording_url) {
			throw(`Error: "No recording and no transcription available"`);
		}
		if (to !== lvn) {
			throw(`Numbers not matching.`);
		}
		
		const room = await container.roomsService.getARoom("lvn", to);
		console.log("/vapi/input room found ::: ", JSON.stringify(room));
		if (!room) {
			throw(`Room with lvn ${to} not found.`);
		}
		if (!room.roomUuid) {
			throw(`Room with lvn ${to} missing roomUuid.`);
		}
		if (room.roomUuid !== roomUuid) {
			throw(`Room id not matching.`);
		}

		const key = `${APPLICATION_ID}_room_${room.roomUuid}`;
		container.io.to(key).emit("event", { event: "call:transcription", data: req.body});
		console.log(`/vapi/input ::: notified room ${key}`);

		res.json({ status: "Ok" });
	} catch(error) {
		console.error("/vapi/input ERROR ::: ", error);
		res.json({
			status: "Error",
			error
		});
	}
});

export default router;