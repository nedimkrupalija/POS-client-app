import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import Login from '../components/Login/Login';
import '@testing-library/jest-dom'


global.fetch = jest.fn();


describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders login form', () => {
    render(<Login />);
    const logins = screen.getAllByText('Login');
    expect(logins[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('PIN')).toBeInTheDocument();
    
  });

  
  test('redirects to home on successful login', async () => {
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'mocked_token' }),
    });

    render(<Login />);

    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('PIN'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Log in'));

  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Manager app')).toBeInTheDocument();
      
    });

 
   
  });


  test('displays error message on unsuccessful login', async () => {
   
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'User not found' }),
    });

    render(<Login />);

  
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('PIN'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Log in'));

  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });

 
    
  });
  test('displays error message for empty email and password', async () => {
   

  
    

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'User not found' }),
    });

    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('PIN'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Log in'));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('User not found')).toBeInTheDocument();
      
    });

  
  });

});
