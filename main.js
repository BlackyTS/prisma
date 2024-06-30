const pgp = require('pg-promise')();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

require('dotenv').config();

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
}

const connectionOptions = {
    host: 'localhost',
    port: 5432,
    database: 'ProjectTEST',
    user: 'postgres',
    password: 'admin'
};

const db = pgp(connectionOptions);

// JWT function
const generateToken = (user) => {
    return jwt.sign({ id: user.user_id, email: user.user_email, role: user.user_role }, secret, { expiresIn: '72h' });
};

// ฟังก์ชัน Middleware สำหรับการตรวจสอบ JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log('No token provided');
        return res.sendStatus(401); // ถ้าไม่มี token ส่ง 401 Unauthorized
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.sendStatus(403); // ถ้า token ไม่ถูกต้อง ส่ง 403 Forbidden
        }
        req.user = user; // เก็บข้อมูลผู้ใช้ที่ถูกตรวจสอบแล้วใน req.user
        next();
    });
};

// ฟังก์ชัน Middleware สำหรับการตรวจสอบสิทธิ์ของผู้ใช้
const authorizeRole = (role) => {
    return (req, res, next) => {
        console.log('User role:', req.user ? req.user.role : 'No user found');
        if (req.user.role !== role) {
            console.log('User role does not match:', req.user.role);
            return res.sendStatus(403); // ถ้าสิทธิ์ไม่ตรงกับที่กำหนด ส่ง 403 Forbidden
        }
        next();
    };
};

// เส้นทางการลงทะเบียน (Register)
app.post('/register', async (req, res) => {
    const { firstname, lastname, email, password, role } = req.body;
    console.log(req.body)

    if (!firstname || !lastname || !email || !password || !role) {
        return res.status(400).send('Missing required fields');
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        await prisma.users.create({
            data: {
                user_firstname: firstname,
                user_lastname: lastname,
                user_email: email,
                user_password: password,
                user_role: role
            }
        })
        //await db.none('INSERT INTO users(user_firstname, user_lastname, user_email, user_password, user_role) VALUES($1, $2, $3, $4, $5)', [firstname, lastname, email, hashedPassword, role]);

        res.status(200).send('User registered successfully');
    } catch (error) {
        console.error('ERROR:', error);
        res.status(500).send('Error registering user');
    }
});

app.get('/get', async (req, res) => {
    try {
        const users = await prisma.users.findMany()
        res.status(200).json(users)
    } catch (error) {
        console.error('ERROR:', error);
        res.status(500).send('Error registering user');
    }
});

// เส้นทางการเข้าสู่ระบบ (Login)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.one('SELECT * FROM users WHERE user_email = $1', [email])
        .then(async user => {
            const match = await bcrypt.compare(password, user.user_password);
            if (match) {
                const token = generateToken(user);
                res.status(200).json({ token });
            } else {
                res.status(400).send('Invalid email or password');
            }
        })
        .catch(error => {
            console.error('ERROR:', error);
            res.status(400).send('Invalid email or password');
        });
});

// เส้นทางการเพิ่มอุปกรณ์ใหม่ (สำหรับ admin)
app.post('/devices', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id, name, description } = req.body;
    try {
        await db.none('INSERT INTO device(device_id, device_name, device_description) VALUES($1, $2, $3)', [id, name, description]);
        res.status(200).send('Device added successfully');
    } catch (error) {
        console.error('ERROR:', error);
        res.status(500).send('Error adding device');
    }
});

const port = 8000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
