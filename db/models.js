const sequelize = require('sequelize')
let db;
if (process.env.DATABASE_URL) {
    db = new sequelize(process.env.DATABASE_URL)
}
else {
    db = new sequelize({
        database: 'vaccination_db',
        dialect: 'mysql',
        username: 'AbhishekKumar',
        password: 'AbhishekPass'
    })
}

// admin
const admins = db.define('admin', {
    id: {
        type: sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: sequelize.DataTypes.STRING(30),
        unique: true,
        allowNull: false,
        required: true
    },
    password: {
        type: sequelize.DataTypes.STRING(20),
        allowNull: false,
        required: true
    }
})
// users
const users = db.define('user', {
    id: {
        type: sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: sequelize.DataTypes.STRING(30),
        unique: true,
        allowNull: false,
        required: true

    },
    password: {
        type: sequelize.DataTypes.STRING(100),
        allowNull: false,
        required: true
    },
    securityQuestion: {
        type: sequelize.DataTypes.STRING(60),
        allowNull: false,
        required: true
    },
    securityAnswer: {
        type: sequelize.DataTypes.STRING(20),
        allowNull: false,
        required: true
    }
})
//Registration
const registers = db.define('register', {
    id: {
        type: sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    /* Creating table according to registration form */
    name: {
        type: sequelize.DataTypes.STRING(50),
        allowNull: false,
        required: true
    },
    phone: {
        type: sequelize.DataTypes.STRING(50),
        allowNull: false,
        required: true
    },
    dob: {
        type: sequelize.DataTypes.DATE,
        allowNull: false,
        required: true
    },
    gender: {
        type: sequelize.DataTypes.STRING(10),
        allowNull: false,
        required: true
    },
    idproof: {
        type: sequelize.DataTypes.STRING(30),
        allowNull: false,
        required: true
    },
    idnumber: {
        type: sequelize.DataTypes.STRING(20),
        allowNull: false,
        required: true
    },
    dateofvacc: {
        type: sequelize.DataTypes.DATE,
        allowNull: false,
        required: true
    },
    slotofvacc: {
        type: sequelize.DataTypes.STRING(20),
        allowNull: false,
        required: true
    },
    statusofVaccination: {
        type: sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
    }
})

//relations
admins.hasMany(users)
users.belongsTo(admins)

users.hasMany(registers)
registers.belongsTo(users)

admins.hasMany(registers)
registers.belongsTo(admins)

module.exports = {
    db,
    users,
    registers,
    admins
}
