import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('Task API', () => {
  let taskId;
  let server;

  before(() => {
    server = app.listen(3031); // Start the test server on a different port
  });

  after(() => {
    server.close(() => {
      process.exit(0); // Exit the process after the server is closed
    });
  });

  it('should retrieve all tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.match(/json/);
    expect(res.body).to.be.an('array');
  });

  it('should create a new task', async () => {
    const res = await request(app).post('/tasks').send({ description: 'Test task' });
    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.match(/json/);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('id').that.is.a('number');
    expect(res.body).to.have.property('description', 'Test task');
    taskId = res.body.id;
  });

  it('should update a task', async () => {
    const res = await request(app).put(`/tasks/${taskId}`).send({ completed: true });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id', taskId.toString()); // Convert taskId to string
    expect(res.body).to.have.property('completed', true);
  });
  
  it('should delete a task', async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id', taskId.toString()); // Convert taskId to string
  });
});