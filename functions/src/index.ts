/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// this is our "serverless backend" 

// import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin"

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// this will boot up our app onto the server
admin.initializeApp();
// below is our db instance that we can actually access
const db = admin.firestore();

// this is our actual function that we are defining below here in order
// to get the information that we need about the users into the db
export const createUserDocument = functions.auth
    .user() // gets the user auth
    .onCreate(async (user) => { // when user is created
        db.collection("users") // we go into the users collection
        .doc(user.uid) // get or make a doc with this user id
        .set(JSON.parse(JSON.stringify(user))); // then set it to the actual text of user info
    }); // if we do not do this JSON stuff we get a 'serialization error'


    

// AFTER WE MAKE OUR FUNCTIONS WE ALWAYS NEED TO DEPLOY FROM TERMINAL 
// firebase deploy --only functions