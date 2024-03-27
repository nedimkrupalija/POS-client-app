import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import Login from '../components/Login/Login';
import '@testing-library/jest-dom'

jest.mock('axios');



describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login />);
    const logins = screen.getAllByText('Login');
    expect(logins[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    
  });

  test('handles successful login', async () => {
    const token = 'mocked-token';
    axios.post.mockResolvedValueOnce({ data: {"message":"User not found"} });
    
    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'test' },
    });
    const logins = screen.getAllByText('Login');
    fireEvent.click(logins[1]);
    
    await waitFor(() => {
       expect(axios.post).toHaveBeenCalledTimes(1);
      
      expect(axios.post).toHaveBeenCalledWith(
        'https://pos-app-backend-tim56.onrender.com/auth/login',
        {
          username: 'test',
          password: 'test',
          role: 'user',
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      
    });
    expect(screen.queryByText('Molimo unesite email i lozinku.')).not.toBeInTheDocument();
      expect(screen.queryByText('Pogrešno korisničko ime ili lozinka.')).not.toBeInTheDocument();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  test('handles failed login', async () => {
    axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    let logins = screen.getAllByText('Login');
    fireEvent.click(logins[1]);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://pos-app-backend-tim56.onrender.com/auth/login',
        {
          username: 'test@example.com',
          password: 'password',
          role: 'user',
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(screen.queryByText('Molimo unesite email i lozinku.')).not.toBeInTheDocument();
      expect(screen.getByText('Pogrešno korisničko ime ili lozinka.')).toBeInTheDocument();
      const logins = screen.getAllByText('Login');
      expect(logins[1]).toBeInTheDocument();
    });
  });

  test("empty email and password",() => {
    render(<Login />);
    let logins = screen.getAllByText('Login');
    fireEvent.click(logins[1]);
    expect(screen.getByText('Molimo unesite email i lozinku.')).toBeInTheDocument();
    expect(screen.queryByText('Pogrešno korisničko ime ili lozinka.')).not.toBeInTheDocument();
    expect(screen.getAllByText('Login')[1]).toBeInTheDocument();
  });

});
