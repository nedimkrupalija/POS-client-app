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
import choose_icon from '../../assets/choose.png';
import Home from '../Home/Home';
const Order = () => {
    const [tableVisible, settableVisible] = useState(true);
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [itemsFromOrder, setItemsFromOrder] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalChooseItemsVisible, setModalChooseItemsVisible] = useState(false);
    const [modalTableVisible, setModalTableVisible] = useState(false);
    const [tableId, setTableId] = useState('');

    const token = () => {
        return Cookies.get("jwt");
    }

    useEffect(() => {
        console.log("uslo");
        fetchOrders();
        checkLocationStorage();
    }, []);

    const checkLocationStorage = async () => {
        try {
            const locationId = Cookies.get('location');
            const savedLocationId = Cookies.get('locationId');
            const hasStorage = Cookies.get('hasStorage');
            if (locationId && (hasStorage === null || locationId !== savedLocationId)) {
                const headers = {
                    Authorization: token()
                };
                const storages = await fetchData('GET', `https://pos-app-backend-tim56.onrender.com/storage`, null, headers);
                const matchingStorage = storages.find(storage => storage.LocationId === parseInt(locationId));
                const endOfToday = new Date();
                endOfToday.setHours(23, 59, 59, 999);
                if (matchingStorage) {
                    Cookies.set('hasStorage', 'true', { expires: endOfToday, path: '/' });
                    Cookies.set('storageId', matchingStorage.id, { expires: endOfToday, path: '/' });

                    Cookies.set('locationId', locationId, { expires: endOfToday, path: '/' });
                } else {
                    Cookies.set('hasStorage', 'false', { expires: endOfToday, path: '/' });
                    Cookies.set('locationId', locationId, { expires: endOfToday, path: '/' });
                }
            }
        } catch (error) {
            console.error('Error checking location storage:', error);
        }
    };

    const fetchOrders = async () => {
        console.log("Uslo");
        const locationId = Cookies.get('location');
        const userId = Cookies.get('userid');
        console.log("lokacija", locationId)
        if (locationId && userId) {
            const headers = {
                Authorization: token()
            };
            fetchData('GET', `https://pos-app-backend-tim56.onrender.com/purchase-order`, null, headers)
                .then(response1 => {
                    fetchData('GET', 'https://pos-app-backend-tim56.onrender.com/location/' + Cookies.get('location') + '/tables', null, headers).then(response => {

                        console.log(Cookies.get('userid'));
                        console.log("response", response);
                        const orders = response1.filter(order => {
                            return response.some(table => table.id === order.tableId) || order.tableId === null;
                        });

                        setOrders(orders)
                    }).catch(error => {
                        console.error('Error fetching purcshase orders:', error);

                    });
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
            checkLocationStorage();
            const hasStorage = Cookies.get('hasStorage');
            if (hasStorage === 'true') {
                const storageId = Cookies.get('storageId');
                const headers = {
                    Authorization: token()
                };
                const url = `https://pos-app-backend-tim56.onrender.com/storage/${storageId}/items`;
                const response = await fetchData('GET', url, null, headers);
                console.log("Res ", response)
                setItems(response)
            } else {
                const locationId = Cookies.get('location');
                const headers = {
                    Authorization: token()
                };
                const url = `https://pos-app-backend-tim56.onrender.com/item`;
                const response = await fetchData('GET', url, null, headers);
                const filteredResponse = response.filter(item => {
                    return item.Location && item.Location.id === parseInt(locationId);
                });
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

    const fetchTables = async () => {
        const locationId = Cookies.get('location');
        const userId = Cookies.get('userid');
        if (locationId) {
            const headers = {
                Authorization: token()
            };
            fetchData('GET', `https://pos-app-backend-tim56.onrender.com/location/${locationId}/tables`, null, headers)
                .then(response => {
                    const assignedToLoggedUser = response.filter(table => parseInt(table.UserId) === parseInt(userId));
                    setTables(assignedToLoggedUser)
                })
                .catch(error => {
                    console.error('Error fetching tables:', error);
                });
        }
    }

    const createOrder = async () => {
        try {
            const itemsWithExceededQuantity = itemsFromOrder.filter(item => {
                const availableQuantity = Cookies.get('hasStorage') === 'true' ? item.StorageItem.quantity : Infinity;
                return parseFloat(item.quantity) > availableQuantity;
            });

            if (itemsWithExceededQuantity.length > 0) {
                alert('Some items have a quantity greater than available quantity. Please adjust the quantities.');
                return;
            }
            const requestData = {
                items: itemsFromOrder.map(item => ({ id: item.id, quantity: item.quantity })),
                ...(tableId && { tableId: parseInt(tableId) })
            };
            const headers = {
                Authorization: token()
            };
            const url = `https://pos-app-backend-tim56.onrender.com/purchase-order/`;
            const response = await fetchData('POST', url, requestData, headers);
            setItemsFromOrder([]);
            setTableId('');

            if (Cookies.get('hasStorage') === 'true') {
                const checkoutRequestData = {
                    Items: response.items.map(item => ({
                        id: item.id,
                        OrderItems: {
                            quantity: item.quantity
                        }
                    }))
                };
                const checkoutResponse = await fetchData('POST', 'https://pos-app-backend-tim56.onrender.com/pos/checkout', checkoutRequestData, headers);
                console.log('Checkout response:', checkoutResponse);
            }

        } catch (error) {
            console.error('Error creating order:', error);
        }
    };


    return (
        <Home>
            <>
                <h2 className='tables-title-order'>{tableVisible ? "ORDERS" : "CREATE NEW ORDER"}</h2>
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
                        <button
                            className='buttons1 create-order-button'
                            onClick={createOrder}
                            disabled={itemsFromOrder.length === 0}
                        >
                            CREATE ORDER
                        </button>
                        <button className='buttons1' onClick={() => { setModalChooseItemsVisible(true); handleChooseItems() }}>CHOOSE ITEMS</button><br />
                        <input type="text" readOnly id="findTable" className="table-id-input" placeholder="Table ID" value={tableId} onChange={(e) => setTableId(e.target.value)} />
                        <button className='select-table-button buttons1' onClick={() => { setModalTableVisible(true); fetchTables() }}>Find Table</button>
                        <button className='select-table-button buttons1' onClick={() => { setTableId('') }}>Remove Table</button>
                        {modalChooseItemsVisible && (
                            <div className="modal-choose-items">
                                <div className="modal-content-choose-items">
                                    <img src={close_modal_icon} onClick={() => setModalChooseItemsVisible(false)} alt="Close" className="close-modal-icon" />
                                    {
                                        Cookies.get('hasStorage') === 'true'
                                            ? <h2>STORAGE ITEMS</h2>
                                            : <h2>ITEMS</h2>
                                    }
                                    <div className='grid'>
                                        {items.map(item => (
                                            <div key={item.id} className='grid-item'>
                                                <h3>{item.name}</h3>
                                                <p><strong>ID:</strong> {item.id}</p>
                                                <p><strong>BAR-code:</strong> {item.barCode}</p>
                                                <p><strong>Measurement:</strong> {item.measurmentUnit}</p>
                                                <p><strong>Purchase price:</strong> {item.purchasePrice}</p>
                                                <p><strong>Selling price:</strong> {item.sellingPrice}</p>
                                                <p><strong>VAT Id:</strong> {item.VAT ? item.VAT.id : item.VATId}</p>
                                                {Cookies.get('hasStorage') === 'true' && <p><strong>Available quantity:</strong> {item.StorageItem.quantity}</p>}
                                                <div className='quantity'>
                                                    <img
                                                        src={plus_icon}
                                                        alt="Plus"
                                                        className='plus_icon'
                                                        onClick={() => {
                                                            const quantityInput = document.getElementById(`quantity_${item.id}`);
                                                            if (quantityInput) {
                                                                quantityInput.value = parseInt(quantityInput.value) + 1;
                                                            }
                                                        }}
                                                    />
                                                    <input
                                                        type="number"
                                                        id={`quantity_${item.id}`}
                                                        className="editable-input-purchase-orders"
                                                        placeholder='Quantity'
                                                        defaultValue={1}
                                                    />
                                                    <img
                                                        src={minus_icon}
                                                        alt="Minus"
                                                        className='minus_icon'
                                                        onClick={() => {
                                                            const quantityInput = document.getElementById(`quantity_${item.id}`);
                                                            if (quantityInput) {
                                                                quantityInput.value = parseInt(quantityInput.value) - 1 >= 0 ? parseInt(quantityInput.value) - 1 : 0;
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <button className="add-to-order-button" onClick={() => handleAddToOrder(item, parseInt(document.getElementById(`quantity_${item.id}`).value))}>Add to Order</button>
                                            </div>
                                        ))}
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
                                        {
                                            Cookies.get('hasStorage') === 'true' &&
                                            <th>Available quantity</th>
                                        }
                                        <th className='quantity'>Quantity</th>
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
                                            {
                                                Cookies.get('hasStorage') === 'true' &&
                                                <td>{item.StorageItem.quantity}</td>
                                            }
                                            <td className='editable-cell-purchase-orders quantity'>
                                                <img
                                                    src={plus_icon}
                                                    alt="Plus"
                                                    className='plus_icon'
                                                    onClick={() => {
                                                        const newItems = [...itemsFromOrder];
                                                        newItems[index].quantity = parseInt(newItems[index].quantity) + 1; // Povećaj za 1
                                                        setItemsFromOrder(newItems);
                                                    }}
                                                />
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
                                                <img
                                                    src={minus_icon}
                                                    alt="Minus"
                                                    className='minus_icon'
                                                    onClick={() => {
                                                        const newItems = [...itemsFromOrder];
                                                        const updatedQuantity = parseInt(newItems[index].quantity) - 1;
                                                        newItems[index].quantity = updatedQuantity >= 0 ? updatedQuantity : 0; // Smanji za 1, minimalno 0
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
                {modalTableVisible && (
                    <div className="modal-table">
                        <div className="modal-table-content">
                            <img src={close_modal_icon} onClick={() => setModalTableVisible(false)} alt="Close" className="close-modal-icon" />
                            <h2 className='select-table-title'>TABLES ASSIGNED TO YOU</h2>
                            <div className='table5'>
                                <table border="1">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tables.map(table => (
                                            <tr key={table.id}>
                                                <td>{table.id}</td>
                                                <td>{table.name}</td>
                                                <td><img onClick={() => { setTableId(table.id); setModalTableVisible(false); }} src={choose_icon} alt="Choose" className='choose-icon' /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </></Home>
    );
};

export default Order;