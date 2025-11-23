import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loginUser, registerUser, loginWithGoogle } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react';
const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let result;
            if (isLogin) {
                result = await loginUser(email, password);
            }
            else {
                result = await registerUser(email, password);
            }
            if (result.success) {
                // Redirect to dashboard on successful login/registration
                navigate('/dashboard');
            }
            else {
                setError(result.error || 'An error occurred');
            }
        }
        catch (err) {
            setError('An unexpected error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await loginWithGoogle();
            if (result.success) {
                navigate('/dashboard');
            }
            else {
                setError(result.error || 'Google login failed');
            }
        }
        catch (err) {
            setError('An unexpected error occurred during Google login');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "w-full max-w-md", children: [_jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 border border-gray-100", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "mx-auto bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4", children: _jsx(Lock, { className: "text-white", size: 32 }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-800", children: isLogin ? 'Welcome Back' : 'Create Account' }), _jsx("p", { className: "text-gray-500 mt-2", children: isLogin ? 'Sign in to your account' : 'Create a new account' })] }), error && (_jsx("div", { className: "bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm", children: error })), _jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: handleGoogleLogin, disabled: loading, className: "w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all", children: [_jsx(Chrome, { className: "h-5 w-5 text-red-500" }), "Continue with Google"] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "px-2 bg-white text-gray-500", children: "Or continue with email" }) })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 mt-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Mail, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { id: "email", name: "email", type: "email", autoComplete: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition", placeholder: "you@example.com" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Lock, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { id: "password", name: "password", type: showPassword ? "text" : "password", autoComplete: isLogin ? "current-password" : "new-password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", className: "absolute inset-y-0 right-0 pr-3 flex items-center", onClick: () => setShowPassword(!showPassword), children: showPassword ? (_jsx(EyeOff, { className: "h-5 w-5 text-gray-400" })) : (_jsx(Eye, { className: "h-5 w-5 text-gray-400" })) })] })] }), !isLogin && (_jsx("div", { className: "text-sm text-gray-500", children: "Password must be at least 6 characters long" })), isLogin && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { id: "remember-me", name: "remember-me", type: "checkbox", className: "h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" }), _jsx("label", { htmlFor: "remember-me", className: "ml-2 block text-sm text-gray-700", children: "Remember me" })] }), _jsx("div", { className: "text-sm", children: _jsx("a", { href: "#", className: "font-medium text-green-600 hover:text-green-500", children: "Forgot password?" }) })] })), _jsx("div", { children: _jsx(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, type: "submit", disabled: loading, className: "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all", children: loading ? (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" }), isLogin ? 'Signing in...' : 'Creating account...'] })) : isLogin ? ('Sign in') : ('Create account') }) })] }), _jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "px-2 bg-white text-gray-500", children: isLogin ? 'New user?' : 'Already have an account?' }) })] }), _jsx("div", { className: "mt-6", children: _jsx("button", { onClick: () => setIsLogin(!isLogin), className: "w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition", children: isLogin ? 'Create new account' : 'Sign in to existing account' }) })] })] }), _jsx("div", { className: "mt-8 text-center text-sm text-gray-500", children: _jsx("p", { children: "\u00A9 2025 Nagar Nigam Dashboard. All rights reserved." }) })] }) }));
};
export default LoginPage;
