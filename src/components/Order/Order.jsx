import React, { useState } from 'react';
import './Order.css';
import delete_icon from '../../assets/delete.png';
import edit_icon from '../../assets/edit.png';
import more_icon from '../../assets/more.png';
import plus_icon from '../../assets/plus.png';

const Order = () => {
    
    return (
        <>
        <div className='list-orders'>
            <h2 className='tables-title'>ORDERS</h2>
            <div className='buttons-container'>
                <button className='buttons'>LIST ORDERS</button>
                <button className='buttons1'>CREATE NEW ORDER</button>
            </div>
            <div className='table'>
                <table border="1">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>VAT price</th>
                            <th>Total Price (Excluding VAT)</th>
                            <th>Total Price (Including VAT)</th>
                            <th>Location ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>1</td>
                            <td>2</td>
                            <td>3</td>
                            <td>15</td>
                            <td>
                                <img src={edit_icon} alt="Edit" className='edit_icon' />
                                <img src={delete_icon} alt="Delete" className='delete_icon' />
                                <img src={more_icon} alt="More" className='more_icon' />
                            </td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>0.5</td>
                            <td>2</td>
                            <td>2.5</td>
                            <td>7</td>
                            <td>
                                <img src={edit_icon} alt="Edit" className='edit_icon' />
                                <img src={delete_icon} alt="Delete" className='delete_icon' />
                                <img src={more_icon} alt="More" className='more_icon' />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='table'>
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
                                <img src={edit_icon} alt="Edit" className='edit_icon' />
                                <img src={delete_icon} alt="Delete" className='delete_icon' />
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
                                <img src={edit_icon} alt="Edit" className='edit_icon' />
                                <img src={delete_icon} alt="Delete" className='delete_icon' />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>


        <div className='create-order'>
        <div className='table'>
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
        </div>

        </>
    );
};

export default Order;