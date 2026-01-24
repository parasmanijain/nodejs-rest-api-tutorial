import { Component, Fragment, ReactNode } from 'react';
import Layout from './components/Layout/Layout';
import Backdrop from './components/Backdrop/Backdrop';
import Toolbar from './components/Toolbar/Toolbar';
import MainNavigation from './components/Navigation/MainNavigation/MainNavigation';
import MobileNavigation from './components/Navigation/MobileNavigation/MobileNavigation';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';

interface AppState {
  showBackdrop: boolean;
  showMobileNav: boolean;
  isAuth: boolean;
  token: string | null;
  userId: string | null;
  authLoading: boolean;
  error: Error | null;
}

class App extends Component<{ children?: ReactNode }, AppState> {
  state: AppState = {
    showBackdrop: false,
    showMobileNav: false,
    isAuth: false,
    token: null,
    userId: null,
    authLoading: false,
    error: null
  };

  componentDidMount(): void {
    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');

    if (!token || !expiryDate) return;

    if (new Date(expiryDate) <= new Date()) {
      this.logoutHandler();
      return;
    }

    const userId = localStorage.getItem('userId');
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();

    this.setState({ isAuth: true, token, userId });
    this.setAutoLogout(remainingMilliseconds);
  }

  mobileNavHandler = (isOpen: boolean): void => {
    this.setState({ showMobileNav: isOpen, showBackdrop: isOpen });
  };

  backdropClickHandler = (): void => {
    this.setState({
      showBackdrop: false,
      showMobileNav: false,
      error: null
    });
  };

  logoutHandler = (): void => {
    this.setState({ isAuth: false, token: null, userId: null });
    localStorage.clear();
  };

  setAutoLogout = (milliseconds: number): void => {
    setTimeout(this.logoutHandler, milliseconds);
  };

  errorHandler = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    return (
      <Fragment>
        {this.state.showBackdrop && (
          <Backdrop onClick={this.backdropClickHandler} />
        )}

        <ErrorHandler
          error={this.state.error}
          onHandle={this.errorHandler}
        />

        <Layout
          header={
            <Toolbar>
              <MainNavigation
                onOpenMobileNav={this.mobileNavHandler.bind(this, true)}
                onLogout={this.logoutHandler}
                isAuth={this.state.isAuth}
              />
            </Toolbar>
          }
          mobileNav={
            <MobileNavigation
              open={this.state.showMobileNav}
              mobile
              onChooseItem={this.mobileNavHandler.bind(this, false)}
              onLogout={this.logoutHandler}
              isAuth={this.state.isAuth}
            />
          }
        />

        {this.props.children}
      </Fragment>
    );
  }
}

export default App;
