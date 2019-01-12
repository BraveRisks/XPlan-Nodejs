'use strict'

let editCancel = document.getElementById('editcancel');
editCancel.addEventListener('click', () => {
  // 回到前一頁
  window.history.back();
});

let editUpdate = document.getElementById('editupdate');
editUpdate.addEventListener('click', () => {
  let type = editUpdate.getAttribute('data-type');
  let id = editUpdate.getAttribute('data-id');
  let category = document.getElementById('category').value;
  let title = document.getElementById('title').value;
  let content = document.getElementById('content').value;
  let date = document.getElementById('date').value;
  let viewcount = document.getElementById('viewcount').value;
  
  //console.log(`category：${category} title：${title} date：${date} viewcount：${viewcount} content：${content}`);
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.responseText);
      //console.log(`data：${JSON.stringify(data)}`);
      if (data.status) {
        if (type === 'films') {
          category = data.category;
        } else {
          content = data.content;
        }
        title = data.title;
        date = data.date;
        viewcount = data.viewCount;
      }
      alert(data.message);
    }
  }
  let requestBody = type === 'films' ? `category=${category}` : `content=${content}`;
  requestBody += `&title=${title}&date=${date}&viewCount=${viewcount}`;
  //console.log(`requestBody --> ${requestBody}`);
  xhttp.open('POST', `/v1/${type}/update/${id}`, true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.send(requestBody);
});