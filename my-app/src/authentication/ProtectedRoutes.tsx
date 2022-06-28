import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import type {RootState} from '../redux/store'
import {useSelector, useDispatch} from 'react-redux'
import {useEffect} from "react";
import {login} from "../redux/user";


const ProtectedRoutes = () => {
    const loggedIn: boolean = useSelector((state: RootState) => state.user.loggedIn);

    return (
        loggedIn ? <Outlet/> : <Navigate to='/login'/>
    )
}

export default ProtectedRoutes;
