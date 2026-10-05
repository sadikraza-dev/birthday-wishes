const pages = [...document.querySelectorAll('.page')];
let cameraStream = null;
const groupFeeling = document.querySelector('#groupFeeling');
const answerSaveStatus = document.querySelector('#answerSaveStatus');
const answerStorageKey = 'khushi-birthday-group-answer';

try {
  groupFeeling.value = localStorage.getItem(answerStorageKey) || '';
} catch {
  answerSaveStatus.textContent = 'Automatic saving is unavailable in this browser.';
}

groupFeeling.addEventListener('input', () => {
  try {
    localStorage.setItem(answerStorageKey, groupFeeling.value);
    answerSaveStatus.textContent = 'Saved automatically ✓';
  } catch {
    answerSaveStatus.textContent = 'Could not save here. Your answer will stay until this page closes.';
  }
});

function showPage(id) {
  if (id !== 'page3') stopCamera();
  for (const page of pages) {
    const isActive = page.id === id;
    page.classList.toggle('active', isActive);
    page.hidden = !isActive;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-next]').forEach((button) => {
  button.addEventListener('click', () => {
    showPage(button.dataset.next);
    if (button.id === 'openSurpriseButton') startBirthdayMusic();
  });
});
document.querySelectorAll('[data-back]').forEach((button) => {
  button.addEventListener('click', () => showPage(button.dataset.back));
});
document.querySelector('#replayButton').addEventListener('click', () => showPage('page1'));

function startBirthdayMusic() {
  const player = document.querySelector('#musicPlayer');
  const audio = document.querySelector('#birthdayAudio');
  const message = document.querySelector('#musicMessage');
  player.hidden = false;
  audio.play().then(() => { message.textContent = 'Now playing 🎶'; }).catch(() => {
    message.textContent = 'Tap play on the audio controls to start the music.';
  });
}

const moonButton = document.querySelector('#moonButton');
const cameraPanel = document.querySelector('#cameraPanel');
const cameraPreview = document.querySelector('#cameraPreview');
const cameraMessage = document.querySelector('#cameraMessage');
moonButton.addEventListener('click', async () => {
  document.querySelector('#moonReveal').classList.add('show');
  moonButton.textContent = 'Moon unlocked ☾';
  cameraPanel.hidden = false;
  cameraMessage.textContent = 'Asking for camera permission…';
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraPreview.hidden = true;
    cameraMessage.textContent = 'Camera access is unavailable here. Open this page on localhost or a secure website, then try again.';
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    cameraPreview.srcObject = cameraStream;
    cameraPreview.hidden = false;
    cameraMessage.textContent = 'Your camera is on. Say hi! 📸';
  } catch (error) {
    cameraPreview.hidden = true;
    cameraMessage.textContent = error.name === 'NotAllowedError'
      ? 'Camera permission was blocked. Allow camera access in your browser and click the moon button again.'
      : 'Could not open the camera. Check that a camera is connected, then try again.';
  }
});
document.querySelector('#cameraClose').addEventListener('click', stopCamera);

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  cameraPreview.srcObject = null;
  cameraPanel.hidden = true;
}

const photoInput = document.querySelector('#photoInput');
const gallery = document.querySelector('#gallery');
photoInput.addEventListener('change', (event) => {
  const files = [...event.target.files].filter((file) => file.type.startsWith('image/'));
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const card = document.createElement('div');
    card.className = 'photo-card';
    const image = document.createElement('img');
    image.src = url;
    image.alt = file.name.replace(/\.[^.]+$/, '') || 'Birthday memory';
    const remove = document.createElement('button');
    remove.className = 'remove-photo';
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove ${image.alt}`);
    remove.addEventListener('click', () => {
      URL.revokeObjectURL(url);
      card.remove();
    });
    card.append(image, remove);
    gallery.append(card);
  }
  photoInput.value = '';
});

window.addEventListener('beforeunload', () => {
  stopCamera();
  gallery.querySelectorAll('img').forEach((image) => URL.revokeObjectURL(image.src));
});
