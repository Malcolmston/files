class Table {
    constructor(home) {
      this.table = document.createElement("table");
      this.home = home || document.body;

      this.array = [];
    }

    createHead(...rows) {
      let tr = document.createElement("tr");
      rows.forEach(function (r) {
        let th = document.createElement("th");
        let t = document.createTextNode(r);
        th.append(t);
        tr.append(th);
      });

      this.table.append(tr);
    }

    createRow(url, row) {
      if (url !== false) {
        let img = document.createElement("img");

        let tr = document.createElement("tr");

        //row.unshift(mine)

        img.src = url;

        let td = document.createElement("td");
        td.append(img);
        tr.append(td);

        img.addEventListener("click", function (params) {
          document.getElementById("Name2").value = row[0];
          document.getElementById("file").submit();
        });

        this.array.push( row )
        row.forEach(function (r, x) {
          let td = document.createElement("td");

          let t = document.createTextNode(r);
          td.append(t);
          tr.append(td);
        });

        this.table.append(tr);
      } else {
        let tr = document.createElement("tr");

        //row.unshift(mine)

        row.forEach(function (r, x) {
          let td = document.createElement("td");

          let t = document.createTextNode(r);
          td.append(t);
          tr.append(td);
        });

        this.table.append(tr);
      }
    }

    doc() {
      this.home.append(this.table);
    }

    remove() {
      this.table.remove();
    }
  }

  const filesDataIN = [];
  var table = new Table(document.getElementById("place"));

  const allFiles = new Table( document.getElementById('allFiles') )


function codes(e) {
    //https://sweetalert2.github.io/#methods

    var Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    switch (e) {
      case 100:
      case "no files":
        Toast.fire({
          icon: "error",
          title: "you must select a file",
        });
        break;
      case 200: 
      case "repeat":
        Toast.fire({
          icon: "info",
          title: "you already have a file with the same name", 
        });
        break;
        case 400:
      case "success":
        Toast.fire({
          icon: "success",
          title: "success",
        });
        break;
    }
}
  /*
https://codepen.io/dcode-software/pen/xxwpLQo?editors=1010

for styling and html
*/

  function readfiles(files) {
    file.files = files;

    console.log(files);
    let p = new Table(document.querySelector("#formFile"));

    p.createHead("name", "mine type");

    p.remove();


    for (let i = 0; i < files.length; i++) {
      //console.log( files[i] )
      p.createRow(false, [files[i].name, files[i].type]);
    }

    p.doc();

  }

  document.querySelector("#txt").addEventListener("click", function () {
    loadTable()
    file.click();
  });

  function check() {
let arr = []

    for(let i = 0; i <  file.files.length; i++){
      let x = file.files.item(i)

      arr.push( x.name )
    }

  setTimeout(() => {
    document.querySelector('#formFile').innerHTML = ''
   // file.files = {}
  }, 3000);
    
    if (file.files.length == 0) {
      codes(100);
      return false;
    } else if( 
      arr.filter( name => {
    return  table.array.map( x => {return x[0] }).includes(name)
    }).length >=1
     ){

      codes(200);
      return false;
      
    } else {

      codes(400);
          
      return true;
    }
  }

  var holder = document.getElementById("holder");
  var file = document.getElementById("files");

  holder.ondragover = function () {
    loadTable()
    //this.className = "hover";
    return false;
  };
  holder.ondragend = function () {
    loadTable()
    //this.className = "";
    return false;
  };
  holder.ondrop = function (e) {
    loadTable()
    //this.className = "";
    e.preventDefault();
    readfiles(e.dataTransfer.files);
  };

  file.onchange = function (e) {
    loadTable()
    e.preventDefault();
    readfiles(e.target.files);
  };




allFiles.createHead('','name','type')




function loadTable() {
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    var data = ( JSON.parse(this.response) ).all

data.map(function(x){
  let {name, type, url} = x

  if( filesDataIN.includes(name) ){
    return;
  }else{
  filesDataIN.push(name)

  allFiles.createRow(url, [name, type])
  }
  
  allFiles.doc()
})

    //document.getElementById("demo").innerHTML = this.responseText;
  }
 // alert( document.location )

  xhttp.open("GET", `${document.location}/get`);
  //allFiles
  xhttp.send();
}

/*
setInterval(function() {
  loadTable()
},1000)
*/