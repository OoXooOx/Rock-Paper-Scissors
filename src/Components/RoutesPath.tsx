import React, { Component, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SC_BUSD from "./SC_BUSD";
import PVP_BNB from "./PVP_BNB";
import PVP_BUSD from "./PVP_BUSD";
import Home from "./Home";
import NavBar from './Navbar';
import SC_BNB from "./SC_BNB";



const RoutesPath = () => {
    const [providerUrl, setProviderUrl] = useState<string | undefined>()

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<NavBar setProviderUrl={setProviderUrl} />}>
                        <Route index element={<Home />} />
                        <Route path='SC_BNB' element={<SC_BNB providerUrl={providerUrl} />} />
                        <Route path='PVP_BNB' element={<PVP_BNB providerUrl={providerUrl}/>} />
                        <Route path='PVP_BUSD' element={<PVP_BUSD />} />
                        <Route path='SC_BUSD' element={<SC_BUSD providerUrl={providerUrl}/>} />
                        <Route path='*' element={<Navigate replace to="/" />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )

}
export default RoutesPath;