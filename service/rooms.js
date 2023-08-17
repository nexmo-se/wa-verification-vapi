export default (container) => {

	let { APPLICATION_ID } = container.config;

    const getRooms = async () => {
		try {
            const key = `${APPLICATION_ID}_rooms`;
            const rooms = await container.vcrInstanceState.get(key);
            
			return Promise.resolve(rooms);
		} catch (error) {
			return Promise.reject(error);
		}
    };

    const getARoom = async (objKey, objValue) => {
		try {
            const key = `${APPLICATION_ID}_rooms`;
            const rooms = await container.vcrInstanceState.get(key);
            let room = null;

            rooms.forEach((r) => {
                if (r[objKey] === objValue) {
                    room = r;
                }
            });
            
			return Promise.resolve(room);
		} catch (error) {
			return Promise.reject(error);
		}
    };
    
    const addOrUpdateRoom = async (objKey=null, objValue=null, apiKey, roomUuid, lvn, vonageAppId) => {
		try {
            const key = `${APPLICATION_ID}_rooms`;
            let rooms = await container.vcrInstanceState.get(key);
            let room = null;

            console.log("rooms", rooms);
            if (!rooms) {
                rooms = [];
            }

            if (objKey && objValue) {
                rooms.forEach((r) => {
                    if (r[objKey] === objValue) {
                        if (apiKey)      r.apiKey = apiKey;
                        if (roomUuid)    r.roomUuid = roomUuid;
                        if (lvn)         r.lvn = lvn;
                        if (vonageAppId) r.vonageAppId = vonageAppId;
                        r.updatedAt = new Date().toISOString();
                        room = r;

                        console.log("addOrUpdateRoom ::: room 1");
                    }
                });
            }

            if (!room) {
                room = {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                if (apiKey)      room.apiKey = apiKey;
                if (roomUuid)    room.roomUuid = roomUuid;
                if (lvn)         room.lvn = lvn;
                if (vonageAppId) room.vonageAppId = vonageAppId;
                rooms.unshift(room);

                console.log("addOrUpdateRoom ::: room 2");
            }

            await container.vcrInstanceState.set(key, rooms);
            console.log("addOrUpdateRoom ::: room saved to vcr instance state", room);
            
			return Promise.resolve(room);
		} catch (error) {
			return Promise.reject(error);
		}
    };

    const clear = async () => {
		try {
            const key = `${APPLICATION_ID}_rooms`;
            await container.vcrInstanceState.set(key, []);
            
			return Promise.resolve([]);
		} catch (error) {
			return Promise.reject(error);
		}
    };

	
    return {
        getRooms,
        getARoom,
        
        addOrUpdateRoom,

        clear,
    };
};
  