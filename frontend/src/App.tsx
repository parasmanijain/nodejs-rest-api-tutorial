import { Fragment, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Layout } from './components/Layout/Layout';
import { Backdrop } from './components/Backdrop/Backdrop';
import { Toolbar } from './components/Toolbar/Toolbar';
import { MainNavigation } from './components/Navigation/MainNavigation/MainNavigation';
import { MobileNavigation } from './components/Navigation/MobileNavigation/MobileNavigation';
import { ErrorHandler } from './components/ErrorHandler/ErrorHandler';

type Props = { children?: ReactNode };

export const App = ({ children }: Props) => {
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [, setAuthLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const logoutTimerRef = useRef<number | null>(null);

  const logoutHandler = useCallback(() => {
    setIsAuth(false);
    setToken(null);
    setUserId(null);
    localStorage.clear();
  }, []);

  const setAutoLogout = useCallback(
    (milliseconds: number) => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      logoutTimerRef.current = window.setTimeout(logoutHandler, milliseconds);
    },
    [logoutHandler],
  );

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');

    if (!storedToken || !expiryDate) return;

    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }

    const storedUserId = localStorage.getItem('userId');
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();

    setIsAuth(true);
    setToken(storedToken);
    setUserId(storedUserId);
    setAutoLogout(remainingMilliseconds);

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [logoutHandler, setAutoLogout]);

  const mobileNavHandler = (isOpen: boolean): void => {
    setShowMobileNav(isOpen);
    setShowBackdrop(isOpen);
  };

  const backdropClickHandler = (): void => {
    setShowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  };

  const errorHandler = (): void => {
    setError(null);
  };

  return (
    <Fragment>
      {showBackdrop && <Backdrop onClick={backdropClickHandler} />}

      <ErrorHandler error={error} onHandle={errorHandler} />

      <Layout
        header={
          <Toolbar>
            <MainNavigation
              onOpenMobileNav={mobileNavHandler.bind(null, true)}
              onLogout={logoutHandler}
              isAuth={isAuth}
            />
          </Toolbar>
        }
        mobileNav={
          <MobileNavigation
            open={showMobileNav}
            mobile
            onChooseItem={mobileNavHandler.bind(null, false)}
            onLogout={logoutHandler}
            isAuth={isAuth}
          />
        }
      />

      {children}
    </Fragment>
  );
};