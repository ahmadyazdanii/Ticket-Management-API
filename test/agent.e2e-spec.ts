import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection, Types } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { hashSync } from 'bcrypt';

describe('Agent module (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    connection = moduleFixture.get<Connection>(getConnectionToken());
    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    await app.init();

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    await app.close();
  });

  describe('when /agent/auth/signin (POST) is called', () => {
    const hashedPassword = hashSync('12345678', 15);

    beforeAll(async () => {
      await connection.collection('agents').insertMany([
        {
          name: 'operator',
          email_address: 'operator@test.com',
          role: 'operator',
          password: String(hashedPassword),
        },
        {
          name: 'admin',
          email_address: 'admin@test.com',
          role: 'admin',
          password: String(hashedPassword),
        },
      ]);
    });

    afterAll(async () => {
      await connection.collection('agents').deleteMany({});
    });

    test('then it should return admin user instance and signed cookie', async () => {
      const { statusCode, header, body } = await request(httpServer)
        .post('/agent/auth/signin')
        .send({
          email_address: 'admin@test.com',
          password: '12345678',
        });

      expect(statusCode).toBe(201);
      expect(body).toEqual({
        _id: expect.any(String),
        name: 'admin',
        role: 'admin',
        email_address: 'admin@test.com',
      });
      expect(header['set-cookie'].length).toBeGreaterThanOrEqual(1);
    });

    test('then it should return operator user instance and signed cookie', async () => {
      const { statusCode, header, body } = await request(httpServer)
        .post('/agent/auth/signin')
        .send({
          email_address: 'operator@test.com',
          password: '12345678',
        });

      expect(statusCode).toBe(201);
      expect(body).toEqual({
        _id: expect.any(String),
        name: 'operator',
        role: 'operator',
        email_address: 'operator@test.com',
      });
      expect(header['set-cookie'].length).toBeGreaterThanOrEqual(1);
    });

    test('then it should return error with invalid email or password', () => {
      return request(httpServer)
        .post('/agent/auth/signin')
        .send({
          email_address: 'junk@test.com',
          password: '123456789',
        })
        .expect(422);
    });
  });

  describe('when /agent/tickets (GET) is called', () => {
    let ticket_id: string;
    let signed_cookies: string[];
    const hashedPassword = hashSync('12345678', 15);

    beforeAll(async () => {
      await connection.collection('agents').insertOne({
        name: 'operator',
        email_address: 'operator@test.com',
        role: 'operator',
        password: String(hashedPassword),
      });

      const ticket = await connection.collection('tickets').insertOne({
        title: 'new one',
        department: 'technical',
        status: 'not_answered',
        user_id: '1',
        rate: 0,
        messages: [
          {
            content: 'message',
            owner_id: '1',
            owner_type: 'user',
            createdAt: '2023-05-20T08:25:36.617Z',
          },
        ],
        createdAt: '2023-05-20T08:25:36.617Z',
        updatedAt: '2023-05-20T08:25:36.617Z',
        __v: 1,
      });

      ticket_id = String(ticket.insertedId);

      const { header } = await request(httpServer)
        .post('/agent/auth/signin')
        .send({
          email_address: 'operator@test.com',
          password: '12345678',
        });

      signed_cookies = header['set-cookie'];
    });

    afterAll(async () => {
      await connection.collection('tickets').deleteMany({});
      await connection.collection('agents').deleteMany({});
    });

    test('then it should return error when cookie not provided', () => {
      return request(httpServer).get('/agent/tickets').expect(401);
    });

    test('then it should return a list of tickets (if exists)', () => {
      return request(httpServer)
        .get('/agent/tickets')
        .set('Cookie', [...signed_cookies])
        .expect(200)
        .expect([
          {
            _id: ticket_id,
            title: 'new one',
            department: 'technical',
            status: 'not_answered',
            user_id: '1',
            rate: 0,
            createdAt: '2023-05-20T08:25:36.617Z',
            updatedAt: '2023-05-20T08:25:36.617Z',
          },
        ]);
    });
  });

  describe('when /agent/tickets/:ticket_id (GET) is called', () => {
    let ticket_id: string;
    let signed_cookies: string[];
    const hashedPassword = hashSync('12345678', 15);

    beforeAll(async () => {
      await connection.collection('agents').insertOne({
        name: 'operator',
        email_address: 'operator@test.com',
        role: 'operator',
        password: String(hashedPassword),
      });

      const { header } = await request(httpServer)
        .post('/agent/auth/signin')
        .send({
          email_address: 'operator@test.com',
          password: '12345678',
        });

      signed_cookies = header['set-cookie'];
    });

    afterAll(async () => {
      await connection.collection('agents').deleteMany({});
    });

    beforeEach(async () => {
      const ticket = await connection.collection('tickets').insertOne({
        title: 'new one',
        department: 'technical',
        status: 'not_answered',
        user_id: '1',
        rate: 0,
        messages: [
          {
            content: 'message',
            owner_id: '1',
            owner_type: 'user',
            createdAt: '2023-05-20T08:25:36.617Z',
          },
        ],
        createdAt: '2023-05-20T08:25:36.617Z',
        updatedAt: '2023-05-20T08:25:36.617Z',
        __v: 1,
      });

      ticket_id = String(ticket.insertedId);
    });

    afterEach(async () => {
      await connection.collection('tickets').deleteMany({});
    });

    test('then it should return error when cookie not provided', () => {
      return request(httpServer).get(`/agent/tickets/${ticket_id}`).expect(401);
    });

    test('then it should return empty response when ticket_id is invalid', () => {
      ticket_id = String(new Types.ObjectId());

      return request(httpServer)
        .get(`/agent/tickets/${ticket_id}`)
        .set('Cookie', [...signed_cookies])
        .expect(200);
    });

    test('then it should return a ticket (if exists)', async () => {
      const { body, statusCode } = await request(httpServer)
        .get(`/agent/tickets/${ticket_id}`)
        .set('Cookie', [...signed_cookies]);

      expect(statusCode).toBe(200);
      expect(body).toEqual({
        _id: ticket_id,
        title: 'new one',
        department: 'technical',
        status: 'not_answered',
        user_id: '1',
        rate: 0,
        messages: [
          {
            _id: expect.any(String),
            content: 'message',
            owner_id: '1',
            owner_type: 'user',
            createdAt: '2023-05-20T08:25:36.617Z',
          },
        ],
        createdAt: '2023-05-20T08:25:36.617Z',
        updatedAt: '2023-05-20T08:25:36.617Z',
        __v: 1,
      });
    });
  });

  describe('when /agent/tickets/:ticket_id (PUT) is called', () => {
    let agent_id: string;
    let ticket_id: string;
    let signed_cookies: string[];
    const hashedPassword = hashSync('12345678', 15);

    beforeAll(async () => {
      const agent = await connection.collection('agents').insertOne({
        name: 'operator',
        email_address: 'operator@test.com',
        role: 'operator',
        password: String(hashedPassword),
      });

      agent_id = String(agent.insertedId);

      const { header } = await request(httpServer)
        .post('/agent/auth/signin')
        .send({
          email_address: 'operator@test.com',
          password: '12345678',
        });

      signed_cookies = header['set-cookie'];
    });

    afterAll(async () => {
      await connection.collection('agents').deleteMany({});
    });

    beforeEach(async () => {
      const ticket = await connection.collection('tickets').insertOne({
        title: 'new one',
        department: 'technical',
        status: 'not_answered',
        user_id: '1',
        rate: 0,
        messages: [
          {
            content: 'message',
            owner_id: '1',
            owner_type: 'user',
            createdAt: '2023-05-20T08:25:36.617Z',
          },
        ],
        createdAt: '2023-05-20T08:25:36.617Z',
        updatedAt: '2023-05-20T08:25:36.617Z',
        __v: 1,
      });

      ticket_id = String(ticket.insertedId);
    });

    afterEach(async () => {
      await connection.collection('tickets').deleteMany({});
    });

    test('then it should return error when cookie not provided', () => {
      return request(httpServer).put(`/agent/tickets/${ticket_id}`).expect(401);
    });

    test('then it should return error with empty or invalid body content', () => {
      return request(httpServer)
        .put(`/agent/tickets/${ticket_id}`)
        .set('Cookie', [...signed_cookies])
        .expect(400);
    });

    test('then it should return error when ticket_id is invalid', () => {
      ticket_id = String(1);

      return request(httpServer)
        .put(`/agent/tickets/${ticket_id}`)
        .send({ content: 'new ticket' })
        .set('Cookie', [...signed_cookies])
        .expect(500);
    });

    test('then it should return new ticket message when anything is valid', async () => {
      const { body, statusCode } = await request(httpServer)
        .put(`/agent/tickets/${ticket_id}`)
        .send({ content: 'new ticket' })
        .set('Cookie', [...signed_cookies]);

      expect(statusCode).toBe(200);
      expect(body).toEqual({
        _id: ticket_id,
        messages: [
          {
            _id: expect.any(String),
            content: 'new ticket',
            createdAt: expect.any(String),
            owner_id: agent_id,
            owner_type: 'agent',
          },
        ],
        status: 'not_answered',
      });
    });
  });

  describe('when /agent/tickets/:ticket_id (PATCH) is called', () => {
    let ticket_id: string;
    let signed_cookies: string[];
    const hashedPassword = hashSync('12345678', 15);

    beforeAll(async () => {
      await connection.collection('agents').insertOne({
        name: 'operator',
        email_address: 'operator@test.com',
        role: 'operator',
        password: String(hashedPassword),
      });

      const { header } = await request(httpServer)
        .post('/agent/auth/signin')
        .send({
          email_address: 'operator@test.com',
          password: '12345678',
        });

      signed_cookies = header['set-cookie'];
    });

    afterAll(async () => {
      await connection.collection('agents').deleteMany({});
    });

    beforeEach(async () => {
      const ticket = await connection.collection('tickets').insertOne({
        title: 'new one',
        department: 'technical',
        status: 'not_answered',
        user_id: '1',
        rate: 0,
        messages: [
          {
            content: 'message',
            owner_id: '1',
            owner_type: 'user',
            createdAt: '2023-05-20T08:25:36.617Z',
          },
        ],
        createdAt: '2023-05-20T08:25:36.617Z',
        updatedAt: '2023-05-20T08:25:36.617Z',
        __v: 1,
      });

      ticket_id = String(ticket.insertedId);
    });

    afterEach(async () => {
      await connection.collection('tickets').deleteMany({});
    });

    test('then it should return error when cookie not provided', () => {
      return request(httpServer)
        .patch(`/agent/tickets/${ticket_id}`)
        .expect(401);
    });

    test('then it should return error with empty or invalid body content', () => {
      return request(httpServer)
        .patch(`/agent/tickets/${ticket_id}`)
        .set('Cookie', [...signed_cookies])
        .expect(400);
    });

    test('then it should return error when ticket_id is invalid', () => {
      ticket_id = String(1);

      return request(httpServer)
        .patch(`/agent/tickets/${ticket_id}`)
        .send({ status: 'answered' })
        .set('Cookie', [...signed_cookies])
        .expect(500);
    });

    test('then it should return changed ticket when anything is valid', async () => {
      const { body, statusCode } = await request(httpServer)
        .patch(`/agent/tickets/${ticket_id}`)
        .send({ status: 'answered' })
        .set('Cookie', [...signed_cookies]);

      expect(statusCode).toBe(200);
      expect(body).toEqual({
        _id: ticket_id,
        status: 'answered',
      });
    });
  });

  describe('when /agent/members (GET) is called', () => {
    let operatorCookies: string[];
    let adminCookies: string[];
    const hashedPassword = hashSync('12345678', 15);

    beforeAll(async () => {
      await connection.collection('agents').insertMany([
        {
          name: 'operator',
          email_address: 'operator@test.com',
          role: 'operator',
          password: String(hashedPassword),
        },
        {
          name: 'admin',
          email_address: 'admin@test.com',
          role: 'admin',
          password: String(hashedPassword),
        },
      ]);

      const [operator_response, admin_response] = await Promise.all([
        request(httpServer).post('/agent/auth/signin').send({
          email_address: 'operator@test.com',
          password: '12345678',
        }),
        request(httpServer).post('/agent/auth/signin').send({
          email_address: 'admin@test.com',
          password: '12345678',
        }),
      ]);

      operatorCookies = operator_response.header['set-cookie'];
      adminCookies = admin_response.header['set-cookie'];
    });

    afterAll(async () => {
      await connection.collection('agents').deleteMany({});
    });

    test('then it should return error when cookie not provided', () => {
      return request(httpServer).get('/agent/members').expect(401);
    });

    test('then it should return error when operator try to access', () => {
      return request(httpServer)
        .get('/agent/members')
        .set('Cookie', [...operatorCookies])
        .expect(403);
    });

    test('then it should return members when admin try to access', async () => {
      const { body, statusCode } = await request(httpServer)
        .get('/agent/members')
        .set('Cookie', [...adminCookies]);

      expect(statusCode).toBe(200);
      expect(body).toEqual([
        {
          _id: expect.any(String),
          name: 'operator',
          email_address: 'operator@test.com',
          role: 'operator',
        },
        {
          _id: expect.any(String),
          name: 'admin',
          email_address: 'admin@test.com',
          role: 'admin',
        },
      ]);
    });
  });

  describe('when /agent/members (PUT) is called', () => {
    let operatorCookies: string[];
    let adminCookies: string[];
    const hashedPassword = hashSync('12345678', 15);

    beforeAll(async () => {
      await connection.collection('agents').insertMany([
        {
          name: 'operator',
          email_address: 'operator@test.com',
          role: 'operator',
          password: String(hashedPassword),
        },
        {
          name: 'admin',
          email_address: 'admin@test.com',
          role: 'admin',
          password: String(hashedPassword),
        },
      ]);

      const [operator_response, admin_response] = await Promise.all([
        request(httpServer).post('/agent/auth/signin').send({
          email_address: 'operator@test.com',
          password: '12345678',
        }),
        request(httpServer).post('/agent/auth/signin').send({
          email_address: 'admin@test.com',
          password: '12345678',
        }),
      ]);

      operatorCookies = operator_response.header['set-cookie'];
      adminCookies = admin_response.header['set-cookie'];
    });

    afterAll(async () => {
      await connection.collection('agents').deleteMany({});
    });

    test('then it should return error when cookie not provided', () => {
      return request(httpServer).put('/agent/members').expect(401);
    });

    test('then it should return error when operator try to access', () => {
      return request(httpServer)
        .put('/agent/members')
        .set('Cookie', [...operatorCookies])
        .expect(403);
    });

    test('then it should return error when input data is invalid', () => {
      return request(httpServer)
        .put('/agent/members')
        .set('Cookie', [...adminCookies])
        .expect(400);
    });

    test('then it should return new agent when input data is valid', async () => {
      const { statusCode, body } = await request(httpServer)
        .put('/agent/members')
        .set('Cookie', [...adminCookies])
        .send({
          name: 'test',
          email_address: 'test@test.com',
          password: '12345678',
          role: 'operator',
        });

      expect(statusCode).toBe(200);
      expect(body).toEqual({
        _id: expect.any(String),
        name: 'test',
        email_address: 'test@test.com',
        role: 'operator',
      });
    });
  });
  // describe('when /agent/members/:member_id (PATCH) is called', () => {});
  // describe('when /agent/members/:member_id (DELETE) is called', () => {});
});
