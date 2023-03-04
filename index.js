function icon(type) {
  switch (type) {
    case "txt":
      return "https://cdn-icons-png.flaticon.com/512/4248/4248224.png";
    case "png":
      return "https://cdn-icons-png.flaticon.com/512/8243/8243033.png";
    case "svg":
    case "svg+xml":
      return "https://cdn-icons-png.flaticon.com/512/5063/5063253.png";
    case "jpeg":
      return "https://cdn-icons-png.flaticon.com/512/7858/7858983.png";
    case "obj":
      return "https://cdn-icons-png.flaticon.com/512/29/29536.png";
    case "gif":
      return "https://cdn-icons-png.flaticon.com/512/2306/2306094.png";
    case "webp":
      return "https://cdn-icons-png.flaticon.com/512/8263/8263118.png";
    case "bmp":
      return "https://cdn-icons-png.flaticon.com/512/8085/8085527.png";
    case "ico":
      return "https://cdn-icons-png.flaticon.com/512/1126/1126873.png";
    case "tif":
      return "https://cdn-icons-png.flaticon.com/512/8176/8176632.png";
    case "sql":
      return "https://cdn-icons-png.flaticon.com/512/4299/4299956.png";
    case "js":
    case "x-javascript":
      return "https://cdn-icons-png.flaticon.com/512/8945/8945622.png";
    case "json":
      return "https://cdn-icons-png.flaticon.com/512/136/136525.png";
    case "ts":
      return "https://cdn-icons-png.flaticon.com/512/8300/8300631.png";
    case "md":
      return "https://cdn-icons-png.flaticon.com/512/617/617467.png";
    case "cc":
      return "https://cdn-icons-png.flaticon.com/512/9095/9095099.png";
    case "cs":
      return "https://cdn-icons-png.flaticon.com/512/2306/2306037.png";
    case "c":
      return "https://cdn-icons-png.flaticon.com/512/3585/3585350.png";
    case "csv":
      return "https://cdn-icons-png.flaticon.com/512/9159/9159105.png";
    case "t":
      return "https://cdn-icons-png.flaticon.com/512/4490/4490695.png";
    case "r":
      return "https://cdn-icons-png.flaticon.com/512/8112/8112727.png";
    case "d":
      return "https://cdn-icons-png.flaticon.com/512/8112/8112877.png";
    case "h":
      return "https://cdn-icons-png.flaticon.com/512/8112/8112548.png";
    case "cs":
      return "https://cdn-icons-png.flaticon.com/512/7496/7496950.png";
    case "css":
      return "https://cdn-icons-png.flaticon.com/128/136/136527.png";
    case "html":
      return "https://cdn-icons-png.flaticon.com/512/136/136528.png";
    case "htm":
      return "https://cdn-icons-png.flaticon.com/512/136/136528.png";
    case "stylus":
      return "https://cdn-icons-png.flaticon.com/512/3650/3650875.png";
    case "sass":
      return "https://cdn-icons-png.flaticon.com/512/919/919831.png";
    case "php":
      return "https://cdn-icons-png.flaticon.com/512/2306/2306154.png";
    case "py":
      return "https://cdn-icons-png.flaticon.com/512/3098/3098090.png";
    case "node":
      return "https://cdn-icons-png.flaticon.com/512/5968/5968322.png";
    case "mp3":
      return "https://cdn-icons-png.flaticon.com/512/2306/2306139.png";
    case "mp4":
      return "https://cdn-icons-png.flaticon.com/512/1719/1719843.png";
    case "wav":
      return "https://cdn-icons-png.flaticon.com/512/8263/8263140.png";
    case "acc":
      return "https://cdn-icons-png.flaticon.com/512/8300/8300275.png";
    case "flac":
      return "https://cdn-icons-png.flaticon.com/512/730/730567.png";
    case "mp2":
      return "https://cdn-icons-png.flaticon.com/512/8300/8300531.png";
    case "mp1":
      return "https://cdn-icons-png.flaticon.com/512/8300/8300500.png";
    case "doc":
      return "https://cdn-icons-png.flaticon.com/512/4725/4725970.png";
    case "pdf":
    case "octet-stream":
      return "https://cdn-icons-png.flaticon.com/512/136/136522.png";
    case "jpg":
      return "https://cdn-icons-png.flaticon.com/512/337/337940.png";
    case "xls":
      return "https://cdn-icons-png.flaticon.com/512/3997/3997638.png";
    default:
      return "https://cdn-icons-png.flaticon.com/512/660/660726.png";
  }
}

const {
  Guest_Account,
  Basic_Account,
  Admin_Account,
  File,
} = require("./sql.js");

var express = require("express");
var session = require("express-session");
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var url = require("url");

const file = new File();
//const guest_account = new Guest_Account();
const basic_account = new Basic_Account();
const admin_account = new Admin_Account();

var ejs = require("ejs");

var app = express();

app.use(express.static("public"));

const sessionMiddleware = session({
  name: "yay_session",
  secret: "some secret this is now",
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 600000, httpOnly: false, domain: "localhost" },
});

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);

app.get("/", (req, res) => {
  res.status(200).render("login", {
    code: "sign up",
    fail_code: req.session.username ? "you are alredy logged in" : "",
  });
});

app.post("/signup", (req, res) => {
  let { username, password } = req.body;

  basic_account.validate(username, password).then(function (x) {
    // if there is an account with the username and password it is valid.
    if (!x) {
      basic_account.create(username, password).then(function (e) {
        req.session.username = username;
        req.session.type = "basic";
        req.session.log_type = "basic";
        res.status(200).redirect("home");
      });
    } else {
      res.redirect("/");
      res.status(403).render("login", {
        code: "an account with that username already exists!",
        fail_code: "an account with that username already exists!",
      });
    }
  });
});

app.post("/login", (req, res) => {
  let { username, password } = req.body;
  basic_account.isDeleted(username).then(function (bool) {
    if (bool) {
      res.redirect("/");
      res.status(403).render("login", {
        code: "an account with that username or password no longer exists!",
        fail_code:
          "The account you are trying to find an account that has been deleted!",
      });
    } else {
      basic_account.validate(username, password).then(function (x) {
        if (x) {
          req.session.username = username;

          req.session.log_type = "basic";

          req.session.type = "basic";

          res.status(200).redirect("home");
        } else {
          admin_account.validate(username, password).then(function (x) {
            if (x) {
              req.session.username = username;

              req.session.log_type = "admin";

              res.status(201).render("redirect", {});
            } else {
              res.redirect("/");
              res.status(402).render("login", {
                code: "an account with that username or password does not exist!",
                fail_code:
                  "an account with that username or password does not exist!",
              });
            }
          });
        }
      });
    }
  });
});

app.get("/home", (req, res) => {
  if (req.session.username) {
    res.render("home", {
      type: req.session.type,
    });
  } else {
    file.type = req.session.log_type
    res.redirect("/");
    res.status(400).render("login", {
      code: "sign up",
      fail_code:
        "you tried to go to a page that you do not have permision to acses",
    });
  }
});

app.get('/logout', (req, res) => {
  if( req.session.type == 'guest' ){
    guest_account.removeNow().then(function(){
      req.session.destroy()
      res.redirect('/')
      //return;
    })
  }else{
	req.session.destroy()
  res.redirect('/')
}
})



app.post("/admin", function (req, res) {
  req.session.type = "admin";

  res.status(200).redirect("home");
});

app.post("/guest", function (req, res) {
  req.session.type = "basic";

  res.status(200).redirect("home");
});



app.get("/basic/allData", async (req, res) => {
  res.set("Content-Type", "application/json");

  let data = await admin_account.getAll("basic");

  res.send(data);
});

app.post("/basic/usernameChange", async (req, res) => {
  let { password, N_username } = req.body;
  let b = await basic_account.validate(req.session.username, password);
  //let a = await admin_account.validate(username, password)

  if (b) {
    basic_account
      .update_username(req.session.username, password, N_username)
      .then(
        res.status(200).render("home", {
          type: req.session.type,
        })
      );
  } else {
    res.status(403);
  }
});

app.post("/basic/passwordChange", async (req, res) => {
  let { password, N_password } = req.body;
  let b = await basic_account.validate(req.session.username, password);
  //let a = await admin_account.validate(username, password)

  if (b) {
    basic_account
      .update_password(req.session.username, password, N_password)
      .then(
        res.status(200).render("home", {
          type: req.session.type,
        })
      );
  } else {
    res.status(403);
  }
});

app.post("/basic/softRemove", async (req, res) => {
  let { password } = req.body;

  basic_account.remove(req.session.username, password).then(function (x) {
    if (x) {
      req.session.destroy();
      res.redirect("/");
      res.status(200).render("login", {
        code: "sign up",
        fail_code: "your account was deleted",
      });
    } else {
      res.status(403);
    }
  });
});

/*
app.get("/admin/allData", async (req, res) => {
  res.set("Content-Type", "application/json");

  let data = await admin_account.getAll("admin");

  res.send(data);
});

app.post("/admin/softRemove", async (req, res) => {
  let { password, p_username, p_password } = req.body;

  admin_account
    .soft_remove(p_username, p_password, req.session.username, password)
    .then(function (x) {
      if (x) {
        res.status(200).render("home", {
          type: req.session.type,
        });
      } else {
        res.status(403);
      }
    });
});

app.post("/admin/restore", async (req, res) => {
  let { password, p_username, p_password } = req.body;

  admin_account
    .restore(p_username, p_password, req.session.username, password)
    .then(function (x) {
      if (x) {
        res.status(200).render("home", {
          type: req.session.type,
        });
      } else {
        res.status(403);
      }
    });
});

app.post("/admin/hardRemove", async (req, res) => {
  let { password, p_username, p_password } = req.body;

  admin_account
    .hard_remove(p_username, p_password, req.session.username, password)
    .then(function (x) {
      if (x) {
        res.status(200).render("home", {
          type: req.session.type,
        });
      } else {
        res.status(403);
      }
    });
});
*/

app.get("/home/get", async (req, res) => {
//  var exclude = url.parse(req.url, true).query.array.split('(*),,,(*)');

  let all = await file.findYours(req.session.username, req.session.log_type);

  //console.clear()
console.log( all )

  res.json({
    all: all,
  });
});

app.post("/signup", (req, res) => {
  let { username, password } = req.body;

  basic_account.validate(username, password).then(function (x) {
    // if there is an account with the username and password it is valid.
    if (!x) {
      basic_account.create(username, password).then(function (e) {
        req.session.username = username;
        req.session.type = "basic";

        res.status(200).redirect("home");
      });
    } else {
      res.redirect("/");
      /*
			res.status(403).render('login', {
			code: 'an account with that username already exists!',
			fail_code: 'an account with that username already exists!'
    });
    */
    }
  });
});

app.post("/login", (req, res) => {
  let { username, password } = req.body;
  basic_account.isDeleted(username).then(function (bool) {
    if (bool) {
    //  res.redirect("/");
      res.status(403).render("login", {
        code: "an account with that username or password no longer exists!",
        fail_code:
          "The account you are trying to find an account that has been deleted!",
      });
    } else {
      basic_account.validate(username, password).then(function (x) {
        if (x) {
          req.session.username = username;
          req.session.type = "basic";
          res.redirect("/home");
        } else {
          //res.redirect("/");
          res.status(402).render("login", {
            code: "an account with that username or password does not exist!",
            fail_code:
              "an account with that username or password does not exist!",
          });

        }
      });
    }
  });
});

/*
app.post('/guest', (req, res) => {
  guest_account.create().then(function(x){
    req.session.username = 'guest'
    req.session.type = 'guest'

    res.status(200).redirect('home')
  }).catch( e => {
    console.log( e )
      res.redirect('/')
      res.status(500).render('login', {
			code: 'You are unable to create a guest account!',
			fail_code: 'Mhmmmmmm You are unable to create a guest account!',
		});
  })
})
*/

app.get("/logout", (req, res) => {
  if (req.session.type == "guest") {
    guest_account.removeNow().then(function () {
      req.session.destroy();
      res.redirect("/");
      //return;
    });
  } else {
    req.session.destroy();
    res.redirect("/");
  }
});

app.get("/home/get", async (req, res) => {
  let all = await file.findYours(req.session.username);

  res.json({
    all: all,
>>>>>>> no_userChanges
  });
});

<<<<<<< HEAD
});

app.get("/home/open", async (req, res) => {
  const queryObject = url.parse(req.url, true).query;

  let all = await file.find(queryObject.name);

  res.setHeader("Content-Type", all.type);
  res.end(all.rawData);
});

app.post("/", function (req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req);

  form.on("fileBegin", function (name, file) {
    file.path = __dirname + "/uploads/" + file.name;
  });

  form.on("file", async function (name, files) {
    var oldPath = files.filepath;
    var newPath =
      path.join(__dirname, "uploads") +
      "/" +
      (files.name || files.originalFilename);
    var rawData = fs.readFileSync(oldPath);

    let x = await file.create(req.session.username, {
      name: files.name || files.originalFilename,
      type: files.mimetype,
      url: icon(files.mimetype.split("/")[1].trim()),
      rawData: rawData,
      flags: files.flags,
    }, req.session.log_type);

    //res.setHeader('Content-Type',files.mimetype)
    //res.end(rawData);

    /*
			fs.writeFile(newPath, rawData, function(err) {
				if (err) console.log(err)
			 console.log("Successfully uploaded")
			})
			*/
    //  console.log( file );
  });

  res.status(204).send();
  //res.redirect('/');
});
*/
app.listen(3000);

app.listen(3000);
