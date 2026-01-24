import {
    createBrowserRouter,
    Navigate
} from 'react-router-dom';
import { App } from './App';
import { Feed } from './pages/Feed/Feed';
import { SinglePost } from './pages/Feed/SinglePost/SinglePost';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';

const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');
    return !!token && !!expiryDate && new Date(expiryDate) > new Date();
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: isAuthenticated()
            ? [
                {
                    index: true,
                    element: <Feed />
                },
                {
                    path: ':postId',
                    element: <SinglePost />
                }
            ]
            : [
                {
                    index: true,
                    element: <Login />
                },
                {
                    path: 'signup',
                    element: <Signup />
                },
                {
                    path: '*',
                    element: <Navigate to="/" replace />
                }
            ]
    }
]);
