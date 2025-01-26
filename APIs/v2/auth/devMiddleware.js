const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleWare = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send({message:'Unauthorized', error:true});
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).send({message:'Unauthorized', error:true});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).send({message:'Unauthorized', error:true});
        }
        if (decoded.role !== 'dev') {
            return res.status(401).send({message:'Unauthorized', error:true});
        }
        if (!decoded.username) {
            return res.status(401).send({message:'Unauthorized', error:true});
        }
        req.username = decoded.username;
        next();
    } catch (e) {
        console.error(e);
        res.status(401).send({message:'Unauthorized', error:true});
    }
}

module.exports = authMiddleWare;