let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
const {OAuth2Client} = require('google-auth-library');

let {Mutex} = require("async-mutex");

let config = require('../config/config');
let UserModel = require('../models/UserModel.js');
let GoogleLoginModel = require("../models/GoogleLoginModel");

const CLIENTID = process.env.GOOGLE_OAUTH2_CLIENTID;
const client = new OAuth2Client(CLIENTID);

const lock = new Mutex();

// let sync = require('synchronize');
// let fiber = sync.fiber;
// let await = sync.await;
// let defer = sync.defer;

module.exports = {
    verifyGoogleToken: async function (token) {
        let ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENTID
        }).catch(() => {});

        if(ticket){
            let user;
            try{
                user = await GoogleLoginModel.findOne({googleId: ticket.payload["sub"]});
            }catch(err){}

            if(!user){
                let release = await lock.acquire();
                try{
                    user = await GoogleLoginModel.findOne({email: ticket.payload["email"]});
                    await user.update({googleId: ticket.payload["sub"]});
                }catch(err){
                    user = await GoogleLoginModel.create({
                        email: ticket.payload["email"],
                        googleId: ticket.payload["sub"]
                    });
                }
                release();
            }

            return user._id;
        }

        return false;
    },
    isAdmin: async function (token) {
        let isUserAdmin = false;
        if (!token) {
            return false;
        }

        await jwt.verify(token, config.secret, async function (err, decoded) {
            if (err) {
                console.log('Token verification error');
                return;
            }

            await UserModel.findById(decoded.id, { password: 0 }, function (err, user) {
                if (err) {
                    console.log('User lookup error');
                    return;
                }
                if (!user) {
                    console.log('No user found error');
                    return;
                }
                if (user.admin) {
                    isUserAdmin = true;
                    //console.log('return val  ' + isUserAdmin)
                    return;

                }
            });
        });
        return isUserAdmin;
        //console.log('return val ' + isUserAdmin)
        //return isUserAdmin;
    }

};