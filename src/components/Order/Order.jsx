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
    const [items, setItems] = useState([]);
    const [itemsFromOrder, setItemsFromOrder] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalChooseItemsVisible, setModalChooseItemsVisible] = useState(false);

    const token = () => {
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InVzZXIiLCJ1c2VybmFtZSI6ImFtaW5hIiwiaWF0IjoxNzEyNzg2NTI3LCJleHAiOjE3MTI4NzI3OTl9.1iZx7E6mZ9igxpax1aF9JEbEtxADMabreU7cp4c_SbM'//Cookies.get("jwt");
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
    const handleChooseItems = async () => {
        try {
            const hasStorage = sessionStorage.getItem('hasStorage');
            if (hasStorage === 'true') {
                const storageId = sessionStorage.getItem('storageId');
                const headers = {
                    Authorization: token()
                };
                const url = `http://localhost:3000/storage/${storageId}/items`;
                const response = await fetchData('GET', url, null, headers);
                setItems(response)
            } else {
                const locationId = localStorage.getItem('locationId');
                const headers = {
                    Authorization: token()
                };
                const url = `http://localhost:3000/item`;
                const response = await fetchData('GET', url, null, headers);
                const filteredResponse = response.filter(item => item.Location.id === parseInt(locationId));
                setItems(filteredResponse)
            }
        } catch (error) {
            console.error('Error choosing items:', error);
        }
    };

    const handleAddToOrder = (item, quantity) => {
        const parsedQuantity = parseFloat(quantity);

        const existingItemIndex = itemsFromOrder.findIndex(orderItem => orderItem.id === item.id);
        if (existingItemIndex !== -1) {
            const updatedItems = [...itemsFromOrder];
            const existingQuantity = parseFloat(updatedItems[existingItemIndex].quantity);
            updatedItems[existingItemIndex].quantity = existingQuantity + parsedQuantity;
            setItemsFromOrder(updatedItems);
        } else {
            const newItem = { ...item, quantity: parsedQuantity };
            setItemsFromOrder([...itemsFromOrder, newItem]);
        }
    };

    const handleRemoveFromOrder = (index) => {
        const updatedItems = [...itemsFromOrder];
        updatedItems.splice(index, 1);
        setItemsFromOrder(updatedItems);
    };

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
                    <h3 className='order-items-title'>ITEMS FROM YOUR ORDER</h3>
                    <button className='buttons1 create-order-button'>CREATE ORDER</button>
                    <button className='buttons1' onClick={() => { setModalChooseItemsVisible(true); handleChooseItems() }}>CHOOSE ITEMS</button>
                    {modalChooseItemsVisible && (
                        <div className="modal-choose-items">
                            <div className="modal-content-choose-items">
                                <img src={close_modal_icon} onClick={() => setModalChooseItemsVisible(false)} alt="Close" className="close-modal-icon" />
                                <h2>ITEMS</h2>
                                <div className='table3'>
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
                                                <th>Add to order</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.barCode}</td>
                                                    <td>{item.measurmentUnit}</td>
                                                    <td>{item.purchasePrice}</td>
                                                    <td>{item.sellingPrice}</td>
                                                    <td>{item.VAT ? item.VAT.id : item.VATId}</td>
                                                    <td className='editable-cell-purchase-orders'>
                                                        <input id={`quantity_${item.id}`} className="editable-input-purchase-orders" type="number" placeholder='Quantity' defaultValue={1}></input>
                                                    </td>
                                                    <td>
                                                        <img src={plus_icon} alt="Plus" className='plus_icon' onClick={() => handleAddToOrder(item, parseInt(document.getElementById(`quantity_${item.id}`).value))} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='table4'>
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
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemsFromOrder.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.barCode}</td>
                                        <td>{item.measurmentUnit}</td>
                                        <td>{item.purchasePrice}</td>
                                        <td>{item.sellingPrice}</td>
                                        <td>{item.VAT ? item.VAT.id : item.VATId}</td>
                                        <td className='editable-cell-purchase-orders'>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                className="editable-input-purchase-orders"
                                                onChange={(e) => {
                                                    const newItems = [...itemsFromOrder];
                                                    newItems[index].quantity = e.target.value;
                                                    setItemsFromOrder(newItems);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <img src={minus_icon} alt="Minus" className='minus_icon' onClick={() => handleRemoveFromOrder(index)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default Order;