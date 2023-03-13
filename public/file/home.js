Date.prototype.mdy = function () {
  return (
    (this.getMonth().toString().length == 1
      ? 0 + "" + (this.getMonth() + 1)
      : this.getMonth() + 1) +
    "/" +
    (this.getDay().toString().length == 1
      ? 0 + "" + (this.getDay() + 1)
      : this.getDay() + 1) +
    "/" +
    this.getFullYear()
  );
};

Array.prototype.chunk = function (perChunk) {
  //https://stackoverflow.com/questions/8495687/split-array-into-chunks
  return this.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
};

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

      this.array.push(row);
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

class Feters {
  constructor() {
    this.data = fetch(`http://localhost:3000/admin/allData`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        username: "Malcolm",
      }), // body data type must match "Content-Type" header), // body data type must match "Content-Type" header
    });
    this.home = document.querySelector(".tableData");
    this.table = new Table(this.home);
  }

  async dbUsername(value) {
    let a = await Swal.fire({
      title: "Select a input",
      input: "select",
      inputOptions: {
        deleting: {
          hard: "perminitly remove",
          soft: "softly remove",
          restore: "restore acount",
          update: "update username",
        },
      },
      inputPlaceholder: false,
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          resolve();
        });
      },
    });

    if (a) {
      if (a.value == "hard") {
        return await this.hardRemove(value);
      }
      if (a.value == "soft") {
        return await this.softRemove(value);
      }

      if (a.value == "restore") {
        return await this.restore(value);
      }
      if (a.value == "update") {
        const { value: username } = await Swal.fire({
          title: "Enter a new username",
          input: "text",
          inputLabel: "New username",
          inputPlaceholder: "Enter your new username",
          inputAttributes: {
            autocapitalize: "off",
            autocorrect: "off",
          },
        });

        if (username) {
          return await this.updateUsername(value, username);
        }
      }
      return a;
    }
  }

  async dbPassword(value) {
    let a = await Swal.fire({
      title: "Select a input",
      input: "select",
      inputOptions: {
        password: "update password",
      },
      inputPlaceholder: false,
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          resolve();
        });
      },
    });

    if (a) {
      if (a.value == "password") {
        const { value: password } = await Swal.fire({
          title: "Enter a new password",
          input: "password",
          inputLabel: "New password",
          inputPlaceholder: "Enter a new password",
          inputAttributes: {
            autocapitalize: "off",
            autocorrect: "off",
          },
        });

        if (password) {
          return await this.updatePassword(password);
        }
      }
    }
  }

  async dbType() {
    let a = await Swal.fire({
      title: "Select a input",
      input: "select",
      inputOptions: {
        "set type": { admin: "admin", basic: "basic" },
      },
      inputPlaceholder: false,
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          resolve();
        });
      },
    });

    if (a) {
      return a;
    }
  }

  check(t) {
    //https://sweetalert2.github.io/#input-types

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    return new Promise((resolve) => {
      Toast.fire({
        icon: t ? "success" : "error",
        title: t ? "you may change this row" : "this is an admin account", //'Signed in successfully'
      }).then((t) => resolve(t.value));
    });
  }

  adminComands(h, value) {
    switch (h) {
      case "username":
        this.dbUsername(value).then(console.log);
        break;
      case "password":
        this.dbPassword(value).then(console.log);
        break;
      case "type":
        this.dbType(value).then(console.log);
        break;
    }
  }

  // will re fetch all the data needed
  reload() {
    this.data = fetch(`http://localhost:3000/admin/allData`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: "{}", // body data type must match "Content-Type" header), // body data type must match "Content-Type" header
    });
    this.home.innerHTML = "";
    this.table = new Table(this.home);
    this.draw();
  }

  draw() {
    this.table.createHead(
      "username",
      "password",
      "type",
      "createdAt",
      "updatedAt",
      "deletedAt"
    );
    this.table.doc();

    let t = this;
    this.data
      .then((x) => x.json())
      .then(function (x) {
        x.forEach((e) => {
          var { username, type, createdAt, updatedAt, deletedAt } = e;

          updatedAt =
            createdAt == updatedAt ? "not updated" : new Date(updatedAt).mdy();
          deletedAt =
            deletedAt == null ? "not deleted" : new Date(deletedAt).mdy();

          createdAt = new Date(createdAt).mdy();

          t.table.createRow(false, [
            username,
            "",
            type,
            createdAt,
            updatedAt,
            deletedAt,
          ]);
        });
      })
      .then(() => {
        var th = document.querySelectorAll("th");
        var td = document.querySelectorAll("td");

        let t = this;
        td.forEach((element, i) => {
          element.addEventListener("click", (e) => {
            let arr = [...td].chunk(6);

            // th[ i%7 ] corasponds to diffrent headers
            // arr[ Math.floor(i/7) ][3].innerText  the row item you click

            let h = th[i % 6];
            let item = arr[Math.floor(i / 6)][i % 6];

            //t.check( arr[ Math.floor(i/7) ][3].innerText == "basic" ).then(function(s){
            if (h.innerText == "type") {
            } else {
              t.adminComands(h.innerText, e.target.innerText);
            }
            // })
          });
        });
      });
  }

  async softRemove(value) {
    let res = await fetch(`http://localhost:3000/admin/softRemove`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        p_username: value,
        json: true,
      }), // body data type must match "Content-Type" header), // body data type must match "Content-Type" header
    });

    this.reload();
    return !res.error ? res : false;
  }

  async restore(value) {
    let res = await fetch(`http://localhost:3000/admin/restore`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        p_username: value,
        json: true,
      }), // body data type must match "Content-Type" header), // body data type must match "Content-Type" header
    });

    this.reload();

    return !res.error ? res : false;
  }

  async hardRemove(value) {
    let res = await fetch(`http://localhost:3000/admin/hardRemove`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        p_username: value,
        json: true,
      }), // body data type must match "Content-Type" header), // body data type must match "Content-Type" header
    });

    this.reload();

    return !res.error ? res : false;
  }

  async updateUsername(value, username) {
    let res = await fetch(`http://localhost:3000/admin/changeUsername`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        old_username: value,
        new_username: username,
        json: true,
      }), // body data type must match "Content-Type" header), // body data type must match "Content-Type" header
    });

    this.reload();

    return !res.error ? res : false;
  }

  async updatePassword(new_password) {
    let res = await fetch(`http://localhost:3000/admin/changePassword`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        new_password: new_password,
        json: true,
      }), // body data type must match "Content-Type" header), // body data type must match "Content-Type" header
    });

    this.reload();

    return !res.error ? res : false;
  }
}
const feters = new Feters();

feters.draw();
