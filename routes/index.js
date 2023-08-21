import container from '../container/index.js';

const router = container.express.Router();

router.get('/_/health', async (req, res) => {
    res.sendStatus(200);
});

router.get('/up', async (req, res) => {
	res.send('hello world').status(200);
});
  
router.get('/', (req, res) => {
	res.sendFile(container.path.join(container.publicDir, 'index.html'));
});

router.post('/login', async (req, res, next) => {
	try {
		let { apiKey, apiSecret, lvn } = req.body;
		if (!apiKey || !apiSecret || !lvn) {
			throw("apiKey, apiSecret, and lvn are required");
		}

		let result = await container.numbersService.listOwnedNumbers(apiKey, apiSecret, lvn);

		if (JSON.stringify(result) === "{}" || result.count === 0) {
			throw("The LVN doesn't exist under your account. Please reenter an existing LVN with Voice capabilities.")
		}

		result.numbers = result.numbers.filter((n) => {
			return n.features.indexOf("VOICE") > -1;
		});
		result.count = result.numbers.length;

		if (result.count === 0) {
			throw("There is no LVN matching your input which has Voice capabilities under your account. Please reenter an existing LVN with Voice capabilities.")
		}

		result.appId = container.config.APPLICATION_ID;

		res.json({
			status: "Ok",
			...result
		});
	} catch(error) {
		console.error("/login ERROR ::: ", error);
		res.json({
			status: "Error",
			error
		});
	}	
});

router.post('/register/vapp', async (req, res, next) => {
	try {
		console.log("/register/vapp req.body ::: ", JSON.stringify(req.body));
		let { apiKey, apiSecret, lvnCountry, lvnMsisdn, vonageAppId } = req.body;
		if (!apiKey || !apiSecret || !lvnCountry || !lvnMsisdn) {
			throw("apiKey, roomUuid, lvnCountry, and lvnMsisdn are required");
		}

		let vonageApp;
		if (!vonageAppId) {
			vonageApp = await container.applicationService.create(apiKey, apiSecret);
		} else {
			vonageApp = await container.applicationService.update(apiKey, apiSecret, vonageAppId);
		}

		await container.numbersService.updateNumber(apiKey, apiSecret, lvnCountry, lvnMsisdn, vonageApp.id);

		res.json({
			status: "Ok",
			lvnCountry, lvnMsisdn, vonageApp
		});
	} catch(error) {
		console.error("/register/vapp ERROR ::: ", error);
		res.json({
			status: "Error",
			error
		});
	}
});

router.post('/register/room', async (req, res, next) => {
	try {
		console.log("/register/room req.body ::: ", JSON.stringify(req.body));
		// let { apiKey, roomUuid, lvn, vonageAppId } = req.body;
		// if (!apiKey || !roomUuid || !lvn || !vonageAppId) {
		// 	throw("apiKey, roomUuid, lvn, and vonageAppId are required");
		// }
		let { apiKey, apiSecret, lvn, vonageAppId } = req.body;
		if (!apiKey || !apiSecret || !lvn || !vonageAppId) {
			throw("apiKey, apiSecret, lvn, and vonageAppId are required");
		}

		let roomUuid = container.uuidv4();
		let room = await container.roomsService.addOrUpdateRoom("lvn", lvn, apiKey, apiSecret, roomUuid, lvn, vonageAppId);
		console.log("/register/room room ::: ", JSON.stringify(room));

		res.json({
			status: "Ok",
			room
		});
	} catch(error) {
		console.error("/register/room ERROR ::: ", error);
		res.json({
			status: "Error",
			error
		});
	}	
});

export default router;