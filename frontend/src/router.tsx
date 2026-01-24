import {
    createBrowserRouter,
    Navigate
} from 'react-router-dom';
import App from './App';
import FeedPage from './pages/Feed/Feed';
import SinglePostPage from './pages/Feed/SinglePost/SinglePost';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';

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
                    element: <FeedPage />
                },
                {
                    path: ':postId',
                    element: <SinglePostPage />
                }
            ]
            : [
                {
                    index: true,
                    element: <LoginPage />
                },
                {
                    path: 'signup',
                    element: <SignupPage />
                },
                {
                    path: '*',
                    element: <Navigate to="/" replace />
                }
            ]
    }
]);
