import ReactDOM from 'react-dom/client'
import "./index.css"
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {WrongPage} from "./pages/WrongPage.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";
import {Oauth2callback} from "./pages/Oauth2callback.tsx";
import {CreatorPage} from "@/pages/CreatorPage.tsx";
import {EditorPage} from "@/pages/EditorPage.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path={"/"} element={<Navigate to={"/login"} replace={true}/>} />
            <Route path={"/creator"} element={<CreatorPage/>} />
            <Route path={"/editor"} element={<EditorPage/>} />
            <Route path={"/login"} element={<LoginPage/>}/>
            <Route path={"/oauth2callback"} element={<Oauth2callback/>}/>
            <Route path={"/*"} element={<WrongPage/>}/>
        </Routes>
    </BrowserRouter>

)
