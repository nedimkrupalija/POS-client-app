import React, { useState, useEffect } from 'react';
import './Order.css';
import Cookies from 'js-cookie';
import delete_icon from '../../assets/delete.png';
import edit_icon from '../../assets/edit.png';
import items_icon from '../../assets/items.png';
import close_modal_icon from '../../assets/close-modal.png'
import more_icon from '../../assets/more.png';
import plus_icon from '../../assets/plus.png';
import minus_icon from '../../assets/minus.png';

const Order = () => {
    const [tableVisible, settableVisible] = useState(true);
    const [orders, setOrders] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const token = () => {
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InVzZXIiLCJ1c2VybmFtZSI6ImFtaW5hIiwiaWF0IjoxNzEyNzA4MDc1LCJleHAiOjE3MTI3ODYzOTl9.kuTsaq5N4FNLoe0U-OECma-u3_JrVA3EeEsRiAbgd04'//Cookies.get("jwt");
    }

    useEffect(() => {
        fetchOrders();
        checkLocationStorage();
    }, []);

    const checkLocationStorage = async () => {
        try {
            const locationId = localStorage.getItem('locationId');
            const savedLocationId = sessionStorage.getItem('locationId');
            const hasStorage = sessionStorage.getItem('hasStorage');
            if (locationId && (hasStorage === null || locationId !== savedLocationId)) {
                const headers = {
                    Authorization: token()
                };
                const storages = await fetchData('GET', `http://localhost:3000/storage`, null, headers);

                const matchingStorage = storages.find(storage => storage.LocationId === parseInt(locationId));
                if (matchingStorage) {
                    sessionStorage.setItem('hasStorage', 'true');
                    sessionStorage.setItem('storageId', matchingStorage.id);
                    sessionStorage.setItem('locationId', locationId);
                } else {
                    sessionStorage.setItem('hasStorage', 'false');
                    sessionStorage.setItem('locationId', locationId);
                }
            }
        } catch (error) {
            console.error('Error checking location storage:', error);
        }
    };
    
    const fetchOrders = async () => {
        const locationId = localStorage.getItem('locationId');
        const userId = localStorage.getItem('userId');
        if (locationId && userId) {
            const headers = {
                Authorization: token()
            };
            fetchData('GET', `http://localhost:3000/purchase-order`, null, headers)
                .then(response => {
                    console.log("Res ", response)
                    setOrders(response)
                })
                .catch(error => {
                    console.error('Error fetching purcshase orders:', error);
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

    const openModal = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    }

    return (
        <>
            <h2 className='tables-title'>{tableVisible ? "ORDERS" : "CREATE NEW ORDER"}</h2>
            <div className="buttons-container">
                <button disabled={tableVisible} className={tableVisible ? 'buttons' : 'buttons1'} onClick={() => { settableVisible(true); fetchOrders(); }}>LIST ORDERS</button>
                <button disabled={!tableVisible} className={tableVisible ? 'buttons1' : 'buttons'} onClick={() => { settableVisible(false); }}>CREATE NEW ORDER</button>
            </div>
            {tableVisible && (
                <div className='list-orders'>
                    <div className='table1'>
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Totals</th>
                                    <th>VAT</th>
                                    <th>Grand total</th>
                                    <th>Table ID</th>
                                    <th>Items</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.totals}</td>
                                        <td>{order.vat}</td>
                                        <td>{order.grandTotal}</td>
                                        <td>{order.tableId || 'Not assigned'}</td>
                                        <td>
                                            <img src={items_icon} alt="Items" className='items_icon' onClick={() => openModal(order)} />
                                        </td>
                                        <td>
                                            <img src={edit_icon} alt="Edit" className='edit_icon' />
                                            <img src={delete_icon} alt="Delete" className='delete_icon' />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {modalVisible && selectedOrder && (
                        <div className="modal-purchase-order">
                            <div className="modal-content-purchase-order">
                                <img src={close_modal_icon} onClick={() => setModalVisible(false)} alt="Close" className="close-modal-icon" />
                                <h2>ITEMS FOR ORDER #{selectedOrder.id}</h2>
                                <div className='table2'>
                                    <table border="1">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>BAR-code</th>
                                                <th>Measurement</th>
                                                <th>Purchase price</th>
                                                <th>Selling price</th>
                                                <th>VAT Id</th>
                                                <th>Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.barCode}</td>
                                                    <td>{item.measurmentUnit}</td>
                                                    <td>{item.purchasePrice}</td>
                                                    <td>{item.sellingPrice}</td>
                                                    <td>{item.VAT.id}</td>
                                                    <td>{item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>)}
            {!tableVisible && (
                <div className='create-order'>
                    <button className='buttons1'>CHOOSE ITEM</button>
                    <div className='table3'>
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Price (Excluding VAT) ($)</th>
                                    <th>Price (Including VAT) ($)</th>
                                    <th>Measurement</th>
                                    <th>BAR-code</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Voda Voda</td>
                                    <td>0.5</td>
                                    <td>1</td>
                                    <td>30</td>
                                    <th>05224678</th>
                                    <td>
                                        <img src={plus_icon} alt="Plus" className='plus_icon' />
                                    </td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>Coca Cola</td>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>50</td>
                                    <td>123456789</td>
                                    <td>
                                        <img src={plus_icon} alt="Plus" className='plus_icon' />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className='table4'>
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Price (Excluding VAT) ($)</th>
                                    <th>Price (Including VAT) ($)</th>
                                    <th>Measurement</th>
                                    <th>BAR-code</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Voda Voda</td>
                                    <td>0.5</td>
                                    <td>1</td>
                                    <td>30</td>
                                    <th>05224678</th>
                                    <td>
                                        <img src={plus_icon} alt="Plus" className='plus_icon' />
                                        1
                                        <img src={minus_icon} alt="Minus" className='minus_icon' />
                                    </td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>Coca Cola</td>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>50</td>
                                    <td>123456789</td>
                                    <td>
                                        <img src={plus_icon} alt="Plus" className='plus_icon' />
                                        1
                                        <img src={minus_icon} alt="Minus" className='minus_icon' />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <button className='buttons1'>CREATE</button>
                </div>
            )}

        </>
    );
};

export default Order;
