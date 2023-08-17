// var socket = io("https://neru-d0cab68b-debug-debug.apse1.runtime.vonage.cloud", { path: "/socket.io" });
var socket = io("https://neru-d0cab68b-wa-verification-vapi-dev.apse1.runtime.vonage.cloud", { path: "/socket.io" });

var TIMESTAMP_FORMAT = "DD-MM-YYYY HH:mm:ss";

// Essential variables
let apiKey, apiSecret, lvn;
let appId, roomUuid;
let numbers;
let vonageAppId, vonageLvn;
let notificationMessage = "";

let apiKeyElem = document.getElementById("apiKey");
let apiSecretElem = document.getElementById("apiSecret");
let lvnElem = document.getElementById("lvn");

let loginElem = document.getElementById("login");
let mainElem = document.getElementById("main");

let loginLoaderElem = document.getElementById("login-loader");
let loginButtonElem = document.getElementById("login-button");

let notificationMessageElem = document.getElementById("notification-message");

// --------------------

async function login() {
    try {
        apiKey = apiKeyElem.value;
        apiSecret = apiSecretElem.value;
        lvn = lvnElem.value;
        // console.log({apiKey, apiSecret, lvn});

        loginButtonElem.classList.add("hide");
        loginLoaderElem.classList.remove("hide");

        await addNotificationMessage(`Checking your credentials and LVN...`);

        let result = await axios.post(`/login`, {
            apiKey, apiSecret, lvn
        });
        console.log(`/login | `, result.status, result.data);
        if (result.status === 200) {
            if (result.data.status === "Error") {
                throw(result.data.error);
            }
            if (result.data.count === 0 || result.data.numbers.length === 0) {
                throw("The LVN doesn't exist under your account. Please reenter an existing LVN.");
            }

            appId = result.data.appId;
            // roomUuid = result.data.roomUuid;
            numbers = result.data.numbers;
            if (result.data.count > 1 && result.data.numbers) {
                // TODO: ask to select which LVN
                await showModal("whichLvn", result.data.numbers);
            } else if (result.data.count > 0 && result.data.numbers[0].app_id) {
                // TODO: ask whether to reuse this application id or create new application
                vonageLvn = result.data.numbers[0];

                await showModal("whichVonageApp", { lvn, vonageAppId: result.data.numbers[0].app_id });
            } else {
                vonageLvn = result.data.numbers[0];

                await registerVonageApp(vonageLvn.country, vonageLvn.msisdn);
            }
        } else {
            await handleError(result);
        }
    } catch (error) {
        await handleError(error);
    }
}

async function registerVonageApp(lvnCountry, lvnMsisdn, vappId=null) {
    try {
        await hideVappButtons();
        await hideLvnChoiceButtons();

        await addNotificationMessage(`Setting up your Vonage Application and Number...`);

        let result = await axios.post(`/register/vapp`, {
            apiKey, apiSecret, lvnCountry, lvnMsisdn,
            vonageAppId: vappId
        });
        console.log(`/register/vapp | `, result.status, result.data);
        console.log(result);
        if (result.status === 200) {
            if (result.data.status === "Error") {
                throw(result.data.error);
            }

            console.log(result.data.vonageApp);
            vonageAppId = result.data.vonageApp.id;

            await addNotificationMessage(`Vonage Application and Number set up successfully!`);

            await registerRoom();
        } else {
            await handleError(result);
        }
    } catch (error) {
        await handleError(error);
    }
}

async function registerRoom() {
    try {
        await hideVappButtons();
        await hideLvnChoiceButtons();

        await addNotificationMessage(`Setting up room...`);

        let result = await axios.post(`/register/room`, {
            apiKey, //roomUuid, 
            lvn: vonageLvn.msisdn,
            vonageAppId
        });
        console.log(`/register/room | `, result.status, result.data);
        if (result.status === 200) {
            if (result.data.status === "Error") {
                throw(result.data.error);
            }

            roomUuid = result.data.room.roomUuid;

            await addNotificationMessage(`Room set up successfully!`);
            await addNotificationMessage(`Listening to any inbound calls for ${lvn}...`);
            await addNotificationMessage(`Please proceed to set up your WhatsApp with Vonage from the Vonage API Dashboard!`);

            await init();
            
        } else {
            await handleError(result);
        }
    } catch (error) {
        await handleError(error);
    }
}

async function init() {
    // update UI
    await hideLogin();
    
    // join room to receive events
    roomId = `${appId}_room_${roomUuid}`;
    await joinRoom();
}

async function hideLogin() {
    loginElem.classList.add("hide");
    mainElem.classList.remove("hide");
}

async function hideVappButtons() {
    let vappLoaderElem = document.getElementById("vapp-loader");

    let reuseVappButtonElem = document.getElementById("reuse-vapp");
    let createVappButtonElem = document.getElementById("create-vapp");
    
    if (vappLoaderElem) {
        reuseVappButtonElem.classList.add("hide");
        createVappButtonElem.classList.add("hide");
        vappLoaderElem.classList.remove("hide");
    }
}

async function hideLvnChoiceButtons() {
    let lvnLoaderElem = document.getElementById("lvn-loader");
    let lvnChoiceButtonElems = document.getElementsByClassName("lvn");

    if (lvnLoaderElem) {
        Array.from(lvnChoiceButtonElems).forEach((el) => {
            el.classList.add("hide");
        });
        lvnLoaderElem.classList.remove("hide");
    }
}

async function addNotificationMessage(message, timestamp=true, refresh=false, linebreak=true) {
    if (refresh) {
        notificationMessageElem.innerHTML = ``;
    }
    if (timestamp) {
        notificationMessageElem.innerHTML += `[ ${moment().format(TIMESTAMP_FORMAT)} ]   `;
    }
    notificationMessageElem.innerHTML += `${message}`;
    if (linebreak) {
        notificationMessageElem.innerHTML += `<br/>`;
    }
}

async function addRecording(url, timestamp=true, refresh=false) {
    if (refresh) {
        notificationMessageElem.innerHTML = ``;
    }
    if (timestamp) {
        notificationMessageElem.innerHTML += `<div>[ ${moment().format(TIMESTAMP_FORMAT)} ]   Call recording generated:</div>`;
    } else {
        notificationMessageElem.innerHTML += `<div>Call recording generated:</div>`;
    }
    notificationMessageElem.innerHTML += `
    <div>
        <audio controls>
            <source src="${url}?api_key=${apiKey}&api_secret=${apiSecret}" type="audio/wav">
            Your browser does not support the audio element.
        </audio>
    </div>`;
}

// --------------------

async function vonageAppChoice(choice) {
    console.log("vonageAppChoice", {choice, vonageLvn});

    if(choice === "reuse") {
        await registerVonageApp(vonageLvn.country, vonageLvn.msisdn, vonageLvn.app_id);
    } else if(choice === "create") {
        await registerVonageApp(vonageLvn.country, vonageLvn.msisdn);
    }

    modalElem.style.display = "none";
}

async function lvnChoice(number) {
    console.log("lvnChoice", number);
    lvn = number;
    numbers.forEach((n) => {
        if (n.msisdn === number.toString()) {
            vonageLvn = n;
        }
    });
    console.log("vonageLvn", vonageLvn);

    modalElem.style.display = "none";

    if (vonageLvn.app_id) {
        // TODO: ask whether to reuse this application id or create new application
        await showModal("whichVonageApp", { lvn, vonageAppId: vonageLvn.app_id });
    } else {
        await registerVonageApp(vonageLvn.country, vonageLvn.msisdn, vonageAppId);
    }
}

function constructWhichLvn(numbers) {
    let innerHTML = `You seem to have more than 1 LVN matching that number. Please pick one from the list below.<br><br>`;
  
    numbers.forEach((number) => {
        innerHTML += `
        <button class="lvn ${number.app_id ? '' : 'noapp'}" onclick="lvnChoice('${number.msisdn}')">${number.msisdn}</button>
        <div id="lvn-loader" class="loader hide"></div>`;
    });
    
    document.getElementById("modal-content").innerHTML = innerHTML;
}

function constructWhichVonageApp({ lvn, vonageAppId }) {
    document.getElementById("modal-content").innerHTML = `
    <b>${lvn}</b> is already linked to an existing Vonage Application with id <b>${vonageAppId}</b>.<br><br>
    Do you want to reuse and update this Vonage Application, or create a new application and link the number to the new Vonage Application?<br><br>
    
    <button id="reuse-vapp" class="vapp" onclick="vonageAppChoice('reuse')">Reuse & Update</button>
    <button id="create-vapp" class="vapp" onclick="vonageAppChoice('create')">Create New</button>
    <div id="vapp-loader" class="loader hide"></div>`;
}

var modalElem = document.getElementById("modal");

async function showModal(type, data) {
    console.log("showModal", type, data);
    if (type === "whichLvn") {
        await constructWhichLvn(data);
    } else if (type === "whichVonageApp") {
        await constructWhichVonageApp(data);
    }
    modalElem.style.display = "block";
}

// --------------------

// Handling all of our errors here by alerting them
function handleError(error) {
    if (error) {
        console.log('handleError error', error);
        alert(error.message ? error.message : error);

        loginButtonElem.classList.remove("hide");
        loginLoaderElem.classList.add("hide");
    }
}

// --------------------

// Join socket.io room to receive events
async function joinRoom() {
    console.log("Joining room ", roomId);
    socket.emit(`join:room`, { roomId });
    joinedRoom = true;
}

// Listen to socket events
socket.on('event', async (socketData) => {
    console.log("SOCKET EVENT RECEIVED", socketData);

    if (!socketData.event) return;

    const { event, data } = socketData;
    if (event === "call:event") {
        const { to, status } = data;
        if (status === "ringing") {
            await addNotificationMessage(`Inbound call received by ${to}.`);
        } else if (status === "answered") {
            await addNotificationMessage(`Inbound call received by ${to} has been answered. Please wait while we transcribe the call... Note that the transcribe only works with English and if it's not showing correctly, you can refer to the recording!`);
        } else if (status === "completed") {
            await addNotificationMessage(`Inbound call received by ${to} has been completed.`);
        }
    } else if (event === "call:transcription") {
        const { speech: { recording_url, results } } = data;
        if (results) {
            await addNotificationMessage(`Call transcript generated: <br><blockquote class='transcription'>${results[0].text}</blockquote>`, true, false, false);
        }
        if (recording_url) {
            await addRecording(recording_url);
        }
    }
    
});