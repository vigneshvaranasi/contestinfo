const router = require('express').Router();
const express = require('express');

const {Users} = require('../../../db/index.js');
const bcrypt = require('bcryptjs');
router.use(express.json());
// Middleware - TODO

const devMiddleware = require('../auth/devMiddleware.js');
router.use(devMiddleware);

// add user
router.post('/newAdmin', async (req,res)=>{
    try{
        const body = await req.body;
        const {username, password, role} = body;
        console.log('username, password, role: ', username, password, role);

        // verify username
        const existingUser = await Users.findOne({
            username:{ $eq: username}
        })
        if(existingUser){
            return res.send({error:true, message:"User already exists"});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Users.create({
            username,
            password: hashedPassword,
            role
        });
        res.send({message:"User created successfully", error:false});
    }catch(e){
        console.error(e);
        res.send({error:true, message:e.message});
    }
})


module.exports = router;