import React, {useEffect} from 'react';
import {useState} from "react";
import type {RootState} from '../redux/store'
import {useSelector, useDispatch} from 'react-redux'

const Dashboard = () => {
    const firstName = useSelector((state: RootState) => state.user.firstName)

    const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        console.log(`Uploading file: ${e.target.files![0].name}`);

        const file = e.target.files![0];

        const formData = new FormData();
        formData.append(file.name, file, file.name);

        const response = await fetch(`http://localhost:4000/api/files/upload`, {
            method: "POST",
            headers: {
                "Content-Type": "multipart/form-data; boundary=MyBoundary"
            },
            body: formData
        });

        console.log(response.status);
    }


    return (
        <div className='Dashboard'>
            <h1>Dashboard</h1>
            <p>Welcome back, {firstName}!</p>

            <label>Upload a file</label>
            <br/>
            <input type={'file'} onChange={uploadFile}/>
        </div>

    );
};

export default Dashboard;
