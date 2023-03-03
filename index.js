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
Admin_Account, File} = require("./sql.js");



var express = require('express');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var url = require("url")

const file = new File()




var app = express();

app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html');
});

app.post("/get", async (req, res) => {
  const queryObject = url.parse(req.url, true).query;


//  let all = await Files.findAll()

  res.json({
    all: []//all,

  });

});

app.get("/open", async (req, res) => {
  const queryObject = url.parse(req.url, true).query;


  //let name = req.body.name;

  let all = await Files.findOne({
    where:{ 
      name: queryObject.name
    }
  });

  res.setHeader('Content-Type', all.type)
  res.end(all.rawData)

});


app.post('/',  function (req, res){
    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('file', async function (name, files){
        
        var oldPath = files.filepath;
			var newPath = path.join(__dirname, 'uploads')
				+ '/' + (files.name || files.originalFilename)
			var rawData = fs.readFileSync(oldPath)


              let x = await file.create(false,{ 
                name:  (files.name || files.originalFilename), 
                type: files.mimetype,
                url: icon(files.mimetype.split('/')[1].trim()),
                rawData: rawData,
                flags: files.flags
              });

              
              
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

app.listen(3000);