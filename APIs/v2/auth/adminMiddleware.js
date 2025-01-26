const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleWare = async (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).send('Unauthorized');
        }
        const token = authHeader.split(' ')[1];
        if(!token){
            return res.status(401).send('Unauthorized');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).send('Unauthorized');
        }
        if(decoded.role !== 'dev' && decoded.role !== 'admin'){
            return res.status(401).send('Unauthorized');
        }
        if(!decoded.username){
            return res.status(401).send('Unauthorized');
        }
        req.username = decoded.username;
        next();
    }catch(e){
        console.error(e);
        res.status(401).send('Unauthorized');

    }
}

module.exports = authMiddleWare;