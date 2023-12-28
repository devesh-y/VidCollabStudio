import ReactDOM from 'react-dom/client'
import "./index.css"
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {WrongPage} from "./pages/WrongPage/WrongPage.tsx";
import {AuthPage} from "./pages/AuthPage/AuthPage.tsx";
import {Oauth2callback} from "./pages/Oauth2callback/Oauth2callback.tsx";
import {CreatorHomePage} from "./pages/CreatorHomePage/CreatorHomePage.tsx";
ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path={"/"} element={<Navigate to={"/login"} replace={true}/>} />
            <Route path={"/creator"} element={<CreatorHomePage/>} />
            <Route path={"/login"} element={<AuthPage/>}/>
            <Route path={"/oauth2callback"} element={<Oauth2callback/>}/>
            <Route path={"/*"} element={<WrongPage/>}/>
        </Routes>
    </BrowserRouter>

)
