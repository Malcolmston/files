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
	standardConformingStrings: true
});


const Guest = sequelize.define('Guest', {
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
		unique: false
	},

	type: {
		type: DataTypes.TEXT,
		allowNull: false
	}
},
	{
		timestamps: true,

		deletedAt: "deletedAt",
		paranoid: true,
	});


const Basic = sequelize.define('Basic', {
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
		unique: false
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
	}
},
	{
		timestamps: true,

		deletedAt: "deletedAt",
		paranoid: true,
	});

const Admin = sequelize.define('Admin', {
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
		unique: false
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
	}
},
	{
		timestamps: true,
		deletedAt: "deletedAt",
		paranoid: true,
	});

const Files = sequelize.define('Files', {
id: {
type: DataTypes.INTEGER,
primaryKey: true,
autoIncrement: true,
},
  name: {
      type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },

  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },

  rawData: {
      type:DataTypes.BLOB,
      allowNull: false
  },
  
  flags: {
    type: DataTypes.STRING,
  }
}, {
  paranoid: true
  // Other model options go here
});

const Host = sequelize.define("File_index", {
	id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

	location: {
		type: DataTypes.TEXT,
		 allowNull: true
	}
	
}, {});


// connects files and Basic
Files.belongsToMany(Basic, { through:  { model: Host, unique: false}} );
Basic.belongsToMany(Files, { through:  { model: Host, unique: false}} );



// connects files and Admin
Files.belongsToMany(Admin, { through:  { model: Host, unique: false}});
Admin.belongsToMany(Files, { through:  { model: Host, unique: false}});


// connects files and Guest
Files.belongsToMany(Guest, { through:  { model: Host, unique: false}});
Guest.belongsToMany(Files, { through:  { model: Host, unique: false}});



const jsonToCsv = (items) => {
   //  https://javascript.plainenglish.io/javascript-convert-json-to-csv-312e7503ce5d
  const header = Object.keys(items[0]);
  const headerString = header.join(',');
  // handle null or undefined values here
  const replacer = (key, value) => value ?? '';
  const rowItems = items.map((row) =>
    header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(',')
  );
  // join header and body, and break into separate lines
  const csv = [headerString, ...rowItems].join('\r\n');
  return csv;
}

class Account {
	constructor() {

	}

	get Name() {
		//https://stackoverflow.com/questions/9719570/generate-random-password-string-with-requirements-in-javascript
		return new Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(x => (function(chars) { let umax = Math.pow(2, 32), r = new Uint32Array(1), max = umax - (umax % chars.length); do { crypto.getRandomValues(r); } while (r[0] > max); return chars[r[0] % chars.length]; })(x)).join('');
	}

	password_hide(text) {
		return new Promise(function(resolve, reject) {
			bcrypt.genSalt(10, function(err, salt) {
				bcrypt.hash(text, salt, function(err, hash) {
					if (err) return reject(err);

					// Store hash in your password DB.
					resolve(hash);
				});
			});
		});
	}

	password_simi(password, hash) {
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, hash, function(err, result) {
				resolve(result);
			});
		});
	}
}

class File {
	constructor(){
	}

	async create(username, file){
	

		let b = await Files.create(file)
		
        if(username){
            let a = await Basic.findOne({
                where:{username: username}
            })

		let d = await a.addFile(b )

        return d
        }else{
            return b
        }


	
	}

	async delete(username){
		let a = await Basic.findOne({
			where:{username: username}
		})
		return await Host.destroy({
			where: {username: a.id}
		})
	}

	async findYours(username){
		//.findOne({where: {username: username}})

		let b = await Basic.findOne({where: {username: username}})

		let basic = await Host.findAll({
			where: {BasicId: b.id}
		})


		let e = await Files.findAll({
			
			where: {
				id: {
				[Op.or]:  basic.map(x => x.FileId)
				}
			}
			
			})
		console.log( e )

		return e
		
	}

	async find(data){
		let a = await Files.findOne({
			where:{ 
			  name: data
			}
		  });

		  return a
	}

}

class Guest_Account extends Account {
    constructor(){
        super()
				this.username =  this.Name
    }

    async create() {

		let a = await Guest.create({
			name: this.username,
			type: 'guest'
		})

		return a
	}


	async remove() {
		let r = await Guest.destroy({
			where: {

				createdAt: { [Op.lte]: new Date(Date.now() - (1000 /* 24hrs in ms */)) }
			},
			force: true
		});

		return r

	}

	async removeNow() {
		let a = this.username

		let r = await Guest.destroy({
			where: {
				name: a
			},
			force: true
		});

		return r

	}
}

class Basic_Account extends Account {
    constructor(){
        super()
    }
	
	async isDeleted(username) {
			let pf = await Basic.findOne({
				where: {
					username: username,
				},
				 paranoid: true
			});

			let pt = await Basic.findOne({
				where: {
					username: username,
				},
				 paranoid: false
			});

			if(pf){
				return false
			}

			if( (!pf) && pt){
				return true
			}else{
				return false
			}

		}

    async validate(username, password) {

		let res = await Basic.findOne({
			where: {
				  username: username,
			}
		  });

		  if(!res){
return false
		  }
		let a = await this.password_simi(password, res.password)


		return a 

	}

    async create(username, password) {
		let p = await this.password_hide(password)

		let a = await Basic.create({
			username: username,
			password: p,
			type: 'basic'
		})

		return a
	}

	async remove(username, password) {
		let r = await Basic.destroy({ where: { username: username } });

		return r
	}

	async update_username(username, c) {
		let d = await Basic.update({ username: c }, {
			where: { username: username }
		})

		return d
	}

	async update_password(username, c) {
		let e = await this.password_hide(c.toString());

		let d = await Basic.update({ password: e }, {
			where: { username: username }
		})

		return d

	}

}

class Admin_Account extends Account {
    constructor(){
        super()
    }

    	// checks the Admin table
    async validate(username, password) {
 		let pwd = await this.password_hide(password)

		let a = await this.password_simi(password, pwd)

		if(a){
			let res = await Admin.findOne({
        where: {
          username: username,
        },
      });

	      	if (res == null) {
	        return false;
	      }else{
			  return true;
		  }
		}else{
				return false;
			}
	}

	// checks the Basic table
	async check(username, password) {
 		let pwd = await this.password_hide(password)

		let a = await this.password_simi(password, pwd)

		if(a){
			let res = await Basic.findOne({
        where: {
          username: username,
        },
      });

	      	if (res == null) {
	        return (false);
	      }else{
			  return(true);
		  }
		}else{
				return (false);
			}
	}

	async create(username, password) {
		let p = await this.password_hide(password)
let reg = (/[a-zA-Z0-9!@#$%^&*]{6,16}$/)


if(reg.test(password) ){
		let a = await Admin.create({
			username: username,
			password:  p,
			type: 'admin'
		})

		return a
	}else{
		return false
	}
	}

	async soft_remove(username, password,Busername, Bpassword) {
		let a = this.validate(Busername, Bpassword)
		if(a){
	    let i = await this.check(username, password)

	    if( i ){
		let r = await Basic.destroy({ where: { username: username } });

		return r
	    }else{
	        return false
	    }
		}else {
			return false
		}
	}

	async hard_remove(username, password,Busername, Bpassword) {
		let a = this.validate(Busername, Bpassword)
		if(a){
	    let i = await this.check(username, password)

	    if( i ){
		let r = await Basic.destroy({ where: { username: username },force: true });

		return r
	    }else{
	        return false
	    }
		}else{
			return false
		}
	}

	async restore(username, password, Yusername, Ypassword) {
	    let c1 = this.check(username, password)
	    let c2 = this.validate(Yusername, Ypassword)

	    if( c1 && c2){
	   let r = await Basic.restore({ where: {
     username: username
  } })

  return true
	    }else{
	        return false
	    }


	}


	async update_username(username, c) {
		let d = await Basic.update({ username: c }, {
			where: { username: username }
		})

		return d
	}

	async update_password(username, c) {
		let e = await this.password_hide(c.toString());

		let d = await Basic.update({ password: e }, {
			where: { username: username }
		})

		return d

	}

	async getAll(a) {

		        let all;

						if(a == 'basic'){
							all = await Basic.findAll({
			  type: QueryTypes.SELECT
			})
		}else if(a == 'guest'){
			all = await Guest.findAll({
type: QueryTypes.SELECT
})
}else{
	return false;
}





let arr = all.map( (x,i) => {  return ( JSON.parse(JSON.stringify(x, null, 2) )) })


		    return arr  //jsonToCsv(all.map( (x,i) => {  return JSON.parse( JSON.stringify(x, null, 2) ) }) )
	}
}



(async function () {
  await sequelize.sync({ force: false });

})();



module.exports = {
	Guest_Account,
	Basic_Account,
	Admin_Account,
    File
};
