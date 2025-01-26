const router = require('express').Router();
const express = require('express');
const jwt = require('jsonwebtoken');
const { Users } = require('../../../db/index.js');
const bcrypt = require('bcryptjs');
router.use(express.json());

const dotenv = require('dotenv');
dotenv.config();


// login
router.post('/login', async (req, res) => {
    // console.log(req);
    const { username, password } = req.body;
    try {
        // verify if the user exists
        const user = await Users.findOne(
            {
                username:{ $eq: username }
            }
        );
        if (!user) {
            return res.send({ message: "Invalid Username or Password", error:true })
        }

        // verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.send({ message: "Invalid Username or Password", error:true })
        }

        const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET);
        return res.send({ message: "Logged in successfully", token: token, username: user.username, role: user.role });
    } catch (err) {
        console.log(err);
        return res.send({ message: "Error", error:true })
    }
})

// verify
router.post('/verify', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.send({ message: "Unauthorized", error:true })
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.send({ message: "Unauthorized", error:true })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.send({ message: "Invalid Token", error:true })
        }
        return res.send({ message: "Valid Token",token:token, username: decoded.username, role: decoded.role, error:false });
    } catch (err) {
        console.log(err);
        return res.send({ message: "Error", error:true })
    }
})

module.exports = router;