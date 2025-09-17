"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Smooth Reveal Component
export const SmoothReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.6, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Staggered Reveal Component
export const StaggeredReveal: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className = "" }) => (
  <div className={className}>
    {React.Children.map(children, (child, index) => (
      <SmoothReveal key={index} delay={index * staggerDelay}>
        {child}
      </SmoothReveal>
    ))}
  </div>
);

// Pally Button Component
export const PallyButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'md', className = "", disabled = false }) => {
  const baseClasses = "font-medium transition-all duration-300 ease-out transform active:scale-95";
  
  const variantClasses = {
      primary: "bg-okapi-brown-600 text-white shadow-lg",
  secondary: "bg-okapi-brown-100 text-okapi-brown-800 border border-okapi-brown-300",
  ghost: "text-okapi-brown-700"
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

// Origami Card Component
export const OrigamiCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  pattern?: 'zebra' | 'okapi' | 'cheetah' | 'leopard' | 'lion' | 'rhino';
  onClick?: () => void;
}> = ({ children, className = "", pattern = 'okapi', onClick }) => {
  const patternClasses = {
    zebra: "bg-gradient-to-br from-zebra-stripe-100 to-zebra-stripe-200 border-zebra-stripe-300",
    okapi: "bg-gradient-to-br from-okapi-brown-50 to-okapi-brown-100 border-okapi-brown-200",
    cheetah: "bg-gradient-to-br from-cheetah-spot-100 to-cheetah-spot-200 border-cheetah-spot-300",
    leopard: "bg-gradient-to-br from-leopard-spot-100 to-leopard-spot-200 border-leopard-spot-300",
    lion: "bg-gradient-to-br from-lion-mane-100 to-lion-mane-200 border-lion-mane-300",
    rhino: "bg-gradient-to-br from-rhino-gray-100 to-rhino-gray-200 border-rhino-gray-300"
  };
  
  return (
    <motion.div
      className={`glass-card ${patternClasses[pattern]} ${className}`}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  );
};

// Smooth Container Component
export const SmoothContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Smooth Section Component
export const SmoothSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  pattern?: 'zebra' | 'okapi' | 'cheetah' | 'leopard' | 'lion' | 'rhino';
}> = ({ children, className = "", pattern = 'okapi' }) => {
  const patternClasses = {
    zebra: "zebra-background",
    okapi: "okapi-background",
    cheetah: "cheetah-background",
    leopard: "leopard-background",
    lion: "lion-background",
    rhino: "rhino-background"
  };
  
  return (
    <section className={`smooth-section ${patternClasses[pattern]} ${className}`}>
      <SmoothContainer>
        {children}
      </SmoothContainer>
    </section>
  );
};

// Interactive Icon Component
export const InteractiveIcon: React.FC<{
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon, onClick, className = "", size = 'md' }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  return (
    <motion.div
      onClick={onClick}
      className={`cursor-pointer ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
    >
      {icon}
    </motion.div>
  );
};

// Micro Interaction Component
export const MicroInteraction: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <motion.div
    className={`micro-interaction ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.div>
);

// Okapi Fur Background Component
export const OkapiFurBackground: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`okapi-background ${className}`}>
    {children}
  </div>
);

// Floating Element Component
export const FloatingElement: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => (
  <motion.div
    className={`floating ${className}`}
    animate={{ y: [-10, 10, -10] }}
    transition={{ duration: 3, repeat: Infinity, delay }}
  >
    {children}
  </motion.div>
);

// Smooth Gradient Component
export const SmoothGradient: React.FC<{
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}> = ({ children, className = "", from = "from-okapi-brown-50", to = "to-okapi-brown-100" }) => (
  <div className={`bg-gradient-to-br ${from} ${to} ${className}`}>
    {children}
  </div>
);

// Elegant Divider Component
export const ElegantDivider: React.FC<{
  className?: string;
}> = ({ className = "" }) => (
  <div className={`elegant-border ${className}`} />
);

// Subtle Background Component
export const SubtleBackground: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`subtle-background ${className}`}>
    {children}
  </div>
);

// Glass Element Component
export const GlassElement: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`glass-card ${className}`}>
    {children}
  </div>
);

// Smooth Nav Link Component
export const SmoothNavLink: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}> = ({ children, onClick, isActive = false, className = "" }) => (
  <motion.button
    onClick={onClick}
    className={`nav-link ${isActive ? 'nav-link-active' : ''} ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.button>
);

// Animal Fur Background Components
export const ZebraBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`zebra-background ${className}`}>{children}</div>
);

export const CheetahBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`cheetah-background ${className}`}>{children}</div>
);

export const LeopardBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`leopard-background ${className}`}>{children}</div>
);

export const LionBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`lion-background ${className}`}>{children}</div>
);

export const RhinoBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`rhino-background ${className}`}>{children}</div>
); 