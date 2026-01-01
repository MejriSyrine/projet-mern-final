import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MyFavRecipes from "./components/MyFavRecipes";
import AddRecipes from "./components/AddRecipes";
import CategorySelection from "./components/CategorySelection";
import MyRecipes from "./components/MyRecipes";
import EditRecipe from "./pages/EditRecipe";
import Contact from "./components/Contact.jsx";
import Market from "./components/Market";
import SplashScreen from "./components/SplashScreen";

// Nouvelles pages pour nutritionnistes
import NutritionistDashboard from "./components/NutritionistDashboard";
import PendingRecipes from "./components/PendingRecipes";
import ValidatedRecipes from "./components/ValidatedRecipes";
import RecipeDetails from "./pages/RecipeDetails";

// Composant de route protégée
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/home" />;
};

// Composant de route réservée aux nutritionnistes
const NutritionistRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (!token) {
    return <Navigate to="/home" />;
  }
  
  if (user.role !== 'nutritionist') {
    return <Navigate to="/home" />;
  }
  
  return children;
};

// Layout wrapper to conditionally render Navbar/Footer
function AppLayout({ children, userRole }) {
  const location = useLocation();
  const isSplash = location.pathname === '/';
  
  return (
    <>
      {!isSplash && <Navbar />}
      {children}
      {!isSplash && userRole !== 'nutritionist' && <Footer />}
    </>
  );
}

function AppRoutes({ userRole }) {
  return (
    <Routes>
      {/* Splash screen - page d'accueil initiale */}
      <Route path="/" element={<SplashScreen />} />
      
      {/* Routes publiques */}
      <Route path="/home" element={<Home />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Routes protégées pour tous les utilisateurs connectés */}
      <Route 
        path="/myRecipes" 
        element={
          <PrivateRoute>
            <MyRecipes />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/myFavRecipes" 
        element={
          <PrivateRoute>
            <MyFavRecipes />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/selectCategory" 
        element={
          <PrivateRoute>
            <CategorySelection />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/addRecipe" 
        element={
          <PrivateRoute>
            <AddRecipes />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/EditRecipe/:id" 
        element={
          <PrivateRoute>
            <EditRecipe />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/market" 
        element={
          <PrivateRoute>
            <Market />
          </PrivateRoute>
        } 
      />
      
      {/* Routes réservées aux NUTRITIONNISTES */}
      <Route 
        path="/nutritionist/dashboard" 
        element={
          <NutritionistRoute>
            <NutritionistDashboard />
          </NutritionistRoute>
        } 
      />
      <Route 
        path="/nutritionist/pending-recipes" 
        element={
          <NutritionistRoute>
            <PendingRecipes />
          </NutritionistRoute>
        } 
      />
      <Route 
        path="/nutritionist/validated-recipes" 
        element={
          <NutritionistRoute>
            <ValidatedRecipes />
          </NutritionistRoute>
        } 
      />
      
      {/* Recipe details */}
      <Route path="/recipe/:id" element={<RecipeDetails />} />

      {/* Route de fallback - redirection vers la page d'accueil */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    // Vérifier le rôle de l'utilisateur au chargement
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || null);
    
    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(updatedUser.role || null);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <HashRouter>
      <AppLayout userRole={userRole}>
        <AppRoutes userRole={userRole} />
      </AppLayout>
    </HashRouter>
  );
}
