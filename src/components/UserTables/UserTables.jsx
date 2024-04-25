import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './UserTables.css';
import Grid from '@mui/material/Grid'; // Grid version 1
import Home from '../Home/Home.jsx'
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
const UserTables = () => {
    const [assignedTables, setAssignedTables] = useState([]);
    const [otherTables, setOtherTables] = useState([]);
    const [selectedTables, setSelectedTables] = useState([]);
    const [selectedUnassignTable, setSelectedUnassignTable] = useState(null);
    const [selectedUnassignTables, setSelectedUnassignTables] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const token = () => {
        return Cookies.get("jwt");
    }

    const selectTable = (table) => {
        setSelectedTable(selectedTable === table ? null : table);
    }

    const selectUnassignTable = (table) => {
        setSelectedUnassignTable(selectedUnassignTable === table ? null : table);
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
            fetchData('GET', `https://pos-app-backend-tim56.onrender.com/location/${locationId}/tables`, null, headers)
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

    const handleUnassignTableCheck = (tableId) => {




        setSelectedUnassignTables(prevSelectedUnassignTables => {
            if (prevSelectedUnassignTables.includes(tableId)) {
                return prevSelectedUnassignTables.filter(id => id !== tableId);
            } else {
                return [...prevSelectedUnassignTables, tableId];
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
        fetchData('POST', 'https://pos-app-backend-tim56.onrender.com/user/tables', requestBody, headers)
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
            tables: selectedUnassignTables
        };
        fetchData('DELETE', 'https://pos-app-backend-tim56.onrender.com/user/tables', requestBody, headers)
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
                <div>
                    <h2 className='tables-title'>TABLES ON LOCATION</h2>
                </div>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 5, sm: 8, md: 12 }}>

                    {otherTables.map((table, index) => {

                        let backgroundColor = table.UserId ? 'orangered' : 'springgreen';
                        if (selectedTables.includes(table.id)) {
                            backgroundColor = 'skyblue';
                        }
                        return (
                            <Grid item xs={6} sm={6} md={4} key={index}>
                                <Paper
                                    style={{
                                        backgroundColor: backgroundColor,
                                        padding: 40,
                                        cursor: 'pointer', 
                                    }}
                                    onClick={() => {
                                        if (table.UserId == null) {

                                            handleCheckboxChange(table.id)
                                            selectTable(table)
                                        }
                                    }
                                    } 
                                >
                                    {table.name}
                                </Paper>
                            </Grid>
                        );
                    })}




                </Grid>


                <div>
                    <button className='active-buttons' onClick={handleAssignYourself} disabled={selectedTables.length === 0 || isLoading}>Assign Yourself</button>
                </div>


                <div>
                    <h2 className='tables-title'>TABLES ASSIGNED TO YOU</h2>

                </div>






                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {assignedTables.map((table, index) => {

                        let bgColor = "springgreen"

                        if (selectedUnassignTables.includes(table.id)) {
                            bgColor = 'skyblue';
                        }
                        return (
                            <Grid item xs={2} sm={4} md={4} key={index}>
                                <Paper
                                    style={{
                                        backgroundColor: bgColor,
                                        padding: 40,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => {


                                        handleUnassignTableCheck(table.id)
                                        selectUnassignTable(table)
                                    }

                                    } 
                                >
                                    {table.name}
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
                <div>
                    <button className='active-buttons ' onClick={handleUnassignTable} disabled={selectedUnassignTables.length === 0 || isLoading}>Unassign Yourself</button>
                </div>
            </></Home>
    );
};


export default UserTables;
