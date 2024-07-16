//@ts-check
const socket = io();

// Elements
const $messageForm = document.querySelector('#messageForm');

if (!$messageForm) throw Error('no #messageForm');
const $messaageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

if (!$messageFormButton) throw Error('#messageFormButton')

const $messages = document.querySelector('#messages');
if (!$messages || !($messages instanceof HTMLElement)) throw Error('no #messages');

const $sidebar = document.querySelector('#sidebar');

// Template
const messageTemplate = document.querySelector('#message-template')?.innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template',
)?.innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template')?.innerHTML;

// Options
const { nickname, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  /**
   * @type {HTMLElement }
   */
  const $newMessage = $messages.lastElementChild;

  if (!$newMessage || !($newMessage instanceof HTMLElement)) return;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    nickname: message.nickname,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('history', (history)=>{
  
})

socket.on('roomData', ({ room, users }) => {
  // const html = Mustache.render(sidebarTemplate, { room, users });
  // document.querySelector('#sidebar')?.innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target?.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');

    if ($messaageFormInput instanceof HTMLInputElement) {
      $messaageFormInput.value = '';
      $messaageFormInput.focus();
    }


    // Acknowledgement
    if (error) {
      return console.log(error);
    }
  });
});

socket.emit('join', { nickname, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
