// console.log("process.env", process.env, "\n");

import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import http from 'http';
import qs from 'qs';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import { neru, State } from 'neru-alpha';

import Application from '../service/application.js';
import Numbers from '../service/numbers.js';
import Rooms from '../service/rooms.js';
import Vapi from '../service/vapi.js';

import config from './config.js';
// console.log("config", config, "\n");

const __dirname = fileURLToPath(import.meta.url);
const homeDir = join(__dirname, '..', '..');
const publicDir = join(homeDir, 'public');
// console.log({publicDir});
// const tokenFilePath = join(homeDir, 'db/token.json');

const container = {};

// Configs
container.config = config;

// // External
container.path = path;
container.express = express;
container.axios = axios;
container.uuidv4 = uuidv4;
container.qs = qs;
container.cookieParser = cookieParser;

// Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server);
container.app = app;
container.server = server;
container.io = io;

// Neru storage
const state = neru.getInstanceState();
container.vcrInstanceState = state;

// // Lowdb
// const dbAdapter = new JSONFile(dbFilePath);
// const dbDefaultData = { "new": true };
// const db = new Low(dbAdapter, dbDefaultData);
// container.db = db;

// const tokenAdapter = new JSONFile(tokenFilePath);
// const tokenDefaultData = {};
// const token = new Low(tokenAdapter, tokenDefaultData);
// container.token = token;

// Directories
container.homeDir = homeDir;
container.publicDir = publicDir;

// Internal
container.applicationService = Application(container);
container.numbersService = Numbers(container);
container.roomsService = Rooms(container);
container.vapiService = Vapi(container);

// // Get some initial data
// await token.read();
// if (JSON.stringify(token.data) !== "{}") {
//     console.log("Token exists. Fetching data...");
//     await container.initService.getWhatsAppChannel();
//     await container.initService.populateTemplates();
// } else {
//     console.error("WARNING: Token doesn't exist! Need to login to Jumper!");
// }

// const key = `${config.APPLICATION_ID}_rooms`;
// await container.vcrInstanceState.set(key, null);

export default container;