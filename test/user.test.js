const app = require('../app');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('POST /signup', () => {
    before(async () => {
        await mongoose.connect('mongodb://localhost/testdb', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    after(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it('should create a new user', async () => {
        const res = await request(app)
            .post('/signup')
            .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('token');

        const user = await User.findOne({ email: 'john@example.com' });
        expect(user).to.exist;
        expect(user.name).to.equal('John Doe');
        expect(user.password).to.not.equal('password123');
    });

    it('should return an error if required fields are missing', async () => {
        const res = await request(app)
            .post('/signup')
            .send({ name: 'John Doe', password: 'password123' });

        expect(res.status).to.equal(500);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal('User validation failed: email: Path `email` is required');
    });
});

//run these tests -> mocha test/user.test.js.