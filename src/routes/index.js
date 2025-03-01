import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Page } from "../Components/Page";

export default function appRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Page/>} />
            </Routes>
        </Router>
    )
} 