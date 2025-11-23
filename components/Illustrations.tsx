import React from 'react';
import { motion } from 'framer-motion';

// --- Vehicle / Truck Illustration ---
export const TruckIllustration = ({ className = "w-32 h-32" }: { className?: string }) => {
  return (
    <div className={className}>
      <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <motion.g
          initial={{ y: 0 }}
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Truck Body */}
          <path d="M20,100 L160,100 L160,40 L20,40 Z" fill="#10B981" />
          <path d="M20,40 L160,40 L150,30 L30,30 Z" fill="#059669" />
          
          {/* Stripe */}
          <path d="M20,70 L160,70 L160,80 L20,80 Z" fill="#ffffff" opacity="0.3" />
          
          {/* Text */}
          <text x="40" y="65" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Nagar Nigam</text>

          {/* Cab */}
          <path d="M160,100 L210,100 L210,60 L180,40 L160,40 Z" fill="#34D399" />
          <path d="M165,45 L180,45 L205,60 L205,75 L165,75 Z" fill="#DCFCE7" /> {/* Window */}
          
          {/* Bumper */}
          <path d="M210,90 L215,90 L215,100 L210,100 Z" fill="#4B5563" />
        </motion.g>

        {/* Exhaust Fumes */}
        <motion.circle cx="18" cy="90" r="3" fill="#9CA3AF" 
           animate={{ x: [-5, -15], y: [-5, -10], opacity: [0.8, 0], scale: [1, 2] }}
           transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.circle cx="15" cy="95" r="2" fill="#9CA3AF" 
           animate={{ x: [-5, -20], y: [-2, -8], opacity: [0.6, 0], scale: [1, 1.5] }}
           transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
        />

        {/* Wheels */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ originX: '55px', originY: '100px' }}>
             <circle cx="55" cy="100" r="14" fill="#1F2937" />
             <circle cx="55" cy="100" r="6" fill="#D1D5DB" />
             <path d="M55,86 L55,114 M41,100 L69,100" stroke="#4B5563" strokeWidth="2" />
        </motion.g>
        
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ originX: '135px', originY: '100px' }}>
             <circle cx="135" cy="100" r="14" fill="#1F2937" />
             <circle cx="135" cy="100" r="6" fill="#D1D5DB" />
             <path d="M135,86 L135,114 M121,100 L149,100" stroke="#4B5563" strokeWidth="2" />
        </motion.g>

        <motion.g animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ originX: '190px', originY: '100px' }}>
             <circle cx="190" cy="100" r="14" fill="#1F2937" />
             <circle cx="190" cy="100" r="6" fill="#D1D5DB" />
             <path d="M190,86 L190,114 M176,100 L204,100" stroke="#4B5563" strokeWidth="2" />
        </motion.g>

        {/* Road */}
        <motion.path 
            d="M0,115 L240,115" 
            stroke="#E5E7EB" 
            strokeWidth="4" 
            strokeDasharray="20 10"
            animate={{ x: [0, -30] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

// --- Wallet / Money Illustration ---
export const WalletIllustration = ({ className = "w-32 h-32" }: { className?: string }) => {
    return (
      <div className={className}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Wallet Back */}
            <path d="M40,80 L160,80 C171,80 180,89 180,100 L180,150 C180,161 171,170 160,170 L40,170 C29,170 20,161 20,150 L20,100 C20,89 29,80 40,80 Z" fill="#8B5CF6" />
            <path d="M40,80 L160,80 C171,80 180,89 180,100 L180,120 L40,120 L40,80 Z" fill="#7C3AED" />
            
            {/* Wallet Flap */}
            <path d="M180,110 L140,110 C134,110 130,114 130,120 C130,126 134,130 140,130 L180,130" fill="#6D28D9" />
            <circle cx="170" cy="120" r="4" fill="#FCD34D" />

            {/* Floating Coins */}
            {[0, 1, 2].map((i) => (
                <motion.g 
                    key={i}
                    initial={{ y: -50 - (i * 30), opacity: 0 }}
                    animate={{ y: 90, opacity: [0, 1, 1, 0] }}
                    transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.6,
                        ease: "easeIn" 
                    }}
                >
                    <circle cx={70 + (i * 20)} cy="0" r="12" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
                    <text x={70 + (i * 20)} y="4" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="bold">₹</text>
                </motion.g>
            ))}
        </svg>
      </div>
    );
};

// --- POI / Map Illustration ---
export const MapIllustration = ({ className = "w-32 h-32" }: { className?: string }) => {
    return (
        <div className={className}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Map Base */}
                <motion.path 
                    d="M30,140 L80,160 L130,140 L170,160" 
                    stroke="#E2E8F0" strokeWidth="4" fill="none" 
                />
                 <motion.path 
                    d="M50,40 L50,150 M100,30 L100,160 M150,40 L150,150" 
                    stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" 
                />

                {/* Pulsing Rings */}
                <motion.circle cx="100" cy="100" r="10" fill="#2DD4BF" opacity="0.3"
                    animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle cx="100" cy="100" r="20" fill="#2DD4BF" opacity="0.2"
                    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />

                {/* Main Pin */}
                <motion.g
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                >
                    <path d="M100,100 C100,100 130,60 130,40 C130,23 116,10 100,10 C83,10 70,23 70,40 C70,60 100,100 100,100 Z" fill="#14B8A6" />
                    <circle cx="100" cy="40" r="12" fill="white" />
                </motion.g>
                
                {/* Small Pins */}
                <circle cx="50" cy="80" r="6" fill="#94A3B8" />
                <circle cx="150" cy="120" r="6" fill="#94A3B8" />
            </svg>
        </div>
    );
};

// --- Complaint / Alert Illustration ---
export const AlertIllustration = ({ className = "w-32 h-32" }: { className?: string }) => {
    return (
        <div className={className}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Chat Bubble */}
                <motion.path 
                    d="M40,40 H160 C171,40 180,49 180,60 V120 C180,131 171,140 160,140 H80 L40,170 V140 H40 C29,140 20,131 20,120 V60 C20,49 29,40 40,40 Z"
                    fill="#FDBA74"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                />
                
                {/* Exclamation Mark */}
                <motion.g 
                     initial={{ rotate: -5 }}
                     animate={{ rotate: 5 }}
                     transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
                     style={{ originX: '100px', originY: '90px' }}
                >
                    <rect x="90" y="60" width="20" height="50" rx="5" fill="#C2410C" />
                    <circle cx="100" cy="125" r="10" fill="#C2410C" />
                </motion.g>

                {/* Decoration particles */}
                <motion.circle cx="170" cy="30" r="5" fill="#F97316" animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.circle cx="185" cy="50" r="3" fill="#F97316" animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
            </svg>
        </div>
    );
};

// --- Customer / People Illustration ---
export const PeopleIllustration = ({ className = "w-32 h-32" }: { className?: string }) => {
    return (
        <div className={className}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Person 1 (Center) */}
                <motion.g initial={{ y: 5 }} animate={{ y: 0 }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}>
                     <circle cx="100" cy="60" r="30" fill="#F97316" />
                     <path d="M50,160 C50,110 150,110 150,160 L150,200 L50,200 Z" fill="#FFEDD5" />
                     <path d="M70,160 C70,130 130,130 130,160 V200 H70 V160 Z" fill="#FB923C" />
                </motion.g>

                {/* Person 2 (Left Back) */}
                <motion.g initial={{ x: -5 }} animate={{ x: 0 }} transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}>
                    <circle cx="50" cy="70" r="20" fill="#60A5FA" />
                    <path d="M20,150 C20,120 80,120 80,150 V180 H20 V150 Z" fill="#DBEAFE" />
                </motion.g>

                {/* Person 3 (Right Back) */}
                <motion.g initial={{ x: 5 }} animate={{ x: 0 }} transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse" }}>
                    <circle cx="150" cy="70" r="20" fill="#A78BFA" />
                    <path d="M120,150 C120,120 180,120 180,150 V180 H120 V150 Z" fill="#EDE9FE" />
                </motion.g>
            </svg>
        </div>
    );
};

// --- Trash Bin / Bulk Illustration ---
export const BinIllustration = ({ className = "w-32 h-32" }: { className?: string }) => {
    return (
        <div className={className}>
             <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                 <motion.g
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                 >
                     {/* Bin Body */}
                     <path d="M60,60 L140,60 L130,170 C129,176 124,180 118,180 H82 C76,180 71,176 70,170 L60,60 Z" fill="#A855F7" />
                     <path d="M75,60 L80,160 M100,60 L100,160 M125,60 L120,160" stroke="#E9D5FF" strokeWidth="4" strokeLinecap="round" />
                     
                     {/* Lid - opens slightly */}
                     <motion.g
                        animate={{ rotate: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        style={{ originX: '60px', originY: '50px' }}
                     >
                        <path d="M50,50 H150 C155,50 160,54 160,60 H40 C40,54 45,50 50,50 Z" fill="#9333EA" />
                        <rect x="90" y="40" width="20" height="10" rx="2" fill="#9333EA" />
                     </motion.g>
                 </motion.g>

                 {/* Waste Items falling */}
                 <motion.rect x="120" y="10" width="10" height="10" rx="2" fill="#34D399" 
                    animate={{ y: [0, 60], opacity: [1, 0], rotate: 180 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 />
             </svg>
        </div>
    );
};
