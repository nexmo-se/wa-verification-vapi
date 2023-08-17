export default (container) => {

	let {
        HOST, ENDPOINT_VOICE_ANSWERPATH, ENDPOINT_VOICE_FALLBACKPATH, ENDPOINT_VOICE_EVENTPATH,
        APPLICATION_API_CREATEAPPLICATION, APPLICATION_API_UPDATEAPPLICATION
    } = container.config;

    const updateData = {
        name: "WhatsApp Onboarding Verification",
        capabilities: {
            voice: {
                webhooks: {
                    answer_url: {
                        address: `${HOST}${ENDPOINT_VOICE_ANSWERPATH}`,
                        http_method: "POST"
                    },
                    fallback_answer_url: {
                        address: `${HOST}${ENDPOINT_VOICE_FALLBACKPATH}`,
                        http_method: "POST"
                    },
                    event_url: {
                        address: `${HOST}${ENDPOINT_VOICE_EVENTPATH}`,
                        http_method: "POST"
                    },
                }
            }
        }
    };
    
    const create = async (apiKey, apiSecret) => {
		try {
            let auth = `${apiKey}:${apiSecret}`;
            let result = await container.axios({
				method: "post",
				url: `${APPLICATION_API_CREATEAPPLICATION}`,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Basic ${Buffer.from(auth).toString('base64')}`
				},
                data: updateData
			});
            console.log("create result :::", JSON.stringify(result.data));

			return Promise.resolve(result.data);
		} catch (error) {
            if (error.title && error.detail) {
                error = `${error.title}: ${error.detail}`;
            }
			return Promise.reject(error);
		}
    };

    const update = async (apiKey, apiSecret, vonageAppId) => {
		try {
            let auth = `${apiKey}:${apiSecret}`;
            let result = await container.axios({
				method: "put",
				url: `${APPLICATION_API_UPDATEAPPLICATION.replace(":id", vonageAppId)}`,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Basic ${Buffer.from(auth).toString('base64')}`
				},
                data: updateData
			});
            console.log("update result :::", JSON.stringify(result.data));

			return Promise.resolve(result.data);
		} catch (error) {
            if (error.title && error.detail) {
                error = `${error.title}: ${error.detail}`;
            }
			return Promise.reject(error);
		}
    };
	
    return {
        create,
        update,
    };
};
  