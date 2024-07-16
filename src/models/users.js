//@ts-check
const Firebase = require("../utils/firebase.js");


const addUser = async ({ id, nickname, room }) => {
  // Data cleaning
  nickname = nickname.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Data validation
  if (!nickname || !room) {
    return {
      error: 'nickname and room required',
    };
  }

  // Check user exists
  const existingUser = await Firebase.getUserByNickName(nickname);

  if (existingUser) {
    return { error: 'User already exists!' };
  }

  const user = { id, nickname, room };

  await Firebase.addUser({
    nickname
  })
};

const removeUser = (id) => {
  //TODO: impliment remove user.
};


/**
 * 
 * @param {string} id 
 * @returns 
 */
const getUser = async (id) => {
  return await Firebase.getUser(id);
};


const getAllUser = async () => {
  return await Firebase.getAllUser()
}
/**
 * 
 * @param {string} room_id 
 * @returns 
 */
const getUsersInRoom = async (room_id) => {
  return await Firebase.getUsersInRoom(room_id)
};


const getUserByNickName = async (nickname) => {
  return await Firebase.getUserByNickName(nickname);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getAllUser,
  getUsersInRoom,
  getUserByNickName,
};
