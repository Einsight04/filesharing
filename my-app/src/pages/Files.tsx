import React, {useEffect} from 'react';
import {useState} from "react";
import type { RootState } from '../redux/store'
import { useSelector, useDispatch } from 'react-redux'

const Home = () => {
    const firstName = useSelector((state: RootState) => state.user.firstName)

    return (
        <div>
            <h1>Files</h1>
            <p>Hello {firstName}</p>
        </div>
    );
};

export default Home;
