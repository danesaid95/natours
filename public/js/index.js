/*eslint-disable */
import { login, logout } from './login';
import { bookTour } from './stripe';
import { displayMap } from './mapbox';
import { updateData, updateUserPassword } from './updateSettings';

console.log('it works!');

//dom elements
const mapEl = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const updateForm = document.querySelector('.btn--settings');
const updatePass = document.querySelector('.btn--pass');
const logoutBtn = document.querySelector('.nav__el--logout');
const tourid = document.getElementById('book-tour');

//delegation
if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (updateForm) {
  updateForm.addEventListener('click', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateData(form, 'Data');
  });
}
if (updatePass) {
  updatePass.addEventListener('click', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--pass').textContent = 'Updating....';
    const password = document.getElementById('password-current').value;
    const updatePassword = document.getElementById('password').value;
    const confirmUpdatePassword =
      document.getElementById('password-confirm').value;
    await updateUserPassword(password, updatePassword, confirmUpdatePassword);
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--pass').textContent = 'SAVE PASSWORD';
  });
}

if (tourid) {
  tourid.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const tourId = tourid.dataset.tourId;
    bookTour(tourId);
  });
}
