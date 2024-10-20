const request = require('supertest');
const app = require('../server'); 
const pool = require('../db/dbConfig'); 

// Mock token (replace with a valid token generation method if available)
const mockToken = 'your_mock_token';

describe('Task Routes', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('Create a new task', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ title: 'Test Task', priority: 1 });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('Stop a task', async () => {
    const taskId = 1;

    const response = await request(app)
      .put(`/tasks/${taskId}/stop`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task stopped successfully');
  });

  test('Delete a task', async () => {
    const taskId = 1; 

    const response = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task deleted successfully');
  });

  test('Associate a task with a project', async () => {
    const taskId = 1; 
    const projectId = 1; 

    const response = await request(app)
      .put(`/tasks/${taskId}/project/${projectId}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task associated with project successfully');
  });

  test('Remove a project from a task', async () => {
    const taskId = 1; 

    const response = await request(app)
      .put(`/tasks/${taskId}/project/remove`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Project association removed from task successfully');
  });

  test('Retrieve tasks by project', async () => {
    const projectId = 1; 
    const response = await request(app)
      .get(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe('Project Routes', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('GET /projects - Should return a list of projects', async () => {
    const response = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test('POST /projects - Should create a new project', async () => {
    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ name: 'Test Project', description: 'Project for testing' });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('DELETE /projects/:id - Should delete a project', async () => {
    const projectId = 1; 

    const response = await request(app)
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Project deleted successfully');
  });
});
