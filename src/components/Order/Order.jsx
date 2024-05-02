import React, { useState, useEffect, useRef } from 'react';
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
import { FaPrint } from 'react-icons/fa';

import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const Order = () => {
    const [tableVisible, settableVisible] = useState(true);
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [itemsFromOrder, setItemsFromOrder] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalKeyboardVisible, setModalKeyboardVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalChooseItemsVisible, setModalChooseItemsVisible] = useState(false);
    const [closeItemsModalVisible, setCloseItemsModalVisible] = useState(true);
    const [closeKeyboardModalVisible, setCloseKeyboardModalVisible] = useState(false);
    const [modalTableVisible, setModalTableVisible] = useState(false);
    const [tableId, setTableId] = useState('');
    const [status, setStatus] = useState('');
    const [holdedItem, setHoldedItem] = useState(null)
    const [input, setInput] = useState('');
    const [longPress, setLongPress] = useState(false);
    const timeoutRef = useRef(null);


    const onKeyPress = (button) => {
        if (button === "{bksp}") {
            setInput((prevInput) => prevInput.slice(0, -1));
        } else if (!isNaN(button)) {
            setInput((prevInput) => prevInput + button);
        }
    };

    const handleMouseDown = (item, quantity) => {
        timeoutRef.current = setTimeout(() => {
            setLongPress(true);
            setHoldedItem(item)
            setModalKeyboardVisible(true);
            setCloseItemsModalVisible(false);
            setCloseKeyboardModalVisible(true);
        }, 500);
    };

    const handleMouseUp = (item, quantity) => {
        clearTimeout(timeoutRef.current);
        if (!longPress) {
            handleAddToOrder(item, quantity)
        } else {
        }
        setLongPress(false);
    };


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
        const locationId = Cookies.get('location');
        const userId = Cookies.get('userid');
        if (locationId && userId) {
            const headers = {
                Authorization: token()
            };
            fetchData('GET', `https://pos-app-backend-tim56.onrender.com/purchase-order/location/${locationId}`, null, headers)
                .then(response1 => {
                    fetchData('GET', 'https://pos-app-backend-tim56.onrender.com/location/' + Cookies.get('location') + '/tables', null, headers).then(response => {
console.log(response);
                        const orders = response1.filter(order => {
                            return response.some(table => table.id === order.TableId) || order.TableId === null;
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


    const finishOrder = async (order) => {
        try {

            const headers = {
                Authorization: token()
            };

            await fetchData('PUT', 'https://pos-app-backend-tim56.onrender.com/purchase-order/status/' + order.id, { status: "finished" }, headers)
            const updatedOrders = orders.map(ord => {
                if (ord.id === order.id) {
                    return { ...ord, status: "finished" };
                } else {
                    return ord;
                }
            });
            setOrders(updatedOrders);
            setStatus("finshed");
            if (Cookies.get('hasStorage') === 'true') {
                const checkoutRequest = {
                    Items: order.Items.map(item => ({
                        id: item.id,
                        OrderItems: {
                            quantity: item.PurchaseItem.quantity
                        }
                    }))
                };
                const checkoutResponse = await fetchData('POST', 'https://pos-app-backend-tim56.onrender.com/pos/checkout', checkoutRequest, headers);
                console.log('Checkout response:', checkoutResponse);
            }
        } catch (error) {

        }
    }

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
        if (!quantity) {
            setCloseKeyboardModalVisible(false);
            setModalKeyboardVisible(false);
            setCloseItemsModalVisible(true);
            setInput('');
            return;
        }
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
        setCloseKeyboardModalVisible(false);
        setModalKeyboardVisible(false);
        setCloseItemsModalVisible(true);
        setInput('');
    };
    const handleAddToOrderFromKeyboard = (item, quantity) => {
        if (quantity === null) {
            setCloseKeyboardModalVisible(false);
            setModalKeyboardVisible(false);
            setCloseItemsModalVisible(true);
            setInput('');
            console.log("Ok")
            return;
        }
        const parsedQuantity = parseFloat(quantity);
        if (parsedQuantity === 0) {
            const updatedItems = itemsFromOrder.filter(orderItem => orderItem.id !== item.id);
            setItemsFromOrder(updatedItems);
            setCloseKeyboardModalVisible(false);
            setModalKeyboardVisible(false);
            setCloseItemsModalVisible(true);
            setInput('');
            return;
        }
        const existingItemIndex = itemsFromOrder.findIndex(orderItem => orderItem.id === item.id);
        if (existingItemIndex !== -1) {
            const updatedItems = [...itemsFromOrder];
            updatedItems[existingItemIndex].quantity = parsedQuantity;
            setItemsFromOrder(updatedItems);
        } else {
            const newItem = { ...item, quantity: parsedQuantity };
            setItemsFromOrder([...itemsFromOrder, newItem]);
        }
        setCloseKeyboardModalVisible(false);
        setModalKeyboardVisible(false);
        setCloseItemsModalVisible(true);
        setInput('');
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
                ...(tableId && { tableId: parseInt(tableId) }),
                ...({ status: "pending" }),
                ...({ locationId: Cookies.get('location') })
            };
            const headers = {
                Authorization: token()
            };
            console.log("DATA")
            console.log(requestData)
            const url = `https://pos-app-backend-tim56.onrender.com/purchase-order/`;
            const response = await fetchData('POST', url, requestData, headers);
            setItemsFromOrder([]);
            setTableId('');



        } catch (error) {
            console.error('Error creating order:', error);
        }
    };
    const printInvoice = async (order) => {
        try {
          
            const url = `https://pos-app-backend-tim56.onrender.com/purchase-order/${order.id}`;
const response1=await fetch(url, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        Authorization: token()
        }});         
        const data = await response1.json(); 
        console.log(data); 
                    const response = await fetch('https://pos-app-backend-tim56.onrender.com/purchase-order/invoice-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token()
                },
                body: JSON.stringify({ tableData: data })
            });
            if (response.ok) {
                const pdfBlob = await response.blob();
                
                const pdfUrl = URL.createObjectURL(pdfBlob);
    
                window.open(pdfUrl, '_blank');
            } else {
                console.error('Error generating PDF:', response.statusText);
            }
        } catch (error) {
            console.error('Error printing invoice:', error);
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

                                        <th>Status</th>
                                        <th>Items</th>

                                        <th>Finish order</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (

                                        <tr key={order.id}>
                                            <td>{order.id}</td>
                                            <td>{order.totals}</td>
                                            <td>{order.vat}</td>
                                            <td>{order.grandTotal}</td>


                                            <td>{order.TableId || 'Not assigned'}</td>
                                            <td>{order.status}</td>
                                            <td>
                                                <img src={items_icon} alt="Items" className='items_icon' onClick={() => openModal(order)} />
                                            </td>
                                            {order.status === 'pending' ? (
    <td>
        <img src={items_icon} alt="Finish" className='items_icon' onClick={() => finishOrder(order)} />
    </td>
) : (
    <td>
        <button onClick={() => printInvoice(order)}><FaPrint/></button>
    </td>
)}

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
                                                {selectedOrder.Items.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.id}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.barCode}</td>
                                                        <td>{item.measurmentUnit}</td>
                                                        <td>{item.purchasePrice}</td>
                                                        <td>{item.sellingPrice}</td>
                                                        <td>{item.VATId}</td>
                                                        <td>{item.PurchaseItem.quantity}</td>
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
                                    {closeItemsModalVisible && <img src={close_modal_icon} onClick={() => { setModalChooseItemsVisible(false); setModalKeyboardVisible(false) }} alt="Close" className="close-modal-icon" />}
                                    {
                                        Cookies.get('hasStorage') === 'true'
                                            ? <h2>STORAGE ITEMS</h2>
                                            : <h2>ITEMS</h2>
                                    }
                                    <div className='grid'>
                                        {items.map(item => {
                                            const currentItemIndex = itemsFromOrder.findIndex(orderItem => orderItem.id === item.id);
                                            const currentItem = currentItemIndex !== -1 ? itemsFromOrder[currentItemIndex] : null;
                                            return (
                                                <div key={item.id}
                                                    className='grid-item'
                                                    onMouseDown={() => { handleMouseDown(item, 1) }}
                                                    onMouseUp={() => { handleMouseUp(item, 1) }}>
                                                    <h3>{item.name}</h3>
                                                    <p className='grid-item-price'>{item.sellingPrice} $</p>
                                                    {currentItem && <p>Quantity: {currentItem.quantity}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {modalKeyboardVisible && holdedItem && (
                                        <div className="modal-keyboard-input">
                                            <div className="modal-content-keyboard-input">
                                                {closeKeyboardModalVisible && <img src={close_modal_icon} onClick={() => { setModalKeyboardVisible(false); setCloseItemsModalVisible(true); setCloseKeyboardModalVisible(false); setInput('') }} alt="Close" className="close-modal-icon" />}
                                                <h2>Enter quantity for {holdedItem.name}</h2>
                                                <div>
                                                    <input
                                                        id={`quantity_${holdedItem.id}`}
                                                        type="text"
                                                        value={input}
                                                        onChange={(e) => setInput(e.target.value)}
                                                        className='keyboard-input'
                                                    />
                                                    <Keyboard
                                                        layout={{
                                                            default: ['1 2 3', '4 5 6', '7 8 9', '{bksp} 0']
                                                        }}
                                                        onKeyPress={onKeyPress}
                                                    />
                                                </div>
                                                <button className='buttons1 add-to-order' onClick={() => { handleAddToOrderFromKeyboard(holdedItem, parseInt(document.getElementById(`quantity_${holdedItem.id}`).value)) }}>ADD</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className='grid items-from-order-grid'>
                            {itemsFromOrder.map(item => {
                                return (
                                    <div key={item.id}
                                        className='grid-item'
                                        onMouseDown={() => { handleMouseDown(item, 1) }}
                                        onMouseUp={() => { handleMouseUp(item, 1) }}>
                                        <h3>{item.name}</h3>
                                        <p className='grid-item-price'>{item.sellingPrice} $</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <button
                                            className='buttons1 remove-from-order'
                                            onClick={() => {
                                                const updatedItems = itemsFromOrder.filter(orderItem => orderItem.id !== item.id);
                                                setItemsFromOrder(updatedItems);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        {modalKeyboardVisible && holdedItem && (
                            <div className="modal-keyboard-input">
                                <div className="modal-content-keyboard-input">
                                    {closeKeyboardModalVisible && <img src={close_modal_icon} onClick={() => { setModalKeyboardVisible(false); setCloseItemsModalVisible(true); setCloseKeyboardModalVisible(false); setInput('') }} alt="Close" className="close-modal-icon" />}
                                    <h2>Enter quantity for {holdedItem.name}</h2>
                                    <div>
                                        <input
                                            id={`quantity_${holdedItem.id}`}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            className='keyboard-input'
                                        />
                                        <Keyboard
                                            layout={{
                                                default: ['1 2 3', '4 5 6', '7 8 9', '{bksp} 0']
                                            }}
                                            onKeyPress={onKeyPress}
                                        />
                                    </div>
                                    <button className='buttons1 add-to-order' onClick={() => { handleAddToOrderFromKeyboard(holdedItem, parseInt(document.getElementById(`quantity_${holdedItem.id}`).value)) }}>ADD</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {modalTableVisible && (
                    <div className="modal-table">
                        <div className="modal-table-content">
                            <img src={close_modal_icon} onClick={() => setModalTableVisible(false)} alt="Close" className="close-modal-icon" />
                            <h2 className='select-table-title'>TABLES ASSIGNED TO YOU</h2>

                            <div className='grid'>
                                {tables.map(table => {
                                    return (
                                        <div key={table.id}
                                            className='grid-item'
                                            onClick={() => { setTableId(table.id); setModalTableVisible(false); }}>
                                            <h3>{table.name}</h3>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </></Home>
    );
};

export default Order;