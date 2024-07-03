const generateMessage = (userName, text) => {
  return { userName, text, createdAt: new Date().getTime() };
};

const generateLocationMessage = (userName, location) => {
  return {
    userName,
    url: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
    createdAt: new Date().getTime(),
  };
};

module.exports = { generateMessage, generateLocationMessage };
