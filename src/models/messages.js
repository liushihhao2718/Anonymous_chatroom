//@ts-check
const Firebase = require("../utils/firebase");


/**
 * 
 * @param {string} from
 * @param {string} text 
 * @returns 
 */
const serverMessage = (from, text) => {

  return {
    user: from,
    text,
    timestamp: Date.now()
  }
};

/**
 * 
 * @param {import("../utils/firebase").User} user 
 * @param {string} text 
 * @returns 
 */
const userMessage = async (user, text) => {

  return await Firebase.saveMessage(user, text)
};

const generateLocationMessage = (userName, location) => {
  return {
    userName,
    url: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
    createdAt: new Date().getTime(),
  };
};

const getHistory = async (user, last) => {
  return await Firebase.getMessage(user, last)
}

module.exports = { serverMessage, userMessage, getHistory, generateLocationMessage };
