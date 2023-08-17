import container from '../container/index.js';

const router = container.express.Router();

const { APPLICATION_ID } = container.config;

router.get('/', async (req, res, next) => {
	res.json({ status: "Ok" });
});

router.get('/test-socket/:roomUuid', async (req, res, next) => {
	try {
		container.io.to(`${APPLICATION_ID}_room_${req.params.roomUuid}`).emit("event", { event: "call:transcription", data: {
			"speech": {
				"results": [{
					"confidence": "0.7579611",
					"text": "your verification code is 83576 3 your verification code is 83576 3"
				}, {
					"confidence": "0.7360194",
					"text": "your verification code is 8 35763 your verification code is 83576 3"
				}],
				"recording_url": "https://api-us.nexmo.com/v1/files/087fe72e-cdec-4b95-8aa0-feee638ebc6f"
			},
		}});
		console.log(`/admin/test-socket ::: notified front end room ::: ${APPLICATION_ID}_room_${req.params.roomUuid}`);

		res.json({ status: "Ok" });
	} catch(error) {
		console.error("/admin/test-socket ERROR ::: ", error);
		res.json({
			status: "Error",
			error
		});
	}
});

router.get('/rooms/:action', async (req, res, next) => {
	try {
		let rooms = await container.roomsService.getRooms();

		if(req.params.action === "clear") {
			rooms = await container.roomsService.clear();
		}

		res.json(rooms);
	} catch(error) {
		console.error("/admin/rooms ERROR ::: ", error);
		res.json({
			status: "Error",
			error
		});
	}
});

export default router;