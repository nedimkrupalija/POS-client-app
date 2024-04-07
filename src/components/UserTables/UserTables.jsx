import React, { useState } from 'react';
import './UserTables.css';

const UserTables = () => {
    
    return (
        <>
        <div className='tables-to-assign'>
            <h2 className='tables-title'>TABLES TO ASSIGN</h2>
        <div className='table'>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>User ID</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Tajra</td>
                        <td>27</td>
                        <td><button className='buttons'>ASSIGN</button></td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Amina</td>
                        <td>25</td>
                        <td><button className='buttons'>ASSIGN</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
        </div>
        </>
    );
};

export default UserTables;