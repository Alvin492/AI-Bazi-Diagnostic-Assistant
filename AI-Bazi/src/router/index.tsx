import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import NotFound from '../components/NotFound';
import Layout from '../components/Layout';
import SplashScreen from '../components/SplashScreen';
import Profile from '../pages/Profile';

//yl
import App from "../App";
const route = createBrowserRouter([
    {
        path:"/",
        element:<SplashScreen></SplashScreen>
    },
    {
        path: "/home",
        element: <Layout></Layout>,
        children:[
            {
                path: "index",
                element: <Home></Home>
            },
            {
                path:"profile",
                element:<Profile></Profile>
            }
        ]
    }, 
    {
        path:"*",
        element:<NotFound></NotFound>
    },
  
    {
        path:"/chat",
        element:<App></App>
    }
])
export default route