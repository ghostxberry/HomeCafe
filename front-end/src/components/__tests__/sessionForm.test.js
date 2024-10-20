import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from '../../contexts/authContext';
import SessionForm from '../SessionForm';
import axios from 'axios';

// Mock the useAuth hook
jest.mock('../../contexts/authContext');
jest.mock('axios'); // Mock Axios

describe('SessionForm', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    useAuth.mockReturnValue({ currentUser: { getIdToken: jest.fn().mockResolvedValue('mockToken') } });
    jest.clearAllMocks(); // Clear previous mocks
  });

  test('renders input and buttons', () => {
    render(<SessionForm />);
    expect(screen.getByPlaceholderText(/enter your task here/i)).toBeInTheDocument();
    expect(screen.getByText(/start/i)).toBeInTheDocument();
    expect(screen.getByText(/stop/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type or select a tag/i)).toBeInTheDocument();
  });

  test('shows alert when trying to start a task without signing in', () => {
    useAuth.mockReturnValue({ currentUser: null });
    render(<SessionForm />);

    window.alert = jest.fn(); // Mock window.alert
    fireEvent.click(screen.getByText(/start/i));
    expect(window.alert).toHaveBeenCalledWith('Please sign in to start a task.');
  });

  test('creates a new task on clicking start', async () => {
    axios.post.mockResolvedValue({ data: { id: 'newTaskId' } });
    render(<SessionForm />);

    fireEvent.change(screen.getByPlaceholderText(/enter your task here/i), { target: { value: 'Test Task' } });
    fireEvent.click(screen.getByText(/start/i));

    expect(axios.post).toHaveBeenCalledWith('/api/tasks', { title: 'Test Task' }, expect.any(Object));
    expect(await screen.findByText(/Task created:/)).toBeInTheDocument(); // Adjust according to how you want to show task creation
  });

  test('stops the task', async () => {
    axios.put.mockResolvedValue({ data: {} });
    render(<SessionForm />);

    // Start a task first
    fireEvent.change(screen.getByPlaceholderText(/enter your task here/i), { target: { value: 'Test Task' } });
    fireEvent.click(screen.getByText(/start/i));

    // Stop the task
    fireEvent.click(screen.getByText(/stop/i));
    expect(axios.put).toHaveBeenCalled(); // You can check the specific URL if needed
  });
});
