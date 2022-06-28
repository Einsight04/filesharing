import React, {useState} from 'react';
import {Link} from "react-router-dom";
import {useNavigate} from "react-router-dom";
import {useDispatch} from 'react-redux'
import {login, setFirstName, setLastName, setEmail} from '../redux/user';

interface FieldValueState {
    email: string;
    password: string;
}

const Login = (): JSX.Element => {
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const [error, setError] = useState<string>('');
    const [fieldValues, setFieldValues] = useState<FieldValueState>({
        email: '',
        password: '',
    });



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        console.log(fieldValues);

        const response: Response = await fetch(`http://localhost:4000/api/users/login`, {
            method: "POST",
            body: JSON.stringify(fieldValues),
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log(response.status);

        if (response.status !== 200) {
            setError('error');
            return;
        }

        const data = await response.json();

        document.cookie = `token=${data.token}`;

        dispatch(login());
        dispatch(setFirstName(data.firstName));
        dispatch(setLastName(data.lastName));
        dispatch(setEmail(data.email));

        navigate('/files');
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.name)
        setFieldValues({
            ...fieldValues,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className='login'>
            <form noValidate onSubmit={handleSubmit}>
                <label>Email</label>
                <input type={'text'} name='email' value={fieldValues.email} onChange={e => {
                    handleChange(e)
                }} required/>
                <label>Password</label>
                <input type={'text'} name='password' value={fieldValues.password} onChange={e => {
                    handleChange(e)
                }} required/>
                <button>
                    Send submit
                </button>
            </form>
            {error && <p>{error}</p>}
            <Link to='/register'>Click to register</Link>
        </div>
    );
};

export default Login;