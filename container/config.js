export default {
	ENVIRONMENT: process.env.NODE_ENV || 'development',
	PORT: process.env.NERU_APP_PORT || 3000,
	HOST: `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split(".")[1]}.runtime.vonage.cloud`,
	APPLICATION_ID: process.env.API_APPLICATION_ID,

	NUMBERS_API_LISTOWNEDNUMBERS: "https://rest.nexmo.com/account/numbers",
	NUMBERS_API_UPDATENUMBER: "https://rest.nexmo.com/number/update",

	APPLICATION_API_CREATEAPPLICATION: "https://api.nexmo.com/v2/applications",
	APPLICATION_API_UPDATEAPPLICATION: "https://api.nexmo.com/v2/applications/:id",

	ENDPOINT_VOICE_ANSWERPATH: "/vapi/answer",
	ENDPOINT_VOICE_FALLBACKPATH: "/vapi/answer",
	ENDPOINT_VOICE_EVENTPATH: "/vapi/events",
};