import {createSlice} from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit'

export interface UserState {
    loggedIn: boolean
    firstName: string
    lastName: string
    email: string
}

const initialState: UserState = {
    loggedIn: false,
    firstName: '',
    lastName: '',
    email: ''
}

export const counterSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state) => {
            state.loggedIn = true
        },
        logout: (state) => {
            state.loggedIn = false
        },
        setFirstName: (state, action: PayloadAction<string>) => {
            state.firstName = action.payload
        },
        setLastName: (state, action: PayloadAction<string>) => {
            state.lastName = action.payload
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload
        }
    },
})

// Action creators are generated for each case reducer function
export const {login, logout, setFirstName, setLastName, setEmail} = counterSlice.actions

export default counterSlice.reducer