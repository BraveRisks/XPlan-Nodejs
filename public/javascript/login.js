'use strict';

document.getElementById('loginBtn').onclick = login;

function login() {
  let user = document.getElementById('user').value;
  let pass = document.getElementById('pass').value;

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.responseText);
      if (data.status) {
        document.cookie = 'token=' + data.token;
        console.log('Data', data);
        console.log('Cookies', document.cookie);
        window.location.replace(`/v1/films/search?category=1pondo&page=1`);
      } else {
        alert(data.message);
      }
    }
  };

  let requestBody = `user=${user}&pass=${pass}`;
  xhttp.open('POST', '/v1/profile/login', true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.send(requestBody);
  return false;
}

function gotoFilmsPage(token) {
  let xhttp = new XMLHttpRequest();
  /*xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.responseText);
      if (data.status) {
        document.cookie = 'token=' + data.token;
        console.log('Data', data);
        console.log('Cookies', document.cookie)
        window.location.replace('/v1/films?category=1pondo&page=1');
      } else {
        alert(data.message);
      }
    }
  };*/

  xhttp.open('GET', '/v1/films/search?category=1pondo&page=1', true);
  xhttp.setRequestHeader('token', token);
  xhttp.send();
}