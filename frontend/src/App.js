import  { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes, Navigate, withRouter } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Backdrop from './components/Backdrop/Backdrop';
import Toolbar from './components/Toolbar/Toolbar';
import MainNavigation from './components/Navigation/MainNavigation/MainNavigation';
import MobileNavigation from './components/Navigation/MobileNavigation/MobileNavigation';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';
import FeedPage from './pages/Feed/Feed';
import SinglePostPage from './pages/Feed/SinglePost/SinglePost';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';
import './App.css';

const App = (props) => {
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAuth, setIsAuth] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  const logoutTimer = useRef(null);

  const logoutHandler = useCallback(() => {
    setIsAuth(false);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');
  }, []);

  const setAutoLogout = useCallback((milliseconds) => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    logoutTimer.current = setTimeout(() => {
      logoutHandler();
    }, milliseconds);
  }, [logoutHandler]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }
    const userId = localStorage.getItem('userId');
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    setIsAuth(true);
    setToken(token);
    setUserId(userId);
    setAutoLogout(remainingMilliseconds);

    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
    };
  }, [logoutHandler, setAutoLogout]);

  const mobileNavHandler = (isOpen) => {
    setShowMobileNav(isOpen);
    setShowBackdrop(isOpen);
  };

  const backdropClickHandler = () => {
    setShowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  };

  const loginHandler = (event, authData) => {
    event.preventDefault();
    setAuthLoading(true);
    fetch('URL')
      .then(res => {
        if (res.status === 422) {
          throw new Error('Validation failed.');
        }
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Could not authenticate you!');
        }
        return res.json();
      })
      .then(resData => {
        setIsAuth(true);
        setToken(resData.token);
        setAuthLoading(false);
        setUserId(resData.userId);
        localStorage.setItem('token', resData.token);
        localStorage.setItem('userId', resData.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
        localStorage.setItem('expiryDate', expiryDate.toISOString());
        setAutoLogout(remainingMilliseconds);
      })
      .catch(err => {
        console.log(err);
        setIsAuth(false);
        setAuthLoading(false);
        setError(err);
      });
  };

  const signupHandler = (event, authData) => {
    event.preventDefault();
    setAuthLoading(true);
    fetch('URL')
      .then(res => {
        if (res.status === 422) {
          throw new Error("Validation failed. Make sure the email address isn't used yet!");
        }
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Creating a user failed!');
        }
        return res.json();
      })
      .then(resData => {
        setIsAuth(false);
        setAuthLoading(false);
        if (props.history && props.history.replace) {
          props.history.replace('/');
        }
      })
      .catch(err => {
        console.log(err);
        setIsAuth(false);
        setAuthLoading(false);
        setError(err);
      });
  };

  const errorHandler = () => {
    setError(null);
  };

  let routes = (
    <Routes>
      <Route
        path="/"
        exact
        render={routeProps => (
          <LoginPage
            {...routeProps}
            onLogin={loginHandler}
            loading={authLoading}
          />
        )}
      />
      <Route
        path="/signup"
        exact
        render={routeProps => (
          <SignupPage
            {...routeProps}
            onSignup={signupHandler}
            loading={authLoading}
          />
        )}
      />
      <Navigate to="/" />
    </Routes>
  );

  if (isAuth) {
    routes = (
      <Routes>
        <Route
          path="/"
          exact
          render={routeProps => (
            <FeedPage userId={userId} token={token} />
          )}
        />
        <Route
          path="/:postId"
          render={routeProps => (
            <SinglePostPage
              {...routeProps}
              userId={userId}
              token={token}
            />
          )}
        />
        <Navigate to="/" />
      </Routes>
    );
  }

  return (
    <Fragment>
      {showBackdrop && <Backdrop onClick={backdropClickHandler} />}
      <ErrorHandler error={error} onHandle={errorHandler} />
      <Layout
        header={
          <Toolbar>
            <MainNavigation
              onOpenMobileNav={() => mobileNavHandler(true)}
              onLogout={logoutHandler}
              isAuth={isAuth}
            />
          </Toolbar>
        }
        mobileNav={
          <MobileNavigation
            open={showMobileNav}
            mobile
            onChooseItem={() => mobileNavHandler(false)}
            onLogout={logoutHandler}
            isAuth={isAuth}
          />
        }
      />
      {routes}
    </Fragment>
  );
};

export default withRouter(App);