const sequelize = require('../config/db.js');
const app = require('../app.js');
const req = require("supertest");
const User = require("../models/user.js");
const statsdClient = require('../libs/statsd.js');

const AWS = require('aws-sdk');

// Mock AWS SDK and its services
jest.mock('aws-sdk', () => {
    const SNS = {
        publish: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue('Message published')
        })
    };

    const S3 = {
        upload: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({ Location: 'https://mock-s3-url' })
        })
    };

    // Mock AWS config update
    const config = {
        update: jest.fn()
    };

    return { SNS: jest.fn(() => SNS), S3: jest.fn(() => S3), config };
});

jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('786379749045hgeuydgw7239392'),
}));

// Set up mock environment variable
process.env.SNS_TOPIC_ARN = 'mock-sns-topic-arn';

beforeAll(async () => {
    await sequelize.sync({force: true});
});

const user = {
    first_name: "Geeta",
    last_name: "Shivani",
    password: "Autumn123#",
    email: "geetas@gmail.com"
};

const user2 ={
    first_name: "Nikita",
    last_name: "K",
    password: "Autumn123#"
}

describe("user controller", () => {
    describe("createUser", () => {
        it("should create a new user and publish to SNS", async () => {
            const response = await req(app)
                .post("/v1/user")
                .send(user);
    
            expect(response.status).toBe(201);
            expect(AWS.SNS().publish).toHaveBeenCalledTimes(1);  // Verify SNS publish was called
            expect(AWS.SNS().publish).toHaveBeenCalledWith({
                Message: JSON.stringify({ email: user.email, first_name: user.first_name, last_name: user.last_name,verificationToken: '786379749045hgeuydgw7239392'
                }),
                TopicArn: process.env.SNS_TOPIC_ARN
            });
            await User.update( {verification_status: true}, {
                where : {email: user.email}
            });
        });
        it("should not create a new user if all fields are not given", async () => {
            const response = await req(app)
                .post("/v1/user")
                .send(user2)  
            expect(response.status).toBe(400);  
        });
        it("should not create a new user if email already exists", async()=>{
            const response = await req(app)
                .post("/v1/user")
                .send(user)
            expect(response.status).toBe(400);
        });
        it("should not create user details if he didn't use strong password", async () => {
            const response = await req(app)
            .post("/v1/user")
            .send({...user, password: "Apple", email: "anu@gmail.com"})
            expect(response.status).toBe(400);
        });
        it("should not create user if email format  is wrong", async () => {
            const response = await req(app)
            .post("/v1/user")
            .send({...user, password: "Apple", email: "anugmail.com"})
            expect(response.status).toBe(400);
        });
        it("should not create user details the first name contains anything other than alphabets", async () => {
            const response = await req(app)
            .post("/v1/user")
            .send({...user, first_name: "Apple123", email: "sai@outlook.com"})
            expect(response.status).toBe(400);
        });
        it("should not create user details the last name is less than 3 characters", async () => {
            const response = await req(app)
            .post("/v1/user")
            .send({...user, last_name: "Ap", email: "saiPrashanth@outlook.com"})
            expect(response.status).toBe(400);
        });
        it("should not create user details if invalid fields are given", async () => {
            const response = await req(app)
            .post("/v1/user")
            .send({...user, address: "1163 Boylston St", email: "Praneeth@outlook.com"})
            expect(response.status).toBe(400);
        });

    });

    const encodedCredentials = Buffer.from(`${user.email}:${user.password}`).toString('base64');
    const authorizationHeader = `Basic ${encodedCredentials}`;

    const wrongEncodedCredentials = Buffer.from(`${user.email}:'HiIamPassword'`).toString('base64');
    const wrongAuthorizationHeader = `Basic ${wrongEncodedCredentials}`;

    const wrongEncodedCredentials2 = Buffer.from(`'kadali.a@outlook.com':${user.password}`).toString('base64');
    const wrongAuthorizationHeader2 = `Basic ${wrongEncodedCredentials2}`;

    const wrongEncodedCredentials3 =  Buffer.from(`${user.email}:${user.password}`).toString('base64');
    const wrongAuthorizationHeader3 = `Bearer ${wrongEncodedCredentials2}`;

    describe("getUser", () => {
        it("should return user details", async () => {
            const response = await req(app)
                .get("/v1/user/self")
                .set("Authorization", authorizationHeader)  
            expect(response.status).toBe(200);
        });
        it("should not return user details if he is unauthorized", async () => {
            const response = await req(app)
                .get("/v1/user/self")
                .set("Authorization", wrongAuthorizationHeader)  
            expect(response.status).toBe(401);
        });
        it("should not return user details if he didnt use basic authentication", async () => {
            const response = await req(app)
                .get("/v1/user/self")
                .set("Authorization", wrongAuthorizationHeader3)  
            expect(response.status).toBe(401);
        });
    });

    const updateUser={
        first_name: "Anusha",
        last_name: "Tirumalasetty",
        password: "Apple$098",
        email: "geetas@gmail.com",
    }

    
    describe("putUser",()=>{
        it("should modify user details", async()=>{
            const response = await req(app)
                .put("/v1/user/self")
                .set("Authorization", authorizationHeader)
                .send(updateUser)
            expect(response.status).toBe(204);
        });
        it("should not update user details authorization headers are not set", async () => {
            const response = await req(app)
                .get("/v1/user/self")
            expect(response.status).toBe(401);
        });
        it("should not update user details the first name is more than 10 characters", async () => {
            const response = await req(app)
            .post("/v1/user")
            .send({...user, first_name: "AppleMangoBanana"})
            expect(response.status).toBe(400);
        });
        it("should not update user details if user wants to update email", async () => {
            const response = await req(app)
            .post("/v1/user")
            .send({email: "Srujana@outlook.com"})
            expect(response.status).toBe(400);
        });
        it("should not return user details if he is unauthorized", async () => {
            const response = await req(app)
                .get("/v1/user/self")
                .set("Authorization", wrongAuthorizationHeader2)  
            expect(response.status).toBe(401);
        });
    })

    describe("methodNotAllowed",()=>{
        it("Any call apart from get, put and post should be deined", async()=>{
            const response = await req(app)
                .delete("/v1/user/self")
            expect(response.status).toBe(405);
        })
    })

    
});

describe("health controller",()=>{
    it("should should connect to database on a get call with no query paramas or body", async () => {
        const response = await req(app)
            .get("/healthz") 
        expect(response.status).toBe(200);  
    });
    it("should should not execute when body is given on health call ", async () => {
        const response = await req(app)
            .get("/healthz") 
            .send(user)
        expect(response.status).toBe(400);  
    });
})

// Reset mocks between tests
afterEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await sequelize.close();
    statsdClient.close();
  });