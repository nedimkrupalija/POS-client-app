import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import {BsCart3, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, 
  BsListCheck, BsMenuButtonWideFill, BsFillGearFill, BsPercent} from 'react-icons/bs';
import './Sidebar.css';

function Sidebar({openSidebarToggle, OpenSidebar}) {
  
    

    return (
        <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive": ""}>
            <div className='sidebar-title'>
                <div className='sidebar-brand'>
                    <BsCart3  className='icon_header'/> Point of Sale software
                </div>
                <span className='icon close_icon' onClick={OpenSidebar}>X</span>
            </div>

            <ul className='sidebar-list'>
               
                <li className='sidebar-list-item'>
                    <Link to="/tables"> 
                        <BsMenuButtonWideFill className='icon'/> Tables
                    </Link>
                </li>
                <li className='sidebar-list-item'>
                    <Link to="/purchase-orders">
                        <BsListCheck className='icon'/> Purchase orders
                    </Link>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;
