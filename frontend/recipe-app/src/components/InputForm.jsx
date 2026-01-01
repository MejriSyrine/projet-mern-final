import axios from 'axios';
import React, { useState } from 'react'
import config from '../config';

function InputForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // NOUVEAUX CHAMPS pour l'inscription
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("user");
    const [nutritionistId, setNutritionistId] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        let endpoint = isSignUp ? "register" : "signin";
        let data = { email, password };
        
        // AJOUT des champs pour l'inscription
        if (isSignUp) {
            data = {
                ...data,
                username: username || email.split('@')[0],
                role
            };
            
            // Ajouter le matricule uniquement si nutritionniste
            if (role === 'nutritionist' && nutritionistId) {
                data.nutritionistId = nutritionistId;
            }
        }

        await axios.post(`${config.API_URL}/user/${endpoint}`, data)
        .then((response) => {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setSuccess(response.data.message);
            
            // Redirection basée sur le rôle
            if (response.data.user.role === 'nutritionist') {
                // Vous pouvez ajouter une redirection vers le dashboard nutritionniste
                setTimeout(() => window.location.href = '/', 1500);
            } else {
                setTimeout(() => window.location.href = '/', 1500);
            }
        })
        .catch(err => {
            console.error('Signup error:', err.response || err.message);
            const serverMsg = err.response?.data?.error || err.response?.data?.message;
            setError(serverMsg || 'An error occurred during signup');
        });
    }

    return (
        <>
            <form className='input-form' onSubmit={handleSubmit}>
                <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    name='email' 
                    className='form-control mt-3' 
                    type="email" 
                    placeholder='Email' 
                    required
                />
                <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    name='password' 
                    className='form-control mt-3' 
                    type="password" 
                    placeholder='Password' 
                    required
                />

                {/* FORMULAIRE D'INSCRIPTION - CHAMPS SUPPLEMENTAIRES */}
                {isSignUp && (
                    <>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            name='username'
                            className='form-control mt-3'
                            type="text"
                            placeholder='Username (optional)'
                        />
                        
                        <div className="mt-3">
                            <label className="form-label">I am a:</label>
                            <div className="d-flex gap-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="role"
                                        id="userRole"
                                        value="user"
                                        checked={role === "user"}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor="userRole">
                                        Regular User
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="role"
                                        id="nutritionistRole"
                                        value="nutritionist"
                                        checked={role === "nutritionist"}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor="nutritionistRole">
                                        Nutritionist
                                    </label>
                                </div>
                            </div>
                        </div>

                        {role === 'nutritionist' && (
                            <div className="mt-3">
                                <input
                                    onChange={(e) => setNutritionistId(e.target.value)}
                                    name='nutritionistId'
                                    className='form-control'
                                    type="text"
                                    placeholder='Nutritionist Matricule *'
                                    required
                                />
                                <small className="text-muted">
                                    Required for nutritionists. Contact admin for valid matricules.
                                </small>
                            </div>
                        )}
                    </>
                )}

                <div className='text-center'>
                    <button className='button mt-5 w-100' type='submit'>
                        {isSignUp ? "Sign Up" : "Log In"}
                    </button>
                </div>
                
                <h5 className='success'>{(success !== "") && success}</h5>
                <h5 className='error'>{(error !== "") && error}</h5>
                
                <p onClick={() => setIsSignUp(!isSignUp)} className='mt-3 clickable'>
                    {isSignUp ? "Already have an account? Log In" : "Create an account"}
                </p>
            </form>
        </>
    )
}

export default InputForm;