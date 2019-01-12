'use strict'

let trs = document.getElementsByClassName('content-tbody-tr');
for (let i = 0; i < trs.length; i++) {
  trs[i].addEventListener('click', function () {
    // 開啟新分頁
    let href = trs[i].getAttribute('data-href');
    if (href !== null) {
      window.open(href);
    }
  });
}

// Dialog
let overlay = document.getElementsByClassName('overlay');
// Dialog event
let popupclose = document.getElementById('popupclose');
let popupcancel = document.getElementById('popupcancel');
if (popupclose !== null && popupcancel !== null) {
  popupclose.addEventListener('click', hidePopup);
  popupcancel.addEventListener('click', hidePopup);
}

function hidePopup() {
  overlay[0].style.visibility = 'hidden';
  overlay[0].style.opacity = 0;
}

// Delete Data
let dataDeletes = document.getElementsByClassName('dataDelete');
for (let i = 0; i < dataDeletes.length; i++) {
  dataDeletes[i].addEventListener('click', (event) => {
    // 防止子元素觸發時一併觸發父元素
    // https://www.w3schools.com/jsref/event_stoppropagation.asp
    event.stopPropagation();

    let type = dataDeletes[i].getAttribute('data-type');
    let id = dataDeletes[i].getAttribute('data-id');
    let title = dataDeletes[i].getAttribute('data-title');
    let category = dataDeletes[i].getAttribute('data-category');
    let page = dataDeletes[i].getAttribute('data-page');

    // Show Dialog
    overlay[0].style.visibility = 'visible';
    overlay[0].style.opacity = 1;
    let popupmessage = document.getElementById('popupmessage');
    popupmessage.innerText = `即將刪除「${title}」資訊！`;

    if (category === 'news') {
      popupmessage.innerText = `目前無法刪除「${title}」資訊！`;
      return;
    }

    let popupdone = document.getElementById('popupdone');
    popupdone.addEventListener('click', () => {
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          //console.log('Data', this.responseText);
          let data = JSON.parse(this.responseText);
          if (data.status) {
            window.location.replace(`/v1/${type}/search?category=${category}&page=${(parseInt(page)+1)}`);
          } else {
            alert(data.message);
          }
        }
      };
      xhttp.open('DELETE', `/v1/${type}/delete/${id}`, true);
      xhttp.send();
    });

    /*if (confirm(msg)) {
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log('Data', this.responseText);
          let data = JSON.parse(this.responseText);
          if (data.status) {
            window.location.replace(`/v1/films/search?category=${category}&page=${(parseInt(page)+1)}`);
          } else {
            alert(data.message);
          }
        }
      };
      xhttp.open('DELETE', `/v1/${type}/delete/${id}`, true);
      xhttp.send();
    }*/
  });
}
// Edit Data
let dataEdits = document.getElementsByClassName('dataEdit');
for (let i = 0; i < dataEdits.length; i++) {
  dataEdits[i].addEventListener('click', (event) => {
    event.stopPropagation();

    let type = dataEdits[i].getAttribute('data-type');
    let id = dataEdits[i].getAttribute('data-id');
    window.location.href = `/v1/${type}/edit/${id}`;
  });
}

// cookies
let map = new Map();
decodeCookies();

let sectionFilms = document.getElementById('sectionFilms');
let isExpands = map.get('isExpands') == 'true';
sectionFilms.addEventListener('click', function () {
  expandsDrawer(true);
});

expandsDrawer(false);

// or u can use this
// <tr onclick="goArticle(this)" data-href="google.com"></tr>
/*function goArticle(e) {
  console.log('link --> ', e.getAttribute('data-href'));
}*/

let sectionNews = document.getElementById('sectionNews');
sectionNews.addEventListener('click', function () {
  console.log(`click --> ${sectionNews}`);
  window.location.href = '/v1/news/search?page=1';
});

let sectionTriggers = document.getElementById('sectionTriggers');
sectionTriggers.addEventListener('click', function () {
  window.location.href = '/v1/triggers/search?page=1';
});

let sectionLogout = document.getElementById('sectionLogout');
sectionLogout.addEventListener('click', function () {
  console.log(`click --> ${sectionLogout}`);
  window.location.replace('/');
});

// Scroll To Tap
window.onscroll = function () {
  if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
    document.getElementById("scrollImage").style.display = "block";
  } else {
    document.getElementById("scrollImage").style.display = "none";
  }
};

document.getElementById('scrollImage').addEventListener('click', function () {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});

function decodeCookies() {
  let values = decodeURIComponent(document.cookie).split(';');
  for (let i = 0; i < values.length; i++) {
    let key = values[i].split('=')[0].trim();
    let value = values[i].split('=')[1];
    map.set(key, value);
    //console.log('decodeCookies', key, value);
  }
}

function expandsDrawer(isClick) {
  let arrowImg = document.getElementById('arrowImage');
  let childs = document.getElementsByClassName('drawer-list-child');
  //console.log('Expands before', isExpands);
  if (isClick) {
    isExpands = !isExpands;
    document.cookie = 'isExpands=' + String(isExpands);
  }
  //console.log('Expands after', isExpands);
  for (let j = 0; j < childs.length; j++) {
    //let display = window.getComputedStyle(childs[j]).getPropertyValue('display');
    //console.log('display', display);
    childs[j].style.display = isExpands ? 'block' : 'none';
    arrowImg.setAttribute('src', isExpands ? '/images/arrow_up.svg' : '/images/arrow_down.svg');
  }
}