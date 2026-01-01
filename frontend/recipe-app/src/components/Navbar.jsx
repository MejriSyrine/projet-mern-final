import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import Modal from './Modal';
import DarkModeToggle from "../components/DarkModeToggle";
import InputForm from './InputForm';

const Icons = {
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  book: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  cart: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  mail: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  login: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),
  logout: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  clipboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  checkCircle: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
};

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [isLogin, setIsLogin] = useState(Boolean(token));
  const [isNutritionist, setIsNutritionist] = useState(false);
  
  useEffect(() => {
    setIsLogin(Boolean(localStorage.getItem("token")));
    if (user && user.role === 'nutritionist') {
      setIsNutritionist(true);
    } else {
      setIsNutritionist(false);
    }
  }, [token, user]);
  
  const checkLogin = () => {
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLogin(false);
      setIsNutritionist(false);
      window.location.href = "/";
    } else {
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleProtectedRoute = (e) => {
    if (!isLogin) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const renderNutritionistNav = () => (
    <ul className="navbar-nav ms-auto">
      <li className='nav-item'>
        <a className='nav-link' href="/nutritionist/pending-recipes">
          {Icons.clipboard}
          <span className="nav-text">Pending Recipes</span>
        </a>
      </li>
      <li className='nav-item'>
        <a className='nav-link' href="/nutritionist/validated-recipes">
          {Icons.checkCircle}
          <span className="nav-text">Validated Recipes</span>
        </a>
      </li>
      <li className="nav-item d-flex align-items-center ms-2">
        <span className="badge bg-success d-flex align-items-center gap-1">
          {Icons.shield} Nutritionist
        </span>
      </li>
      <button 
        style={{ borderRadius: "8px" }} 
        onClick={checkLogin}
        className="ms-2 btn btn-outline-secondary d-flex align-items-center gap-2"
        aria-label="Logout"
      >
        {Icons.logout}
        <span>Logout</span>
      </button>
      <DarkModeToggle />
    </ul>
  );

  const renderUserNav = () => (
    <ul className="navbar-nav ms-auto">
      <li className="nav-item active">
        <a className="nav-link" href="/">
          {Icons.home}
          <span className="nav-text">Home</span>
        </a>
      </li>
      <li className='nav-item' onClick={handleProtectedRoute}>
        <a className='nav-link' href={isLogin ? "/myFavRecipes" : "/"}>
          {Icons.heart}
          <span className="nav-text">My Favourites</span>
        </a>
      </li>
      <li className='nav-item' onClick={handleProtectedRoute}>
        <a className='nav-link' href={isLogin ? "/myRecipes" : "/"}>
          {Icons.book}
          <span className="nav-text">My Recipes</span>
        </a>
      </li>
      <li className='nav-item' onClick={handleProtectedRoute}>
        <a className='nav-link' href={isLogin ? "/market" : "/"}>
          {Icons.cart}
          <span className="nav-text">My Market</span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="/contact">
          {Icons.mail}
          <span className="nav-text">Contact</span>
        </a>
      </li>
      <button 
        style={{ borderRadius: "8px" }} 
        onClick={checkLogin}
        className="btn btn-outline-primary ms-2 d-flex align-items-center gap-2"
      >
        {isLogin ? Icons.logout : Icons.login}
        <span>{isLogin ? 'Logout' : 'Login'}</span>
      </button>
      <DarkModeToggle />
    </ul>
  );

  const renderVisitorNav = () => (
    <ul className="navbar-nav ms-auto">
      <li className="nav-item active">
        <a className="nav-link" href="/">
          {Icons.home}
          <span className="nav-text">Home</span>
        </a>
      </li>
      <li className="nav-item" onClick={() => setIsOpen(true)}>
        <a className="nav-link" href="#!" onClick={(e) => e.preventDefault()}>
          {Icons.heart}
          <span className="nav-text">My Favourites</span>
        </a>
      </li>
      <li className="nav-item" onClick={() => setIsOpen(true)}>
        <a className="nav-link" href="#!" onClick={(e) => e.preventDefault()}>
          {Icons.book}
          <span className="nav-text">My Recipes</span>
        </a>
      </li>
      <li className="nav-item" onClick={() => setIsOpen(true)}>
        <a className="nav-link" href="#!" onClick={(e) => e.preventDefault()}>
          {Icons.cart}
          <span className="nav-text">My Market</span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="/contact">
          {Icons.mail}
          <span className="nav-text">Contact</span>
        </a>
      </li>
      <button 
        style={{ borderRadius: "8px" }} 
        onClick={checkLogin}
        className="btn btn-outline-primary ms-2 d-flex align-items-center gap-2"
      >
        {Icons.login}
        <span>Login</span>
      </button>
      <DarkModeToggle />
    </ul>
  );

  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg mt-3">
          <a className="navbar-brand" href="/">
            <img src={logo} alt="Logo" />
            {isNutritionist && (
              <span className="ms-2 badge bg-success d-flex align-items-center gap-1">
                {Icons.shield} Nutritionist Dashboard
              </span>
            )}
          </a>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarSupportedContent" 
            aria-controls="navbarSupportedContent" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {isLogin ? (isNutritionist ? renderNutritionistNav() : renderUserNav()) : renderVisitorNav()}
          </div>
        </nav>

        {isNutritionist && (
          <div className="nutritionist-banner bg-dark text-white p-3 mt-2">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 className="mb-1 d-flex align-items-center gap-2">
                    {Icons.shield} Nutritionist Dashboard
                  </h5>
                  <p className="mb-0 small">
                    Welcome back! As a nutritionist, you can review and validate recipes.
                    {user.matricule && ` • ID: ${user.matricule}`}
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <a href="/nutritionist/pending-recipes" className="btn btn-success btn-sm d-inline-flex align-items-center gap-2">
                    {Icons.clipboard} Review Pending Recipes
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      {isOpen && <Modal onClose={closeModal}><InputForm /></Modal>}
    </>
  );
}

export default Navbar;
