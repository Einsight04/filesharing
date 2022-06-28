import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux'
import {Routes, Route, useNavigate} from 'react-router-dom';
import './index.css';
import {login} from './redux/user'
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoutes from "./authentication/ProtectedRoutes";
import Files from "./pages/Files";

const App = () => {
    return (
        <div className='App'>
            <Navbar/>
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='login' element={<Login/>}/>
                <Route path='register' element={<Register/>}/>
                <Route path='contact' element={<Contact/>}/>
                <Route element={<ProtectedRoutes/>}>
                    <Route path='files' element={<Files/>}/>
                </Route>
            </Routes>
        </div>
    )
}

export default App;
