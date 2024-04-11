import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './UserTables.css';
import Home from '../Home/Home.jsx'
const UserTables = () => {
    const [assignedTables, setAssignedTables] = useState([]);
    const [otherTables, setOtherTables] = useState([]);
    const [selectedTables, setSelectedTables] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const token = () => {
        return Cookies.get("jwt");
    }

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        const locationId = localStorage.getItem('locationId');
        const userId = localStorage.getItem('userId');
        if (locationId && userId) {
            const headers = {
                Authorization: token()
            };
            fetchData('GET', `http://localhost:3000/location/${locationId}/tables`, null, headers)
                .then(response => {
                    const assigned = response.filter(table => parseInt(table.UserId) === parseInt(userId));
                    const others = response.filter(table => parseInt(table.UserId) !== parseInt(userId));
                    const assignedTableIds = assigned.map(table => table.id);
                    localStorage.setItem('assignedTableIds', JSON.stringify(assignedTableIds));
                    console.log("Assigned ", localStorage.getItem('assignedTableIds'))
                    setAssignedTables(assigned);
                    setOtherTables(others);
                })
                .catch(error => {
                    console.error('Error fetching tables:', error);
                });
        }
    }

    const fetchData = async (method, url, requestData = null, headers = {}) => {
        try {
            const options = {
                method: method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            };
            if (requestData) {
                options.body = JSON.stringify(requestData);
            }
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error fetching data');
            }
            const extendedToken = response.headers.get('Authorization');
            console.log(extendedToken);
            if (extendedToken) {
                Cookies.set('jwt', extendedToken, { expires: 1 / 48 });
            }
            return data;
        } catch (error) {
            throw new Error(error.message || 'Error fetching data');
        }
    };

    const handleCheckboxChange = (tableId) => {
        setSelectedTables(prevSelectedTables => {
            if (prevSelectedTables.includes(tableId)) {
                return prevSelectedTables.filter(id => id !== tableId);
            } else {
                return [...prevSelectedTables, tableId];
            }
        });
    }

    const handleAssignYourself = () => {
        setIsLoading(true);
        const headers = {
            Authorization: token()
        };
        const requestBody = {
            tables: selectedTables
        };
        fetchData('POST', 'http://localhost:3000/user/tables', requestBody, headers)
            .then(() => {
                setIsLoading(false);
                setSelectedTables([]);
                fetchTables();
            })
            .catch(error => {
                console.error('Error assigning tables:', error);
                setIsLoading(false);
            });
    }

    const handleUnassignTable = (tableId) => {
        setIsLoading(true);
        const headers = {
            Authorization: token()
        };
        const requestBody = {
            tables: [tableId]
        };
        fetchData('DELETE', 'http://localhost:3000/user/tables', requestBody, headers)
            .then(() => {
                setIsLoading(false);
                fetchTables();
            })
            .catch(error => {
                console.error('Error unassigning table:', error);
                setIsLoading(false);
            });
    }

    return (
        <Home>
        <>
            <div className='tables-to-assign'>
                <h2 className='tables-title'>TABLES TO ASSIGN</h2>
                <button className='active-buttons assign-yourself-button' onClick={handleAssignYourself} disabled={selectedTables.length === 0 || isLoading}>Assign Yourself</button>
                <div className='table'>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>User ID</th>
                                <th>Assign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {otherTables.map(table => (
                                <tr key={table.id}>
                                    <td>{table.id}</td>
                                    <td>{table.name}</td>
                                    <td>{table.UserId ? table.UserId : <div className='not-assigned-info'><strong>NOT ASSIGNED</strong></div>}</td>
                                    <td>
                                        {
                                            table.UserId ?
                                                <div className='assigned-info'><strong>ASSIGNED</strong></div> :
                                                <input
                                                    type="checkbox"
                                                    className='tables-check-box'
                                                    checked={selectedTables.includes(table.id)}
                                                    onChange={() => handleCheckboxChange(table.id)}
                                                />
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='tables-to-assign'>
                <h2 className='tables-title'>TABLES ASSIGNED TO YOU</h2>
                <div className='table'>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Unassign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedTables.map(table => (
                                <tr key={table.id}>
                                    <td>{table.id}</td>
                                    <td>{table.name}</td>
                                    <td><button className='active-buttons' onClick={() => handleUnassignTable(table.id)}>UNASSIGN</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </></Home>
    );
};

export default UserTables;
