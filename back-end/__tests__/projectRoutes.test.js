// __tests__/projectRoutes.test.js
const request = require('supertest');
const app = require('../server'); 
const { pool } = require('../db/dbConfig'); 

// Mock authentication token
const mockToken = 'mock_token';

// Mocking the authentication middleware
jest.mock('../middleware/authMiddleware', () => {
    return (req, res, next) => {
        req.user = { uid: 'mock_uid' }; // Simulate the user object
        next();
    };
});

beforeAll(async () => {
    await pool.query('CREATE TABLE IF NOT EXISTS projects (id SERIAL PRIMARY KEY, name VARCHAR NOT NULL, description VARCHAR)');
    
});

afterAll(async () => {
    await pool.query('DROP TABLE IF EXISTS projects'); // Clean up the database
    await pool.end();
});

describe('Project Routes', () => {
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
