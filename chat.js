import LoginWindow from './ui/loginWindow.js';
import MainWindow from './ui/mainWindow.js';
import UserName from './ui/userName.js';
import UserList from './ui/userList.js';
import MessageList from './ui/messageList.js';
import MessageSender from './ui/messageSender.js';
import WSClient from './WSClient.js';
import UserPhoto from './ui/userPhoto.js';

export default class Chat {
  constructor() {
    this.WSClient = new WSClient(
      `ws://${location.host}/projectFinaly/ws`,
      this.onMessage.bind(this)
    );

    this.ui = {
      loginWindow: new LoginWindow(
        document.querySelector('#login'),
        this.onLogin.bind(this)
      ),
      mainWindow: new MainWindow(document.querySelector('#main')),
      userName: new UserName(document.querySelector('[data-role=user-name]')),
      userList: new UserList(document.querySelector('[data-role=user-list]')),
      messageList: new MessageList(document.querySelector('[data-role=messages-list]')),
      messageSender: new MessageSender(document.querySelector('[data-role=message-sender]'),
      this.onSend.bind(this)),
      userPhoto: new UserPhoto(document.querySelector('[data-role=user-photo]'),
      this.onUpload.bind(this)),
    };

    this.ui.loginWindow.show();
  }

  onUpload(data) {
    this.ui.userPhoto.set(data);
    fetch('/projectFinaly/upload-photo', {
      method: 'post',
      body: JSON.stringify({
        name: this.ui.userName.get(),
        image:data
      })
    });
  }

  onSend(message) {
    this.WSClient.sendTextMessage(message);
    this.ui.messageSender.clear();
  }

  async onLogin(name) {
    await this.WSClient.connect();
    this.WSClient.sendHello(name);
    this.ui.loginWindow.hide();
    this.ui.mainWindow.show();
    this.ui.userName.set(name);
    this.ui.userPhoto.set(`/projectFinaly/image/photoUser/${data.name}.png?t=${Date.now()}`);
  }

  onMessage({type, from, data}) {
    console.log(type, from, data);

    if (type === 'hello') {
      this.ui.userList.add(from);
      this.ui.messageList.addSystemMessage(`${from} пшол сюда`);
    } else if (type === 'user-list') {
      for (const item of data) {
        this.ui.userList.add(item);
      }
    } else if (type === 'bye') {
      this.ui.userList.remove(from);
      this.ui.messageList.addSystemMessage(`${from} пшол отсюда`);
    } else if (type === 'text-message') {
      this.ui.messageList.add(from, data.message);
    } else if (type === 'photo-changed') {
      const avatars = document.querySelectorAll(`[data-role=user-avatar][data-user=${data.name}]`);
      for (const avatar of avatars) {
        avatar.style.backgroundImage = `url(/projectFinaly/image/photoUser/${
          data.name
        }.png?t=${Date.now()})`;
      }
    }
  }
}