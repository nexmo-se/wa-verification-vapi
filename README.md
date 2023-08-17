This app was created to fulfill the ticket [SEG-713](https://jira.vonage.com/browse/SEG-713) | "WA Onboarding App for China customers".
User will be able to input their Vonage account API Key, API Secret, and their owned LVN number (which should have Voice capability), and the app will listen to any inbound calls coming in to this LVN. When the call is done, we will display the call recording and call transcription to the user.

## 📚 APIs
- [Vonage Voice API](https://developer.vonage.com/en/api/voice)
- [Vonage Numbers API](https://developer.vonage.com/en/api/numbers)
- [Vonage Application API](https://developer.vonage.com/en/api/application.v2)

## 🛠 Setup
1. This is a VCR project. Copy `neru.sample.yml`. Rename it to `neru.yml` and fill in the information accordingly.

## ▶️ Run Project
1. Run `neru deploy` to deploy the project instance.