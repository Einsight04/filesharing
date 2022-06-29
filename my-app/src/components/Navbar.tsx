import React, {useEffect} from 'react';
import {Link} from 'react-router-dom'
import {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {clearUser, logout} from "../redux/user";
import type {RootState} from '../redux/store';
import {Dispatch} from "@reduxjs/toolkit";

const Navbar = (): JSX.Element => {
    const dispatch: Dispatch = useDispatch();

    const loggedIn: boolean = useSelector((state: RootState) => state.user.loggedIn);
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        if (loggedIn) {
            setOptions(['contact', 'dashboard'])
        } else {
            setOptions(['contact', 'login'])
        }
    }, [loggedIn])

    const handleLogout = () => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        dispatch(logout());
        dispatch(clearUser());
    }

    return (
        <div className='navbar'>
            <nav className='nav-links'>
                <Link key='home' to='/'>home</Link>
                {options.map((page: string) => (
                    <Link key={page} to={page}>{page}</Link>
                ))}
                {loggedIn &&
                    <Link key='logout' to='/' onClick={handleLogout}>logout</Link>
                }
            </nav>
        </div>
    );
};

export default Navbar;