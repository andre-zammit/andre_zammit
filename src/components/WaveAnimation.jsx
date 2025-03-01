'use client'

import React, { useEffect, useRef } from 'react';

export default function DataGridAnimation({ darkMode, activeSection, smoothTransition = false }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Grid parameters
    const cols = 200;
    const rows = 60;
    const spacing = 50;
    
    // Bounds for clipping lines to prevent shooting effects
    const clipBounds = {
      left: -canvas.width * 0.5,
      right: canvas.width * 1.5,
      top: -canvas.height * 0.5,
      bottom: canvas.height * 1.5
    };
    
    // Grid points with height values
    const points = [];
    for (let i = 0; i < cols; i++) {
      points[i] = [];
      for (let j = 0; j < rows; j++) {
        points[i][j] = 0;
      }
    }
    
    // 3D projection variables
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const initialPerspective = 3000;
    const initialEyeZ = -500;
    
    // Camera state
    const camera = {
      x: 0,
      y: 0,
      z: initialEyeZ,
      perspective: initialPerspective,
      targetX: 0,
      targetY: 0,
      targetZ: initialEyeZ,
      targetPerspective: initialPerspective,
      angleX: Math.PI / 6, // Initial tilt
      angleY: 0,
      targetAngleX: Math.PI / 6,
      targetAngleY: 0,
      // Oscillation parameters
      oscillationX: 0,
      oscillationY: 0,
      oscillationZ: 0
    };
    
    // Animation properties
    let time = 0;
    const waveSpeed = smoothTransition ? 0.007 : 0.01; // Slower for smoother transitions
    
    // Update animation parameters based on active section
    const updateSectionEffect = (section) => {
      // Base position for camera for each section
      switch(section) {
        case 0: // Hero
          camera.targetAngleX = Math.PI / 6;
          camera.targetAngleY = Math.sin(time * 0.1) * 0.1;
          camera.targetX = 0;
          camera.targetY = -50;
          camera.targetZ = initialEyeZ;
          camera.targetPerspective = initialPerspective;
          break;
        case 1: // Skills
          camera.targetAngleX = Math.PI / 5;
          camera.targetAngleY = Math.PI / 8; // Reduced even more
          camera.targetX = -150;
          camera.targetY = 0;
          camera.targetZ = initialEyeZ - 50;
          camera.targetPerspective = initialPerspective * 0.95; // Less extreme
          break;
        case 2: // Projects
          camera.targetAngleX = Math.PI / 7;
          camera.targetAngleY = -Math.PI / 8; // Reduced even more
          camera.targetX = 150;
          camera.targetY = 50;
          camera.targetZ = initialEyeZ - 50;
          camera.targetPerspective = initialPerspective * 0.95; // Less extreme
          break;
        case 3: // Contact
          camera.targetAngleX = Math.PI / 4;
          camera.targetAngleY = Math.PI / 6; // Reduced even more
          camera.targetX = 0;
          camera.targetY = 100;
          camera.targetZ = initialEyeZ - 80;
          camera.targetPerspective = initialPerspective * 0.9; // Less extreme
          break;
        default:
          camera.targetAngleX = Math.PI / 6;
          camera.targetAngleY = 0;
          camera.targetX = 0;
          camera.targetY = 0;
          camera.targetZ = initialEyeZ;
          camera.targetPerspective = initialPerspective;
      }
    };
    
    // Project a 3D point to 2D canvas coordinates with better error handling
    function project(x, y, z) {
      try {
        // Apply camera position
        x = x - camera.x;
        y = y - camera.y;
        z = z - camera.z;
        
        // Rotate around Y axis
        const rotY = x * Math.cos(camera.angleY) - z * Math.sin(camera.angleY);
        const rotZ = z * Math.cos(camera.angleY) + x * Math.sin(camera.angleY);
        
        // Rotate around X axis
        const rotX = y * Math.cos(camera.angleX) - rotZ * Math.sin(camera.angleX);
        const newZ = rotZ * Math.cos(camera.angleX) + y * Math.sin(camera.angleX);
        
        // Handle potential division by zero or negative z values
        if (newZ <= -camera.perspective) {
          return { valid: false };
        }
        
        // Project to 2D with perspective
        const scale = camera.perspective / (camera.perspective + newZ);
        const projX = centerX + rotY * scale;
        const projY = centerY + rotX * scale;
        
        return {
          x: projX,
          y: projY,
          z: newZ,
          scale: scale,
          valid: true && scale > 0 && scale < 10 // Additional safety check
        };
      } catch (e) {
        console.error("Projection error:", e);
        return { valid: false };
      }
    }
    
    // Calculate wave heights based on sine functions - with more safety checks
    function calculateWaveHeights(time) {
      try {
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const x = (i - cols / 2) * spacing;
            const y = (j - rows / 2) * spacing;
            const distance = Math.sqrt(x * x + y * y);
            
            // Multiple wave sources - REDUCED WAVE HEIGHT FURTHER
            let height = 
              3 * Math.sin(distance * 0.005 + time) +
              2 * Math.sin(distance * 0.01 + time * 1.3) +
              2.5 * Math.sin(x * 0.008 + time * 0.7) +
              1.5 * Math.sin(y * 0.009 + time * 0.5) +
              1 * Math.sin((x + y) * 0.005 + time * 0.6);
            
            // Scale down with distance for a nicer effect
            height *= Math.max(5, 1 - distance * 0.0005);
            
            // Safety check for NaN values
            points[i][j] = isNaN(height) ? 0 : height;
          }
        }
      } catch (e) {
        console.error("Wave calculation error:", e);
      }
    }
    
    // Update camera with smooth transitions and subtle oscillation
    function updateCamera(deltaTime) {
      try {
        // Smoother transitions for camera movement
        const transitionSpeed = smoothTransition ? 0.02 : 0.03;
        
        // Calculate oscillations for organic camera movement - REDUCED FURTHER
        camera.oscillationX = Math.sin(time * 0.31) * 3;
        camera.oscillationY = Math.sin(time * 0.27) * 5;
        camera.oscillationZ = Math.sin(time * 0.19) * 3;
        
        // Smooth transitions (exponential ease)
        camera.x += (camera.targetX + camera.oscillationX - camera.x) * transitionSpeed;
        camera.y += (camera.targetY + camera.oscillationY - camera.y) * transitionSpeed;
        camera.z += (camera.targetZ + camera.oscillationZ - camera.z) * transitionSpeed;
        camera.perspective += (camera.targetPerspective - camera.perspective) * transitionSpeed;
        
        // Smoother rotation transitions
        const angleYDiff = (camera.targetAngleY - camera.angleY) % (Math.PI * 2);
        // Choose shortest path
        const adjustedAngleYDiff = angleYDiff > Math.PI ? angleYDiff - Math.PI * 2 : (angleYDiff < -Math.PI ? angleYDiff + Math.PI * 2 : angleYDiff);
        camera.angleY += adjustedAngleYDiff * transitionSpeed;
        camera.angleX += (camera.targetAngleX - camera.angleX) * transitionSpeed;
      } catch (e) {
        console.error("Camera update error:", e);
      }
    }
    
    // Line clipping - Liang-Barsky algorithm with error handling
    function clipLine(x0, y0, x1, y1) {
      try {
        const { left, right, top, bottom } = clipBounds;
        
        // Check for NaN values
        if (isNaN(x0) || isNaN(y0) || isNaN(x1) || isNaN(y1)) {
          return false;
        }
        
        // Check for extreme values
        if (Math.abs(x0) > 1e6 || Math.abs(y0) > 1e6 || Math.abs(x1) > 1e6 || Math.abs(y1) > 1e6) {
          return false;
        }
        
        const dx = x1 - x0;
        const dy = y1 - y0;
        
        let t0 = 0;
        let t1 = 1;
        
        const p = [-dx, dx, -dy, dy];
        const q = [x0 - left, right - x0, y0 - top, bottom - y0];
        
        for (let i = 0; i < 4; i++) {
          if (p[i] === 0) {
            if (q[i] < 0) return false; // Line parallel and outside bounds
          } else {
            const t = q[i] / p[i];
            if (p[i] < 0) {
              t0 = Math.max(t0, t);
            } else {
              t1 = Math.min(t1, t);
            }
            if (t0 > t1) return false; // Line doesn't intersect bounds
          }
        }
        
        return {
          x0: x0 + t0 * dx,
          y0: y0 + t0 * dy,
          x1: x0 + t1 * dx,
          y1: y0 + t1 * dy
        };
      } catch (e) {
        console.error("Line clipping error:", e);
        return false;
      }
    }
    
    // Main drawing function with error handling and performance optimizations
    function draw() {
      try {
        // Clear canvas
        ctx.fillStyle = darkMode ? '#0f172a' : '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate delta time
        const now = performance.now();
        const deltaTime = now - timeRef.current;
        timeRef.current = now;
        
        // Update section effect if needed
        updateSectionEffect(activeSection || 0);
        
        // Update wave heights
        calculateWaveHeights(time);
        
        // Update camera
        updateCamera(deltaTime);
        
        // Set drawing styles - ENHANCED COLORS
        const lineColor = darkMode 
          ? `rgba(56, 189, 248, ${0.3 + Math.sin(time * 0.5) * 0.1})` 
          : `rgba(37, 99, 235, ${0.3 + Math.sin(time * 0.5) * 0.1})`;
        
        const pointColor = darkMode 
          ? `rgba(56, 189, 248, ${0.6 + Math.sin(time * 0.3) * 0.2})` 
          : `rgba(37, 99, 235, ${0.6 + Math.sin(time * 0.3) * 0.2})`;
        
        // Performance optimization: Draw fewer grid lines
        const rowStep = 1; // Draw every row
        const colStep = 2; // Draw every other column
        
        // Draw grid lines (horizontal) - WITH CLIPPING
        for (let j = 0; j < rows; j += rowStep) {
          let lastValidPoint = null;
          ctx.beginPath();
          
          for (let i = 0; i < cols; i++) {
            const x = (i - cols / 2) * spacing;
            const y = (j - rows / 2) * spacing;
            const z = points[i][j];
            
            const proj = project(x, z, y);
            
            // Skip invalid projections
            if (!proj.valid) {
              lastValidPoint = null;
              continue;
            }
            
            // Check if point is in a reasonable range
            const inRange = 
              proj.x > clipBounds.left && 
              proj.x < clipBounds.right && 
              proj.y > clipBounds.top && 
              proj.y < clipBounds.bottom;
            
            if (inRange) {
              if (i === 0 || !lastValidPoint) {
                ctx.moveTo(proj.x, proj.y);
              } else {
                // Clip line to viewport expanded bounds to prevent shooting lines
                const clipped = clipLine(lastValidPoint.x, lastValidPoint.y, proj.x, proj.y);
                if (clipped) {
                  ctx.lineTo(clipped.x1, clipped.y1);
                }
              }
              lastValidPoint = {...proj};
            } else {
              lastValidPoint = null;
            }
          }
          
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        // Draw grid lines (vertical) - WITH CLIPPING
        for (let i = 0; i < cols; i += colStep) {
          let lastValidPoint = null;
          ctx.beginPath();
          
          for (let j = 0; j < rows; j++) {
            const x = (i - cols / 2) * spacing;
            const y = (j - rows / 2) * spacing;
            const z = points[i][j];
            
            const proj = project(x, z, y);
            
            // Skip invalid projections
            if (!proj.valid) {
              lastValidPoint = null;
              continue;
            }
            
            // Check if point is in a reasonable range
            const inRange = 
              proj.x > clipBounds.left && 
              proj.x < clipBounds.right && 
              proj.y > clipBounds.top && 
              proj.y < clipBounds.bottom;
            
            if (inRange) {
              if (j === 0 || !lastValidPoint) {
                ctx.moveTo(proj.x, proj.y);
              } else {
                // Clip line to viewport expanded bounds to prevent shooting lines
                const clipped = clipLine(lastValidPoint.x, lastValidPoint.y, proj.x, proj.y);
                if (clipped) {
                  ctx.lineTo(clipped.x1, clipped.y1);
                }
              }
              lastValidPoint = {...proj};
            } else {
              lastValidPoint = null;
            }
          }
          
          ctx.strokeStyle = lineColor;
          ctx.stroke();
        }
        
        // Draw grid points with size variation and pulse effect - with bigger skip for performance
        for (let i = 0; i < cols; i += 4) {
          for (let j = 0; j < rows; j += 4) {
            const x = (i - cols / 2) * spacing;
            const y = (j - rows / 2) * spacing;
            const z = points[i][j];
            
            const proj = project(x, z, y);
            
            // Skip invalid projections
            if (!proj.valid) continue;
            
            // Skip points that are outside the viewport for performance
            if (proj.x < -20 || proj.x > canvas.width + 20 || 
                proj.y < -20 || proj.y > canvas.height + 20) {
              continue;
            }
            
            // Size depends on z-position and time for pulsing effect
            const pulseEffect = Math.sin(time * 2 + x * 0.01 + y * 0.01) * 0.4 + 1;
            const pointSize = Math.max(1, 1.5 * proj.scale * pulseEffect);
            
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, pointSize, 0, Math.PI * 2);
            ctx.fillStyle = pointColor;
            ctx.fill();
          }
        }
        
        // Update time for animation (variable rate based on section)
        const timeScale = activeSection === 0 ? 1 : (activeSection === 3 ? 1.5 : 1.2);
        time += waveSpeed * timeScale;
        
        // Continue animation
        animationRef.current = requestAnimationFrame(draw);
      } catch (e) {
        console.error("Drawing error:", e);
        // Try to recover from error by restarting animation
        animationRef.current = requestAnimationFrame(draw);
      }
    }
    
    // Apply initial section effect
    timeRef.current = performance.now();
    updateSectionEffect(activeSection || 0);
    
    // Start animation
    animationRef.current = requestAnimationFrame(draw);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [darkMode, activeSection, smoothTransition]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0"
      style={{ 
        background: darkMode ? '#0f172a' : '#f8fafc',
        opacity: 0.9, // Slightly reduced opacity for better readability
        width: '100vw',
        height: '100vh'
      }}
    />
  );
}