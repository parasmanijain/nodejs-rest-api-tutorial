import { FC, FormEvent, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Backdrop } from './components/Backdrop/Backdrop';
import { Toolbar } from './components/Toolbar/Toolbar';
import { MainNavigation } from './components/Navigation/MainNavigation/MainNavigation';
import { MobileNavigation } from './components/Navigation/MobileNavigation/MobileNavigation';
import { ErrorHandler, ErrorLike } from './components/ErrorHandler/ErrorHandler';
import { Feed } from './pages/Feed/Feed';
import { SinglePost } from './pages/Feed/SinglePost/SinglePost';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { SignupForm } from './types/form';
import './App.scss';

export const App: FC = () => {
  const [showBackdrop, setShowBackdrop] = useState<boolean>(false);
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorLike | null>(null);

  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const logoutHandler = useCallback(() => {
    setIsAuth(false);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');
  }, []);

  const setAutoLogout = useCallback(
    (milliseconds: number) => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
      logoutTimer.current = setTimeout(() => {
        logoutHandler();
      }, milliseconds);
    },
    [logoutHandler]
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');
    if (!token || !expiryDate) {
      return undefined;
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return undefined;
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

  const mobileNavHandler = (isOpen: boolean) => {
    setShowMobileNav(isOpen);
    setShowBackdrop(isOpen);
  };

  const backdropClickHandler = () => {
    setShowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  };

  const loginHandler = (
    event: FormEvent<HTMLFormElement>,
    authData: { email: string; password: string }
  ) => {
    event.preventDefault();
    setAuthLoading(true);
    const graphqlQuery = {
      query: `
        query UserLogin($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
            userId
          }
        }
      `,
      variables: {
        email: authData.email,
        password: authData.password
      }
    };
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphqlQuery)
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.errors && resData.errors[0]?.status === 422) {
          throw new Error('Validation failed.');
        }
        if (resData.errors) {
          throw new Error('Could not authenticate you!');
        }
        const loginData = resData.data.login;
        setIsAuth(true);
        setToken(loginData.token);
        setAuthLoading(false);
        setUserId(loginData.userId);
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('userId', loginData.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem('expiryDate', expiryDate.toISOString());
        setAutoLogout(remainingMilliseconds);
      })
      .catch((err: unknown) => {
        console.log(err);
        setIsAuth(false);
        setAuthLoading(false);
        setError({ message: err instanceof Error ? err.message : String(err) });
      });
  };

  const signupHandler = (
    event: FormEvent<HTMLFormElement>,
    payload: { signupForm: SignupForm; formIsValid: boolean }
  ) => {
    event.preventDefault();
    setAuthLoading(true);
    const graphqlQuery = {
      query: `
        mutation CreateNewUser($email: String!, $name: String!, $password: String!) {
          createUser(userInput: {email: $email, name: $name, password: $password}) {
            _id
            email
          }
        }
      `,
      variables: {
        email: payload.signupForm.email.value,
        name: payload.signupForm.name.value,
        password: payload.signupForm.password.value
      }
    };
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.errors && resData.errors[0]?.status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if (resData.errors) {
          throw new Error('Creating a user failed!');
        }
        setIsAuth(false);
        setAuthLoading(false);
        navigate('/', { replace: true });
      })
      .catch((err: unknown) => {
        console.log(err);
        setIsAuth(false);
        setAuthLoading(false);
        setError({ message: err instanceof Error ? err.message : String(err) });
      });
  };

  const errorHandler = () => {
    setError(null);
  };

  let routes = (
    <Routes>
      <Route
        path="/"
        element={<Login onLogin={loginHandler} loading={authLoading} />}
      />
      <Route
        path="/signup"
        element={<Signup onSignup={signupHandler} loading={authLoading} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (isAuth) {
    routes = (
      <Routes>
        <Route
          path="/"
          element={<Feed userId={userId} token={token} />}
        />
        <Route
          path="/:postId"
          element={<SinglePost userId={userId} token={token} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
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