import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection, Types } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Ticket } from '../src/ticket/schemas/ticket.schema';

describe('Ticket module (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    connection = moduleFixture.get<Connection>(getConnectionToken());
    app = moduleFixture.createNestApplication();

    await app.init();

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    await app.close();
  });

  afterEach(async () => {
    await connection.collection('tickets').deleteMany({});
  });

  describe('when /tickets (GET) is called', () => {
    beforeEach(async () => {
      await connection.collection<Ticket>('tickets').insertOne({
        title: 'new one',
        department: 'technical',
        rate: 0,
        status: 'not_answered',
        user_id: '1',
        messages: [{ content: 'message', owner_id: '1', owner_type: 'user' }],
      });
    });

    test('then it should return empty list with invalid or miss user_id', () => {
      return request(httpServer).get('/tickets').expect(200).expect([]);
    });

    test('then it should return tickets list for valid user_id', async () => {
      const response = await request(httpServer)
        .get('/tickets')
        .query({ user_id: 1 });

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual([
        {
          _id: expect.any(String),
          title: 'new one',
          department: 'technical',
          rate: 0,
          status: 'not_answered',
        },
      ]);
    });
  });

  describe('when /tickets (PUT) is called', () => {
    test('then it should return error when some/all data is missed', () => {
      return request(httpServer).put('/tickets').expect(400);
    });

    test('then it should return new ticket instance when body data is valid', async () => {
      const response = await request(httpServer).put('/tickets').send({
        title: 'new event!',
        department: 'technical',
        message: 'say hello to new ticket system!',
        user_id: '1',
      });

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        _id: expect.any(String),
        title: 'new event!',
        department: 'technical',
        status: 'not_answered',
        user_id: '1',
        messages: [
          {
            _id: expect.any(String),
            content: 'say hello to new ticket system!',
            owner_type: 'user',
            owner_id: '1',
            createdAt: expect.any(String),
          },
        ],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      });
    });
  });

  describe('when /tickets/:ticket_id (GET) is called', () => {
    let ticket_id: string;

    beforeEach(async () => {
      const instance = await connection.collection('tickets').insertOne({
        title: 'new one',
        department: 'technical',
        status: 'not_answered',
        user_id: '1',
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

      ticket_id = String(instance.insertedId);
    });

    test('then it should return error with invalid ticket_id format (not objectId)', () => {
      ticket_id = '1';

      return request(httpServer).get(`/tickets/${ticket_id}`).expect(500);
    });

    test('then it should return empty body with invalid ticket_id', () => {
      ticket_id = String(new Types.ObjectId());

      return request(httpServer).get(`/tickets/${ticket_id}`).expect(200);
    });

    test('then it should return a valid ticket with the id', async () => {
      const response = await request(httpServer).get(`/tickets/${ticket_id}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        _id: ticket_id,
        title: 'new one',
        department: 'technical',
        status: 'not_answered',
        user_id: '1',
        messages: [
          {
            _id: expect.any(String),
            content: 'message',
            owner_id: '1',
            owner_type: 'user',
            createdAt: expect.any(String),
          },
        ],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      });
    });
  });

  describe('when /tickets/:ticket_id (PUT) is called', () => {
    let ticket_id: string;

    beforeEach(async () => {
      const instance = await connection
        .collection<Ticket>('tickets')
        .insertOne({
          title: 'new one',
          department: 'technical',
          rate: 0,
          status: 'not_answered',
          user_id: '1',
          messages: [{ content: 'message', owner_id: '1', owner_type: 'user' }],
        });

      ticket_id = String(instance.insertedId);
    });

    test('then it should return error with empty or invalid body content', () => {
      return request(httpServer).put(`/tickets/${ticket_id}`).expect(400);
    });

    test('then it should return error with invalid ticket_id format (not objectId)', () => {
      ticket_id = '1';
      return request(httpServer)
        .put(`/tickets/${ticket_id}`)
        .send({
          content: 'some new contents',
          user_id: '1',
        })
        .expect(500);
    });

    test('then it should return 200 status code with new message object', async () => {
      const response = await request(httpServer)
        .put(`/tickets/${ticket_id}`)
        .send({
          content: 'some new contents',
          user_id: '1',
        });

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        _id: ticket_id,
        status: 'not_answered',
        messages: [
          {
            content: 'some new contents',
            owner_id: '1',
            owner_type: 'user',
            _id: expect.any(String),
            createdAt: expect.any(String),
          },
        ],
      });
    });
  });

  describe('when /tickets/:ticket_id/rate (POST) is called', () => {
    let ticket_id: string;
    let rate: number;

    beforeEach(async () => {
      const instance = await connection
        .collection<Ticket>('tickets')
        .insertOne({
          title: 'new one',
          department: 'technical',
          rate: 0,
          status: 'not_answered',
          user_id: '1',
          messages: [{ content: 'message', owner_id: '1', owner_type: 'user' }],
        });

      ticket_id = String(instance.insertedId);
      rate = 5;
    });

    test('then it should return error with empty or invalid body content', () => {
      return request(httpServer).post(`/tickets/${ticket_id}/rate`).expect(400);
    });

    test('then it should return error with invalid ticket_id format (not objectId)', () => {
      ticket_id = '1';
      return request(httpServer)
        .post(`/tickets/${ticket_id}/rate`)
        .send({
          rate,
        })
        .expect(500);
    });

    test('then it should return 201 status code with new rate', async () => {
      const response = await request(httpServer)
        .post(`/tickets/${ticket_id}/rate`)
        .send({
          rate,
        });

      expect(response.statusCode).toBe(201);

      expect(response.body).toEqual({
        _id: ticket_id,
        rate,
      });
    });
  });
});
