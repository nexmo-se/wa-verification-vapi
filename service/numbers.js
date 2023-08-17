export default (container) => {

	let { NUMBERS_API_LISTOWNEDNUMBERS, NUMBERS_API_UPDATENUMBER } = container.config;
    
    const listOwnedNumbers = async (apiKey, apiSecret, msisdn) => {
		try {
            let auth = `${apiKey}:${apiSecret}`;
            let config = {
				method: "get",
				url: `${NUMBERS_API_LISTOWNEDNUMBERS}?search_pattern=1&pattern=${msisdn}&size=100`,
				headers: {
					"Authorization": `Basic ${Buffer.from(auth).toString('base64')}`
				}
			};
            
            console.log("listOwnedNumbers config :::", JSON.stringify(config));
            let result = await container.axios(config);
            console.log("listOwnedNumbers result :::", JSON.stringify(result.data));

            if (!result.data) {
                result.data = {
                    count: 0,
                    numbers: []
                };
            }

			return Promise.resolve(result.data);
		} catch (error) {
            console.log("listOwnedNumbers error :::", JSON.stringify(error));
            if (error.title && error.detail) {
                error = `${error.title}: ${error.detail}`;
            }
			return Promise.reject(error);
		}
    };

    const updateNumber = async (apiKey, apiSecret, country, msisdn, app_id) => {
		try {
            let auth = `${apiKey}:${apiSecret}`;
            let data = container.qs.stringify({
                country, msisdn, app_id
            });
            let config = {
				method: "post",
				url: `${NUMBERS_API_UPDATENUMBER}`,
				headers: {
					"Authorization": `Basic ${Buffer.from(auth).toString('base64')}`,
                    'Content-Type': "application/x-www-form-urlencoded"
				},
                data
			};
            
            console.log("updateNumber config :::", JSON.stringify(config));
            let result = await container.axios(config);
            console.log("updateNumber result :::", JSON.stringify(result.data));

			return Promise.resolve(result.data);
		} catch (error) {
            console.log("updateNumber error :::", JSON.stringify(error));
            if (error.title && error.detail) {
                error = `${error.title}: ${error.detail}`;
            }
			return Promise.reject(error);
		}
    };
	
    return {
        listOwnedNumbers,

        updateNumber,
    };
};
  