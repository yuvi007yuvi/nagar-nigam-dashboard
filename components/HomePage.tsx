// d:/MY FREELANCING/nagar-nigam-dashboard/components/HomePage.tsx
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Icon imports
import {
    MapPin,
    Globe,
    Activity,
    Route,
    BarChart3,
    Users,
    Gauge,
    Clock,
    Droplets,
    Shield,
    FileText,
    Truck,
    CheckCircle,
    Zap,
    Sparkles,
    ArrowRight,
    TrendingUp,
    Award,
    Target,
} from "lucide-react";

// Assets
import logo from "./images/logo.png";
import heroImage from "./images/hero_dashboard.png";
import trackingFeaturesImg from "./images/tracking_features.png";
import analyticsDashboardImg from "./images/analytics_dashboard.png";
import vehicleTrackingImg from "./images/vehicle_tracking.png";

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Set document title on mount
    useEffect(() => {
        document.title = "Smart Waste Management Dashboard";
    }, []);

    // Track mouse position for magnetic effects
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Parallax transforms
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Feature definitions
    const features = [
        {
            icon: MapPin,
            title: "Real-Time Vehicle Tracking",
            description: "Monitor your entire fleet with GPS-enabled live tracking and route optimization.",
            color: "from-emerald-500 to-teal-600",
            gradient: "from-emerald-500/20 to-teal-600/20",
        },
        {
            icon: Globe,
            title: "POI-Based Coverage Monitoring",
            description: "Track waste collection coverage across key points of interest with geospatial analytics and heat maps.",
            color: "from-cyan-500 to-blue-600",
            gradient: "from-cyan-500/20 to-blue-600/20",
        },
        {
            icon: Activity,
            title: "KPI-Based Monitoring",
            description: "Real-time performance tracking with customizable KPIs, benchmarks, and automated alerts for operational excellence.",
            color: "from-violet-500 to-purple-600",
            gradient: "from-violet-500/20 to-purple-600/20",
        },
        {
            icon: Route,
            title: "Route-Based Tracking",
            description: "Optimize collection routes with intelligent path planning, distance tracking, and efficiency analytics.",
            color: "from-amber-500 to-orange-600",
            gradient: "from-amber-500/20 to-orange-600/20",
        },
        {
            icon: BarChart3,
            title: "Advanced Analytics",
            description: "Comprehensive KPI dashboards with real-time insights and performance metrics.",
            color: "from-blue-500 to-cyan-600",
            gradient: "from-blue-500/20 to-cyan-600/20",
        },
        {
            icon: Users,
            title: "Citizen Engagement",
            description: "Direct complaint management system for citizens to report issues instantly.",
            color: "from-purple-500 to-pink-600",
            gradient: "from-purple-500/20 to-pink-600/20",
        },
        {
            icon: Gauge,
            title: "Weighment Management",
            description: "Accurate waste weighment tracking with automated data collection and reporting.",
            color: "from-orange-500 to-red-600",
            gradient: "from-orange-500/20 to-red-600/20",
        },
        {
            icon: Clock,
            title: "Attendance Tracking",
            description: "Digital attendance system for workforce management and productivity monitoring.",
            color: "from-green-500 to-emerald-600",
            gradient: "from-green-500/20 to-emerald-600/20",
        },
        {
            icon: Droplets,
            title: "Fuel Management",
            description: "Track fuel consumption, optimize usage, and reduce operational costs.",
            color: "from-indigo-500 to-purple-600",
            gradient: "from-indigo-500/20 to-purple-600/20",
        },
    ];

    // Stats definitions with capabilities
    const stats = [
        { label: "Features Available", value: "11+", icon: Truck, color: "from-emerald-500 to-teal-600" },
        { label: "Real-Time Tracking", value: "GPS", icon: CheckCircle, color: "from-blue-500 to-cyan-600" },
        { label: "Cloud-Based", value: "100%", icon: Users, color: "from-purple-500 to-pink-600" },
        { label: "System Uptime", value: "24/7", icon: Zap, color: "from-amber-500 to-orange-600" },
    ];

    // Featured showcases
    const showcases = [
        {
            title: "POI-Based Coverage Monitoring",
            description: "Track waste collection coverage across key points of interest with advanced geospatial analytics, heat maps, and real-time monitoring capabilities.",
            image: trackingFeaturesImg,
            color: "from-cyan-500 to-blue-600",
        },
        {
            title: "KPI-Based Monitoring",
            description: "Real-time performance tracking with customizable KPIs, intelligent benchmarks, automated alerts, and comprehensive operational excellence metrics.",
            image: analyticsDashboardImg,
            color: "from-violet-500 to-purple-600",
        },
        {
            title: "Route-Based Tracking",
            description: "Optimize collection routes with intelligent path planning, distance tracking, efficiency analytics, and automated route suggestions for maximum productivity.",
            image: vehicleTrackingImg,
            color: "from-amber-500 to-orange-600",
        },
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 12 },
        },
    };

    const cardHoverVariants = {
        rest: { scale: 1, rotateZ: 0 },
        hover: {
            scale: 1.05,
            rotateZ: 1,
            transition: { type: "spring", stiffness: 400, damping: 10 },
        },
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Animated background gradient mesh */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute top-0 left-0 w-full h-full opacity-60"
                    style={{
                        background: `
                            radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.12) 0px, transparent 50%),
                            radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.15) 0px, transparent 50%),
                            radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.1) 0px, transparent 50%),
                            radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.1) 0px, transparent 50%),
                            radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.1) 0px, transparent 50%),
                            radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.1) 0px, transparent 50%),
                            radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.1) 0px, transparent 50%)
                        `,
                    }}
                />
                {/* Dot grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }} />
            </div>

            {/* Navigation Header with glassmorphism */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <motion.div
                            className="flex items-center gap-3"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-display">
                                    Smart Waste Dashboard
                                </h1>
                                <p className="text-sm text-gray-500 font-medium">Smart Waste Management</p>
                            </div>
                        </motion.div>
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/login")}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors relative group"
                            >
                                Login
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 group-hover:w-full transition-all duration-300" />
                            </motion.button>
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 20px 40px -10px rgba(16, 185, 129, 0.4)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/login")}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all relative overflow-hidden group"
                            >
                                <span className="relative z-10">Get Started</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section with parallax */}
            <section className="pt-32 pb-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ opacity }}
                        >
                            <motion.div
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-bold mb-6 backdrop-blur-sm border border-emerald-200/50"
                                animate={{
                                    boxShadow: [
                                        "0 0 0 0 rgba(16, 185, 129, 0)",
                                        "0 0 0 10px rgba(16, 185, 129, 0)",
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles size={16} />
                                Smart City Solution
                            </motion.div>

                            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 font-display leading-[1.1] mb-6">
                                Transform Your
                                <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
                                    Waste Management
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                                A comprehensive digital platform for municipal waste management. Track vehicles in real-time,
                                manage operations efficiently, and serve citizens better with our all-in-one dashboard solution.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 20px 60px -10px rgba(16, 185, 129, 0.5)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/login")}
                                    className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all relative overflow-hidden"
                                >
                                    <span className="relative z-10">Start Free Trial</span>
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ArrowRight size={20} className="relative z-10" />
                                    </motion.div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 font-bold rounded-2xl shadow-lg hover:border-emerald-500 hover:text-emerald-600 hover:bg-white transition-all"
                                >
                                    <Globe size={20} />
                                    View Demo
                                </motion.button>
                            </div>

                            {/* Floating stats badges */}
                            <div className="mt-12 flex flex-wrap gap-6">
                                {[
                                    { icon: TrendingUp, text: "40% Efficiency Boost", color: "emerald" },
                                    { icon: Award, text: "ISO Certified", color: "blue" },
                                    { icon: Target, text: "99.9% Uptime", color: "purple" },
                                ].map((badge, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 + idx * 0.1 }}
                                        className={`flex items-center gap-2 px-4 py-2 bg-${badge.color}-50 border border-${badge.color}-200 rounded-xl`}
                                    >
                                        <badge.icon size={16} className={`text-${badge.color}-600`} />
                                        <span className={`text-sm font-semibold text-${badge.color}-700`}>{badge.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            style={{ y: heroY }}
                            className="relative"
                        >
                            {/* Glowing orb background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 blur-3xl rounded-full"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />

                            {/* Floating image with 3D effect */}
                            <motion.div
                                whileHover={{
                                    scale: 1.02,
                                    rotateY: 5,
                                    rotateX: 5,
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="relative z-10 perspective-1000"
                            >
                                <img
                                    src={heroImage}
                                    alt="Dashboard Preview"
                                    className="relative z-10 w-full h-auto rounded-3xl shadow-2xl border border-gray-200/50"
                                />

                                {/* Scan line effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent"
                                    animate={{ y: ["-100%", "200%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    style={{ pointerEvents: "none" }}
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section - Bento Grid */}
            <section className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{
                                    scale: 1.05,
                                    y: -5,
                                }}
                                className="relative group"
                            >
                                {/* Glassmorphic card */}
                                <div className="relative p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl overflow-hidden">
                                    {/* Gradient background on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                    {/* Icon with gradient background */}
                                    <motion.div
                                        className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl mb-4 shadow-lg`}
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <stat.icon className="text-white" size={28} />
                                    </motion.div>

                                    {/* Value with counter animation */}
                                    <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-display mb-2">
                                        {stat.value}
                                    </div>

                                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>

                                    {/* Animated border glow */}
                                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10`} />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section - Masonry Grid */}
            <section className="py-24 px-6 relative bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 font-display mb-6">
                            Powerful Features for
                            <span className="block mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Modern Cities
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Everything you need to manage municipal waste operations efficiently and transparently
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{
                                    y: -10,
                                    boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.15)",
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="group relative"
                            >
                                {/* Card with glassmorphism */}
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200/50 overflow-hidden h-full">
                                    {/* Gradient background orb */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full`} />

                                    {/* Icon with animated gradient */}
                                    <motion.div
                                        className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 shadow-lg`}
                                        whileHover={{
                                            rotate: [0, -10, 10, -10, 0],
                                            scale: 1.1,
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <feature.icon className="text-white" size={32} />
                                    </motion.div>

                                    <h3 className="relative text-2xl font-bold text-gray-900 font-display mb-3">
                                        {feature.title}
                                    </h3>

                                    <p className="relative text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>

                                    {/* Hover indicator */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 w-0 group-hover:w-full transition-all duration-500"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Feature Showcases - Diagonal Split Sections */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-32">
                    {showcases.map((showcase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
                        >
                            {/* Image side with parallax */}
                            <motion.div
                                className="lg:w-1/2 relative"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {/* Glowing gradient orb */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${showcase.color} opacity-20 blur-3xl rounded-full`} />

                                <div className="relative z-10">
                                    <img
                                        src={showcase.image}
                                        alt={showcase.title}
                                        className="w-full h-auto rounded-3xl shadow-2xl border border-gray-200/50"
                                    />

                                    {/* Animated gradient border */}
                                    <motion.div
                                        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${showcase.color} opacity-0 hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}
                                    />
                                </div>
                            </motion.div>

                            {/* Content side */}
                            <div className="lg:w-1/2">
                                <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <div className={`inline-block px-4 py-2 bg-gradient-to-r ${showcase.color} bg-opacity-10 rounded-full mb-6`}>
                                        <span className={`text-sm font-bold bg-gradient-to-r ${showcase.color} bg-clip-text text-transparent`}>
                                            Featured Solution
                                        </span>
                                    </div>

                                    <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 font-display mb-6 leading-tight">
                                        {showcase.title}
                                    </h3>

                                    <p className="text-xl text-gray-600 leading-relaxed mb-8">
                                        {showcase.description}
                                    </p>

                                    <motion.button
                                        whileHover={{ scale: 1.05, x: 10 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${showcase.color} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all`}
                                    >
                                        Learn More
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <ArrowRight size={20} />
                                        </motion.div>
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section with immersive gradient */}
            <section className="py-32 px-6 relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
                    <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{
                            backgroundPosition: ["0% 0%", "100% 100%"],
                        }}
                        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                        style={{
                            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%),
                                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%),
                                             radial-gradient(circle at 40% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                            backgroundSize: "200% 200%",
                        }}
                    />

                    {/* Noise texture */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl lg:text-6xl font-bold text-white font-display mb-6">
                            Ready to Transform Your City?
                        </h2>

                        <p className="text-xl text-emerald-50 mb-12 leading-relaxed">
                            Start your journey towards smarter waste management. Our comprehensive platform is ready to help you streamline operations and serve citizens better.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center">
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.4)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/login")}
                                className="group px-10 py-5 bg-white text-emerald-600 font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all text-lg relative overflow-hidden"
                            >
                                <span className="relative z-10">Create Free Account</span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/login")}
                                className="px-10 py-5 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all text-lg"
                            >
                                Schedule Demo
                            </motion.button>
                        </div>

                        {/* Trust indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="mt-12 flex flex-wrap gap-8 justify-center items-center text-emerald-100"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle size={20} />
                                <span className="text-sm font-medium">Free Demo Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={20} />
                                <span className="text-sm font-medium">Secure & Reliable</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={20} />
                                <span className="text-sm font-medium">Enterprise Ready</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer with modern grid */}
            <footer className="py-16 px-6 bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                }} />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
                                <span className="font-bold text-xl font-display">Waste Manager</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Smart waste management solutions for modern cities. Building a cleaner, more efficient future.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 font-display text-lg">Product</h4>
                            <ul className="space-y-3 text-sm">
                                {["Features", "Pricing", "Demo", "Updates"].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors relative group">
                                            {item}
                                            <span className="absolute bottom-0 left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all duration-300" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 font-display text-lg">Company</h4>
                            <ul className="space-y-3 text-sm">
                                {["About", "Contact", "Support", "Careers"].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors relative group">
                                            {item}
                                            <span className="absolute bottom-0 left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all duration-300" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 font-display text-lg">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                {["Privacy", "Terms", "Security", "Cookies"].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors relative group">
                                            {item}
                                            <span className="absolute bottom-0 left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all duration-300" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8">
                        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                            © 2025 Yuvraj Singh Tomar — Developed with purpose and
                            <motion.span
                                className="text-red-400"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                ❤️
                            </motion.span>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Contact Button */}
            <motion.a
                href="https://wa.me/919993325830"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{
                    scale: 1.1,
                    boxShadow: "0 20px 40px -10px rgba(37, 211, 102, 0.5)",
                }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-[#25D366] text-white font-bold rounded-full shadow-2xl hover:bg-[#20BA5A] transition-all group"
            >
                {/* WhatsApp Icon */}
                <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>

                {/* Text that appears on hover */}
                <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    whileHover={{ width: "auto", opacity: 1 }}
                    className="overflow-hidden whitespace-nowrap text-sm"
                >
                    Contact Us
                </motion.span>

                {/* Pulse animation ring */}
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
            </motion.a>
        </div>
    );
};

export default HomePage;
