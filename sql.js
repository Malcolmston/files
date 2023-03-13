





const bcrypt = require("bcrypt");
const crypto = require("crypto");

const sqlite3 = require("sqlite3");
const { Sequelize, DataTypes, Op, QueryTypes, where } = require("sequelize");

const db = new sqlite3.Database("uses.sqlite");
//https://github.com/sequelize/sequelize/issues/10304
const sequelize = new Sequelize("uses", "", "", {
  dialect: "sqlite",
  storage: "uses.sqlite",
  benchmark: true,
  standardConformingStrings: true,
});

const Guest = sequelize.define(
  "Guest",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },

    showname: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false,
    },

    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,

    deletedAt: "deletedAt",
    paranoid: true,
  }
);

const Basic = sequelize.define(
  "Basic",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },

    showname: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false,
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    type: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },

    api: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    timestamps: true,

    deletedAt: "deletedAt",
    paranoid: true,
  }
);

const Files = sequelize.define(
  "Files",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rawData: {
      type: DataTypes.BLOB,
      allowNull: false,
    },

    flags: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
    // Other model options go here
  }
);

const Host = sequelize.define(
  "File_index",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {}
);

function dec2hex (dec) {
  return dec.toString(16).padStart(2, "0")
}

// generateId :: Integer -> String
function generateId (len) {
  var arr = new Uint8Array((len || 40) / 2)
  crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}


// connects files and Basic
Files.belongsToMany(Basic, { through: { model: Host, unique: false } });
Basic.belongsToMany(Files, { through: { model: Host, unique: false } });

// connects files and Guest
Files.belongsToMany(Guest, { through: { model: Host, unique: false } });
Guest.belongsToMany(Files, { through: { model: Host, unique: false } });

const jsonToCsv = (items) => {
  //  https://javascript.plainenglish.io/javascript-convert-json-to-csv-312e7503ce5d
  const header = Object.keys(items[0]);
  const headerString = header.join(",");
  // handle null or undefined values here
  const replacer = (key, value) => value ?? "";
  const rowItems = items.map((row) =>
    header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(",")
  );
  // join header and body, and break into separate lines
  const csv = [headerString, ...rowItems].join("\r\n");
  return csv;
};

class Account {
  constructor() {}

  get Name() {
    //https://stackoverflow.com/questions/9719570/generate-random-password-string-with-requirements-in-javascript
    return new Array(10)
      .fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
      .map((x) =>
        (function (chars) {
          let umax = Math.pow(2, 32),
            r = new Uint32Array(1),
            max = umax - (umax % chars.length);
          do {
            crypto.getRandomValues(r);
          } while (r[0] > max);
          return chars[r[0] % chars.length];
        })(x)
      )
      .join("");
  }

  password_hide(text) {
    return new Promise(function (resolve, reject) {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(text, salt, function (err, hash) {
          if (err) return reject(err);

          // Store hash in your password DB.
          resolve(hash);
        });
      });
    });
  }

  password_simi(password, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, function (err, result) {
        resolve(result);
      });
    });
  }
}

class File {
  constructor(t = "basic") {
    this.type = t;
  }

  async create(username, file, type = "basic") {
    let b = await Files.create(file);

    this.type = type;
    if (username) {
      let a;

      if (this.type == "basic" || this.type == "admin") {
        a = await Basic.findOne({ where: { username: username } });
      } else if (this.type == "guest") {
        a = await Guest.findOne({ where: { username: username } });
      } else {
        a = await Basic.findOne({ where: { username: username } });
      }

      let d = await a.addFile(b);

      return d;
    } else {
      return b;
    }
  }

  async delete(username) {
    let a = await this.Table.findOne({
      where: { username: username },
    });
    return await Host.destroy({
      where: { username: a.id },
    });
  }

  async findYours(username, type = "basic") {
    this.Table = this.vars;

    // let b = await this.Table.findOne({ where: { username: username } });

    let b;

    this.type = type;

    if (this.type == "basic" || this.type == "admin") {
      b = await Basic.findOne({ where: { username: username } });
    } else if (this.type == "guest") {
      b = await Guest.findOne({ where: { username: username } });
    } else {
      b = await Basic.findOne({ where: { username: username } });
    }

    let basic;

    if (this.type == "basic" || "admin") {
      basic = await Host.findAll({
        where: { BasicId: b.id },
      });
    } else if (this.type == "guest") {
      basic = await Host.findAll({
        where: { GuestId: b.id },
      });
    } else {
      basic = await Host.findAll({
        where: { BasicId: b.id },
      });
    }

    if (basic.map((x) => x.FileId).length === 0) {
      return [];
    }

    let e = await Files.findAll({
      where: {
        id: {
          [Op.or]: basic.map((x) => x.FileId),
        },
      },
    });

    return e;
  }

  async find(data) {
    let a = await Files.findOne({
      where: {
        name: data,
      },
    });

    return a;
  }
}

class Guest_Account extends Account {
  constructor() {
    super();
    this.username = this.Name;
  }

  async create() {
    let a = await Guest.create({
      name: this.username,
      type: "guest",
    });

    return a;
  }

  async remove() {
    let r = await Guest.destroy({
      where: {
        createdAt: { [Op.lte]: new Date(Date.now() - 1000 /* 24hrs in ms */) },
      },
      force: true,
    });

    return r;
  }

  async removeNow() {
    let a = this.username;

    let r = await Guest.destroy({
      where: {
        name: a,
      },
      force: true,
    });

    return r;
  }
}

class Basic_Account extends Account {
  constructor() {
    super();
  }

  async isDeleted(username) {
    let pf = await Basic.findOne({
      where: {
        username: username,
        type: "basic",
      },
      paranoid: true,
    });

    let pt = await Basic.findOne({
      where: {
        username: username,
        type: "basic",
      },
      paranoid: false,
    });

    if (pf) {
      return false;
    }

    if (!pf && pt) {
      return true;
    } else {
      return false;
    }
  }

  async validate(username, password) {
    let res = await Basic.findOne({
      where: {
        username: username,
        type: "basic",
      },
    });

    if (!res) {
      return false;
    }
    let a = await this.password_simi(password, res.password);

    return a;
  }

  async create(username, password) {
    let p = await this.password_hide(password);

    let a = await Basic.create({
      username: username,
      password: p,
      type: "basic",
      api: generateId(29)
    });

    return a;
  }

  async remove(username, password) {
    let r = await Basic.destroy({ where: { username: username } });

    return r;
  }

  async update_username(username, c) {
    let d = await Basic.update(
      { username: c, type: "basic" },
      {
        where: { username: username },
      }
    );

    return d;
  }

  async update_password(username, c) {
    let e = await this.password_hide(c.toString());

    let d = await Basic.update(
      { password: e },
      {
        where: { username: username, type: "basic" },
      }
    );

    return d;
  }
}

class Admin_Account extends Account {
  constructor() {
    super();
  }


  /**
   * checks the Admin table for a user by username and a password
   * @param {String} username a admin users username
   * @param {String} password a admin users password
   * @returns {Boolean} true if the username is valid and the passwords hash matches the hash of the password passed.
   * false if the username is invalid and the passwords hash does not match the hash of the password passed
   */
  async validate(username, password) {
    let res = await Basic.findOne({
      where: {
        username: username,
        type: "admin",
      },
    });

    if (!res) {
      return false;
    }
    let a = await this.password_simi(password, res.password);

    return a;
  }

  /**
   * 
   * @param {String} username a admin users username
   * @param {String | Boolean}  a admin users password, however, if not provided it will be assumed
   * @returns {Boolean | String} returns false if the username and password do not match any users in the database.
   * returns a {String} if a user exists; 
   */
  async keyFrom(username, password) {
    let res = await this.validate(username, password)

    if(!password){
      let value = await Basic.findOne({
        where: {
          username: username,
        }
      })
  
      if( value === null ) {
        return false;
      }else{
        return value.api;
            }
    }else{

    if(res){
    let value = await Basic.findOne({
      where: {
        username: username,
      }
    })

    if( value === null ) {
return false;
    }else{
return value.api;
    }
  }else{
    return false;
  }
}

  }


  /**
   * checks a users api key by checking the username. The users api key is found from the admin section
   * @param {String} key is a api key
   * @param {String} username a admin users username
   * @param {Boolean} paranoid if on will check deleted users, and if off it will not check deleted users
   * @returns {Boolean} true if the key can be validated, otherwise it returns false
   */
  async validateKey(key,username, paranoid=false) {
    let res = await Basic.findOne({where: {api: key, username: username, type:"admin" },  paranoid: paranoid})

    return !(!res)
  }
  /**
   * validates a user from the Basic table
   * @param {String} username username a basic users username
   * @param {String} password any a basic password witch is converterd to a has then compaired
   * @param {Boolean} paranoid checks deleted users if true but, only checks non deleted users if false
   * @returns {Boolean} true if the usrname and password is valid, otherwise it will return false
   */
  async check(username, password, paranoid=false) {
    let pwd = await this.password_hide(password);

    let a = await this.password_simi(password, pwd);

    if (a) {
      let res = await Basic.findOne({
        where: {
          username: username,
          type: "basic",
        },
        paranoid: paranoid
      });

      if (res == null) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  async create(username, password) {
    let p = await this.password_hide(password);
    let reg = /[a-zA-Z0-9!@#$%^&*]{6,16}$/;

    if (reg.test(password)) {
      let a = await Basic.create({
        username: username,
        password: p,
        type: "admin",
        api: generateId(58)
      });

      return a;
    } else {
      return false;
    }
  }

  async soft_remove(key,username, there_user) {
    let a = await this.validateKey(key,username);
    if( !(!a) ){

      let r = await Basic.destroy({
        where: { username: there_user, type: "basic" },
      });

      return true

    }else{
      return false
    }
       

       
  }

  async hard_remove(key,username, there_user) {
    let a = await this.validateKey(key,username);
        if(  !(!a) ){
    
          let r = await Basic.destroy({
            where: { username: there_user, type: "basic" },
            force: true,
          });
    
          return true
    
        }else{
    return false
        }
           
  }

  async restore(key,username, there_user) {
    let c2 = await this.validateKey(key,username);

    if (!(!c2) ) {
      let r = await Basic.restore({
        where: {
          username: there_user,
          type: "basic"
        }
            });

      return true;
    } else {
      return false;
    }
  }

  async update_username(key, username, old_username, new_username) {
    let c2 = await this.validateKey(key,username);

    if( !(!c2) ){
    let d = await Basic.update(
      { username: new_username   },
      {
        where: { username: old_username, type: "basic" },
      }
    );
  

    return d;
    }else{
      return false
    }
  }

  async update_password(api, curr_username, new_password){
    let c2 = await this.validateKey(key,curr_username);

    let pwd = await this.password_hide(new_password)

    if( !(!c2) ){
    let d = await Basic.update(
      { password: pwd   },
      {
        where: { username: curr_username, type: "basic" },
      }
    );
  

    return d;
    }else{
      return false
    }
  }

  async getAll(a) {
    let all;

    if (a == "basic") {
      all = await Basic.findAll({
        type: QueryTypes.SELECT,
        paranoid: false
      });
    } else if (a == "guest") {
      all = await Guest.findAll({
        type: QueryTypes.SELECT,
      });
    } else {
      return false;
    }

    let arr = all.map((x, i) => {
      return JSON.parse(JSON.stringify(x, null, 2));
    });

    return arr; //jsonToCsv(all.map( (x,i) => {  return JSON.parse( JSON.stringify(x, null, 2) ) }) )
  }
}

(async function () {
  await sequelize.sync({ force: false });

  //let b = new Admin_Account();
 //b.create("Malcolm", "MalcolmStoneAdmin22");
})();


module.exports = {
  Guest_Account,
  Basic_Account,
  Admin_Account,
  File,
};
