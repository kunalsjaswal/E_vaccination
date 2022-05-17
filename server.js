const express = require('express')
const path = require('path')
const hbs = require('hbs')
const session = require('express-session')
const { db, users, registers, admins } = require('./db/models')

// nodemailer for sending mail 
const nodemailer = require('nodemailer')
const { runInContext } = require('vm')



const app = express()
const port = process.env.PORT || 4444

/* to access body data */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* static path of views */
const viewsPath = path.join(__dirname, '/templates/views')
const partialsPath = path.join(__dirname, '/templates/partials')

// middleware
app.use(express.static(path.join(__dirname, '/templates')))
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)


//using session
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "someText"
}))
// get requests 

app.get('/developer', (req, res) => {
    res.render('developers')
})
app.get('/', (req, res) => {
    res.render('homepage')
})
app.get('/contactus', (req, res) => {
    res.render('contactus')
})
app.get('/dashboard/register', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login')
    }
    else {
        res.render('register')
    }

})
// register post Handler
app.post('/dashboard/register', async (req, res) => {
    const { regName, regPhone, regDOB, regSelectGender, regSelectID, regIDNumber, regDOV, regSelectTime } = req.body
    if ((!regName) || (!regPhone) || (!regDOB) || (!regSelectGender) || (!regSelectID) || (!regIDNumber) || (!regDOV) || (!regSelectTime)) {
        return res.status(400).render("register", { notFound: "Please Fill All Fields Carefully" })
    }
    else {
        const matchAadhar = await registers.findOne({ where: { idnumber: regIDNumber } })
        if (!matchAadhar) {
            await registers.create({
                name: regName,
                phone: regPhone,
                dob: regDOB,
                gender: regSelectGender,
                idproof: regSelectID,
                idnumber: regIDNumber,
                dateofvacc: regDOV,
                slotofvacc: regSelectTime,
                userId: req.session.userId,
                adminId: 1
            })
            res.status(200).redirect('/dashboard')
        }
        else {
            res.status(401).render('register', { userFound: "This User Already Exists." })
        }
    }
})

// sending mail 
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "usermessage03@gmail.com",
        pass: 'AAAKhumcare',
    },
});


app.post('/sendemail', (req, res) => {
    const { fname, lname, from, msg, mobile } = req.body
    const sub = "Message from " + fname + " " + lname;
    const messg = 'User Email: ' + from + "\nUser Number: " + mobile + "\nUser Message:\n                         " + msg;

    const mailData = {
        from: 'usermessage03@gmail.com',
        to: 'carehumanofficial@gmail.com',
        subject: sub,
        text: messg,
    };

    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return res.status(404).render('contactus', { notFound: "Failed to Send your message" })

        }
        else {
            return res.status(404).render('contactus', { success: "Your Message is sent. We will Contact You Soon" })
        }

    })
})

app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/signup', (req, res) => {
    res.render('signUp')
})

app.get('/developers', (req, res) => {
    res.render('developers')

})
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login')
    }
    else {
        const userDetails = await users.findByPk(req.session.userId)
        const registerDetails = await registers.findAll({ where: { userId: req.session.userId } })
        res.render('dashboard', { userDetails, registerDetails })

    }

})
//verify certificate
app.get('/verifycertificate', (req, res) => {
    res.render('verifycertificate')
})
// verify certificate post
app.post('/verifycertificate', async (req, res) => {
    const idnum = req.body.idnum;
    const person = await registers.findOne({ where: { idnumber: idnum } })
    if (person) {
        res.status(200).render('certificate', { person })
    }
    else {
        res.status(404).render('verifycertificate', { error: "No Certificate Found" })
    }
})
//certificate
app.post('/certificate', async (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login')
    }
    else {
        const registerId = req.body.userid
        const person = await registers.findOne({ where: { id: registerId } })
        res.render('certificate', { person })
    }
})
// user logout
app.get('/logout', (req, res) => {
    req.session.userId = null
    res.render('homepage', { logout: "Logged Out Successfully" })
})
//admin logout
app.get('/logoutadmin', (req, res) => {
    req.session.adminId = null
    res.render('homepage', { logout: "Logged Out Successfully" })
})
//faq render
app.get('/faq', (req, res) => {
    res.render('faq')
})
//admin get request
app.get('/adminlogin', (req, res) => {
    res.status(200).render('adminlogin')
})
app.post('/adminlogin', async (req, res) => {
    const { USERNAME, PASSWORD } = req.body
    const admin = await admins.findOne({ where: { username: USERNAME } })
    if (!admin) {
        return res.status(404).render('adminlogin', { notFound: "No Such User Name Found." })
    }
    if (PASSWORD !== admin.password) {
        return res.status(401).render('adminlogin', { incorrectPassword: "Please Enter Correct Password" })
    }
    // console.log("hello", user.id)
    req.session.adminId = admin.id;
    // console.log("hello2", req.session.userId)
    res.redirect('/adminpanel')
})

// change status post request

app.post('/changestatus', async (req, res) => {

    if (!req.session.adminId) {
        res.redirect('/adminlogin')
    }
    else {
        const { user_id, getstatus } = req.body
        const change_user = await registers.findOne({ where: { id: user_id } })

        if (change_user) {
            var change_temp;
            if (getstatus == "vaccinated") {
                change_temp = 1;

            }
            else {
                change_temp = 0;
            }

            const updatedRow = await registers.update(
                {
                    statusofVaccination: change_temp,
                },
                {
                    where: { id: user_id },
                }
            );

            const users_data = await registers.findAll()
            const vacc_data = await registers.findAll({ where: { statusofVaccination: 1 } })
            const non_vacc_data = await registers.findAll({ where: { statusofVaccination: 0 } })


            const total_users = await registers.count();
            const total_vacc = await registers.count({ where: { statusofVaccination: 1 } });
            const total_non_vacc = await registers.count({ where: { statusofVaccination: 0 } });


            res.render('adminpanel', { users_data, total_users, total_non_vacc, total_vacc, non_vacc_data, vacc_data })

        }
        else {
            window.alert("User Id not present")
        }

    }
});





// admin panel 
app.get('/adminpanel', async (req, res) => {
    if (!req.session.adminId) {
        res.redirect('/adminlogin')
    }
    else {
        const userDetails = await users.findByPk(req.session.userId)

        const users_data = await registers.findAll()
        const vacc_data = await registers.findAll({ where: { statusofVaccination: 1 } })
        const non_vacc_data = await registers.findAll({ where: { statusofVaccination: 0 } })


        const total_users = await registers.count();
        const total_vacc = await registers.count({ where: { statusofVaccination: 1 } });
        const total_non_vacc = await registers.count({ where: { statusofVaccination: 0 } });

        res.render('adminpanel', { userDetails, users_data, total_users, total_non_vacc, total_vacc, non_vacc_data, vacc_data })
    }

})

// post Requests signup
app.post('/signup', async (req, res) => {
    const { USERNAME, SQANSWER, PASSWORD, SQQUESTION } = req.body
    // encryption
    const passwordhash = Buffer.from(PASSWORD).toString('base64');
    if ((!USERNAME) || (!SQANSWER) || (!PASSWORD) || (!SQQUESTION)) {
        return res.status(400).render("signup", { notFound: "Please Fill All Fields Carefully" })
    }

    if (USERNAME.length == 10 && parseInt(USERNAME) != NaN) {
        if (PASSWORD.length >= 8 && PASSWORD.length <= 20) {
            const match = await users.findOne({ where: { username: USERNAME } })
            if (!match) {
                await users.create({
                    username: USERNAME,
                    password: passwordhash,
                    securityQuestion: SQQUESTION,
                    securityAnswer: SQANSWER,
                })
                res.status(201).render('signup', { response: "Your Account Created Successfully." })
            }
            else {
                res.status(400).render('signup', { notFound: "This User Already Exist. " })
            }
        }
        else {
            res.status(401).render('signup', { notFound: "Please Choose a Valid Password" })
        }
    }
    else {
        res.status(401).render('signup', { notFound: "Please Check Mobile Number Again" })
    }
})
// post request login
app.post('/login', async (req, res) => {
    const { USERNAME, PASSWORD } = req.body
    const user = await users.findOne({ where: { username: USERNAME } })
    if (!user) {
        return res.status(404).render('login', { notFound: "No Such Phone Number Found." })
    }
    const passhash = Buffer.from(PASSWORD).toString('base64')
    if (passhash !== user.password) {
        return res.status(401).render('login', { incorrectPassword: "Please Enter Correct Password" })
    }
    // console.log("hello", user.id)
    req.session.userId = user.id;
    // console.log("hello2", req.session.userId)
    res.redirect('/dashboard')
})
//get request forget password
app.get('/forgetpassword', (req, res) => {
    res.render('forgetpassword')
})
app.post('/forgetpassword', async (req, res) => {
    const { USERNAME, SQQUESTION, SQANSWER, PASSWORD } = req.body
    const user = await users.findOne({ where: { username: USERNAME } })
    if (!user) {
        return res.status(404).render('forgetpassword', { notFound: "No Such Phone Number Found." })
    }
    if (SQQUESTION == user.securityQuestion) {
        if (SQANSWER == user.securityAnswer) {
            const passwordhash = Buffer.from(PASSWORD).toString('base64');
            await users.update({ password: passwordhash }, { where: { username: USERNAME } })
            res.status(200).render('login', { passChanged: "Password Changed Successfully Login Now!" })
        }
        else {
            return res.status(404).render('forgetpassword', { notFound: "Please Enter Correct Security Answer" })
        }
    }
    else {
        return res.status(404).render('forgetpassword', { notFound: "Please Choose Correct Security Question" })
    }

})
//Adding database and listening to server
db.sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server Started at ${port}`)
        })
    })
    .catch((err) => {
        console.error(new Error('Could not sync Database'))
        console.log(err)
    })
