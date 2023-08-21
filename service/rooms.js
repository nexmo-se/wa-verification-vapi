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
    
    const addOrUpdateRoom = async (objKey=null, objValue=null, apiKey, apiSecret, roomUuid, lvn, vonageAppId) => {
		try {
            const key = `${APPLICATION_ID}_rooms`;
            let rooms = await container.vcrInstanceState.get(key);
            let room = null;

            // console.log("rooms", rooms);
            if (!rooms) {
                rooms = [];
            }

            if (objKey && objValue) {
                rooms.forEach((r) => {
                    if (r[objKey] === objValue) {
                        if (apiKey)      r.apiKey = apiKey;
                        if (apiSecret)   r.apiSecret = apiSecret;
                        if (roomUuid)    r.roomUuid = roomUuid;
                        if (lvn)         r.lvn = lvn;
                        if (vonageAppId) r.vonageAppId = vonageAppId;
                        r.updatedAt = new Date().toISOString();
                        room = r;
                    }
                });
            }

            if (!room) {
                room = {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                if (apiKey)      room.apiKey = apiKey;
                if (apiSecret)   room.apiSecret = apiSecret;
                if (roomUuid)    room.roomUuid = roomUuid;
                if (lvn)         room.lvn = lvn;
                if (vonageAppId) room.vonageAppId = vonageAppId;
                rooms.unshift(room);
            }

            await container.vcrInstanceState.set(key, rooms);
            console.log("addOrUpdateRoom ::: room saved to vcr instance state", JSON.stringify(room));
            
			return Promise.resolve(room);
		} catch (error) {
			return Promise.reject(error);
		}
    };

    const remove = async (objKey=null, objValue=null) => {
		try {
            const key = `${APPLICATION_ID}_rooms`;
            let rooms = await container.vcrInstanceState.get(key);
            let room = null;

            // console.log("rooms", rooms);
            if (!rooms) {
                rooms = [];
            }

            let index = -1;
            if (objKey && objValue) {
                rooms.forEach((r, i) => {
                    if (r[objKey] === objValue) {
                        index = i;
                        room = r;
                    }
                });
            }

            if (index > -1) {
                rooms.splice(index, 1);
                await container.vcrInstanceState.set(key, rooms);

                console.log(`remove ::: room ${room.roomUuid} removed`);
            }

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

        remove,
        clear,
    };
};
  