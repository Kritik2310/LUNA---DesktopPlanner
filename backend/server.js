require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.use(cors());

app.get('/login', (req,res) => {
    const scope = 'user-read-private user-read-email playlist-read-private';
    const authURL = `https://accounts.spotify.com/authorize`
})