export default (container) => {
    
    const listJobs = async (from, to, nextUrl=null, jobs=[]) => {
		try {
			let url = `${container.config.DETRACK_API_HOST}${container.config.DETRACK_API_JOB_SEARCH}`;
			if (nextUrl) {
				url = nextUrl;
			}

			let result = await container.axios({
				method: "post",
				url,
				headers: {
					"Content-Type": "application/json",
					"X-API-KEY": `${container.config.DETRACK_API_KEY}`
				},
				data: {
					data: {
						"do_number": "VONAGE TEST DO"
					}, // TODO: delete when deploying to production
					// dates: { from, to } // TODO: uncomment when deploying to production
				}
			});

			jobs = jobs.concat(result.data.data);
			if (result.data && result.data.links.next) {
				await listJobs(from, to, result.data.links.next, jobs);
			}

			return Promise.resolve(jobs);
		} catch (error) {
			return Promise.reject(error);
		}
    };
	

    return {
		listJobs,
    };
  };
  