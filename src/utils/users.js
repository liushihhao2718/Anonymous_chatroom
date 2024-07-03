const users = [];

const addUser = ({ id, userName, room }) => {
  // Data cleaning
  userName = userName.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Data validation
  if (!userName || !room) {
    return {
      error: 'Username and room required',
    };
  }

  // Check user exists
  const existingUser = users.find((user) => {
    return user.userName === userName && user.room === room;
  });

  if (existingUser) {
    return { error: 'User already exists!' };
  }

  const user = { id, userName, room };
  users.push(user);
  return { user };
};

// Remove user
const removeUser = (id) => {
  const index = users.find((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Get user
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

// Get users in room
const getUsersInRoom = (room) => {
  room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,

  users
};
