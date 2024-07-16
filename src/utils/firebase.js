//@ts-check
require('dotenv').config()

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const serviceAccount = require('../../testapi-1598190330536-firebase-adminsdk-3vne2-909e500c6c.json');
const ErrorCodes = require('./ErrorCodes');

initializeApp({
  // @ts-ignore
  credential: cert(serviceAccount)
});
const db = getFirestore();


/**
 * @typedef User
 * @property {string} id
 * @property {string} nickname
 * @property {string?} room
 */


/**
 * @typedef {Omit<User, "id"|"room">} CreateUser
 */
/**
 * 
 * @param {CreateUser} user 
 */
module.exports.addUser = async function addUser(user) {

  const exist = await db.collection('users').where("nickname", '==', user.nickname).get();
  if (!exist.empty) {
    throw new Error(ErrorCodes.DUPLICATE_NICKNAME)
  }
  const new_user = await db.collection('users').add({
    nickname: user.nickname
  });
}

/**
 * 
 * @param {string} user_id 
 * @returns {Promise<User | undefined>}
 */
module.exports.getUser = async function getUser(user_id) {
  const user = await db.collection('users').doc(user_id).get()

  console.log('getUser', user.data())
  // @ts-ignore
  return { id: user.id, ...user.data() };
}

/**
 * 
 * @param {string} nickname 
 * @returns {Promise<User | undefined>}
 */
module.exports.getUserByNickName = async function getUserByNickName(nickname) {

  console.log('nickname', nickname)
  const query_result = await db.collection('users').where('nickname', '==', nickname).get();

  const users = [];
  query_result.forEach(user => {
    users.push({ id: user.id, ...user.data() });
  });

  return users[0];
}


/**
 * 
 * @returns {Promise<User[]>}
 */
module.exports.getAllUser = async function () {
  const query_result = await db.collection('users').get();

  const users = [];
  query_result.forEach(user => {
    users.push({ id: user.id, ...user.data() });
  });

  return users;
}

/**
 * 
 * @param {string} room_id 
 */
module.exports.getUsersInRoom = async function getUsersInRoom(room_id) {
  const query_result = await db.collection('users').where('room', '==', room_id).get();
  const users = [];
  query_result.forEach(user => {
    users.push({ id: user.id, ...user.data() });
  });
  return users;
}

/**
 * 
 * @param {User["id"]} user_id
 * @param {string} room_id 
 */
module.exports.setRole = async function setRole(user_id, room_id) {

  await db.collection('users').doc(user_id).set({
    room: room_id,
  }, { merge: true })

}

/**
 * 
 * @param {User} user 
 * @param {number} last
 */
module.exports.getMessage = async function getMessage(user, last = Date.now()) {
  if (!user.room) {
    throw new Error(ErrorCodes.USER_NOT_SET_ROOM)
  }
  const messages = await db.collection('room').doc(user.room)
    .collection('message').orderBy('timestamp', 'desc')
    .startAfter(Timestamp.fromMillis(last)).limit(10).get()

  return messages.docs.map(x => x.data())
}

/**
 * 
 * @param {User} user
 * @param {string} message 
 */
module.exports.saveMessage = async function saveMessage(user, message) {

  if (!user.room) {
    throw new Error(ErrorCodes.USER_NOT_SET_ROOM)
  }
  await db.collection('room').doc(user.room)
    .collection('message').add({
      user: user.id,
      text: message,
      timestamp: FieldValue.serverTimestamp()
    })

  return {
    user: user.nickname,
    text: message,
    timestamp: Date.now()
  }
}

// async function get() {
//   const r1 = await db.collection('room').doc('r1').get()
//   console.log(r1.data())
// }

// async function set() {
//   const docRef = db.collection('room').doc('r1');
//   await docRef.set(
//     {
//       message: [
//         {
//           user: '1',
//           text: 'hi'
//         },
//         {
//           user: '2',
//           text: 'hello'
//         }
//       ]
//     }
//   );
// }
