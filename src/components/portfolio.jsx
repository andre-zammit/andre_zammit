'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, LineChart, Database, Code, BrainCircuit, ChevronDown, Linkedin } from 'lucide-react';
import DataGridAnimation from './WaveAnimation';

const Portfolio = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [prevSection, setPrevSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState('down'); // Track scroll direction
  const [animationsComplete, setAnimationsComplete] = useState(true); // Track if animations are complete
  const sections = ['hero', 'skills', 'experience', 'projects', 'contact'];
  const sectionRefs = useRef([]);
  const scrolling = useRef(false);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Wheel event handler for fullscreen section transitions
    const handleWheel = (e) => {
      e.preventDefault(); // Prevent default scrolling
      
      if (scrolling.current) return;
      
      scrolling.current = true;
      
      // Normalize the scroll delta to handle different wheel sensitivities
      const normalizedDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100);
      
      if (normalizedDelta > 0 && activeSection < sections.length - 1) {
        // Scroll down
        setDirection('down');
        setPrevSection(activeSection);
        changeSection(activeSection + 1);
      } else if (normalizedDelta < 0 && activeSection > 0) {
        // Scroll up
        setDirection('up');
        setPrevSection(activeSection);
        changeSection(activeSection - 1);
      }
      
      // Prevent rapid scrolling - longer delay for more control
      setTimeout(() => {
        scrolling.current = false;
      }, 1200);
    };
    
    // Prevent default scrolling behavior
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(timer);
    };
  }, [darkMode, activeSection, sections.length]);
  
  // Touch and keyboard event handling
  useEffect(() => {
    let touchStartY = 0;
    const touchThreshold = 50;
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      if (scrolling.current) return;
      
      const touchEndY = e.touches[0].clientY;
      const diff = touchStartY - touchEndY;
      
      if (Math.abs(diff) > touchThreshold) {
        scrolling.current = true;
        
        if (diff > 0 && activeSection < sections.length - 1) {
          // Swipe up (go down)
          setDirection('down');
          setPrevSection(activeSection);
          changeSection(activeSection + 1);
        } else if (diff < 0 && activeSection > 0) {
          // Swipe down (go up)
          setDirection('up');
          setPrevSection(activeSection);
          changeSection(activeSection - 1);
        }
        
        // Reset touch position
        touchStartY = touchEndY;
        
        // Prevent rapid scrolling
        setTimeout(() => {
          scrolling.current = false;
        }, 1200);
      }
    };
    
    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (scrolling.current) return;
      
      // Arrow keys, Page Up/Down, Home/End
      if ([33, 38, 36].includes(e.keyCode) && activeSection > 0) {
        // Page Up, Arrow Up, Home - go up
        e.preventDefault();
        scrolling.current = true;
        setDirection('up');
        setPrevSection(activeSection);
        changeSection(activeSection - 1);
      } else if ([34, 40, 35].includes(e.keyCode) && activeSection < sections.length - 1) {
        // Page Down, Arrow Down, End - go down
        e.preventDefault();
        scrolling.current = true;
        setDirection('down');
        setPrevSection(activeSection);
        changeSection(activeSection + 1);
      }
      
      // Prevent rapid scrolling
      setTimeout(() => {
        scrolling.current = false;
      }, 1000);
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection, sections.length]);
  
  // Change section with transition
  const changeSection = (index) => {
    if (index === activeSection) return; // Don't transition to same section
    
    setTransitioning(true);
    setAnimationsComplete(false);
    
    // Start transition
    setTimeout(() => {
      setActiveSection(index);
      
      // Complete transition
      setTimeout(() => {
        setTransitioning(false);
        
        // Mark animations as complete after they've had time to run
        setTimeout(() => {
          setAnimationsComplete(true);
        }, 800);
      }, 500);
    }, 200);
  };
  
  // Reset refs when needed
  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, 0);
  }, []);

  // Scroll to active section with smooth camera movement
  useEffect(() => {
    if (sectionRefs.current[activeSection]) {
      // Use timeout to ensure DOM has updated
      // Longer delay for the last section to ensure animations complete
      const delay = activeSection === sections.length - 1 ? 100 : 50;
      
      setTimeout(() => {
        // Special handling for the last section
        if (activeSection === sections.length - 1) {
          const container = document.querySelector('.sections-container');
          if (container) {
            // Manual scroll for better control with the last section
            container.style.scrollBehavior = 'smooth';
            const targetSection = sectionRefs.current[activeSection];
            const targetPosition = targetSection.offsetTop;
            
            // Use animated scroll for better control
            const startPosition = container.scrollTop;
            const distance = targetPosition - startPosition;
            const duration = 700;
            let startTime = null;
            
            function animation(currentTime) {
              if (startTime === null) startTime = currentTime;
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Easing function for smoother motion
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              
              container.scrollTop = startPosition + distance * easeProgress;
              
              if (elapsed < duration) {
                requestAnimationFrame(animation);
              }
            }
            
            requestAnimationFrame(animation);
          }
        } else {
          // Standard behavior for other sections
          sectionRefs.current[activeSection]?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, delay);
    }
  }, [activeSection, sections.length]);

  // Add refs to section refs array with accurate indexing
  const addToRefs = (el) => {
    if (!el) return;
    
    const index = parseInt(el.dataset.index, 10);
    if (isNaN(index)) return;
    
    // Ensure array has enough spots
    while (sectionRefs.current.length <= index) {
      sectionRefs.current.push(null);
    }
    
    // Set the element at its correct index
    sectionRefs.current[index] = el;
  };

  // Skills section
  const skills = [
    { 
      name: "Data Visualization", 
      icon: <LineChart className="w-6 h-6" />, 
      desc: "Creating interactive dashboards and real-time metrics", 
      details: [
        "Developed executive-level dashboards tracking KPIs across multiple business units",
        "Built real-time data monitoring systems for operational metrics",
        "Created custom visualizations for financial compliance reporting",
        "Designed user-friendly interfaces to present complex data relationships"
      ]
    },
    { 
      name: "Programming", 
      icon: <Code className="w-6 h-6" />, 
      desc: "Skilled in Python, SQL, and TypeScript", 
      details: [
        "Assisted in creation of automated data processing workflows in Python",
        "Built database queries and data models with SQL",
        "Created interactive front-end components using TypeScript",
        "Researched and guided ETL pipelines for large-scale data migration"
      ]
    },
    { 
      name: "Machine Learning", 
      icon: <BrainCircuit className="w-6 h-6" />, 
      desc: "Implementing LLMs and text classification systems", 
      details: [
        "Leveraged chatbot interaction data to improve user experience",
        "Implemented text classification models for product improvement and analysis",
        "Prompt engineering and result analysis for LLMs",
        "Fine-tuned LLMs for domain-specific applications"
      ]
    },
    { 
      name: "Databases", 
      icon: <Database className="w-6 h-6" />, 
      desc: "Experience with PostgreSQL, AWS, and Kafka", 
      details: [
        "Designed and maintained scalable database architectures",
        "Implemented data streaming solutions with Kafka",
        "Utilised cloud-based data infrastructure through AWS services",
        "Optimized query performance for large-scale data operations"
      ]
    }
  ];

  // Loading screen
  if (loading) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-50' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-3xl font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`font-sans transition-colors duration-500 ${darkMode ? 'bg-gray-900 text-gray-50' : 'bg-gray-50 text-gray-900'} fullpage-container`}>
      <DataGridAnimation darkMode={darkMode} activeSection={activeSection} smoothTransition={true} />
      
      {/* Fixed NavDots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-4">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > activeSection ? 'down' : 'up');
              setPrevSection(activeSection);
              changeSection(index);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              activeSection === index
                ? darkMode ? 'bg-blue-400 scale-125' : 'bg-blue-600 scale-125'
                : darkMode ? 'bg-gray-600 hover:bg-gray-400' : 'bg-gray-300 hover:bg-gray-500'
            }`}
            aria-label={`Go to ${sections[index]} section`}
          />
        ))}
      </div>
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-20 backdrop-blur-md ${darkMode ? 'bg-gray-900/20' : 'bg-white/10'}`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">AZ</div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </nav>
      
      {/* Sections Container - Added overflow-hidden to prevent scrollbar */}
      <div className={`sections-container snap-y snap-mandatory h-screen overflow-hidden transition-all duration-500 ease-in-out ${transitioning ? 'transitioning' : ''} ${direction}`} data-direction={direction}>
        {/* Hero Section */}
        <section 
          ref={addToRefs} 
          className={`section snap-start h-screen w-full flex items-center justify-center transition-opacity duration-500 ${
            activeSection === 0 ? 'active opacity-100' : 
            prevSection === 0 ? `prev-active ${direction}-direction opacity-0` : 'opacity-0'
          } ${direction}-direction`}
          data-index={0}
        >
          <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center z-10">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 hero-title tracking-tight">
              <span className="block mt-8">ANDRÉ ZAMMIT</span>
            </h1>
            <p className={`text-2xl md:text-4xl mb-10 ${darkMode ? 'text-blue-300' : 'text-blue-600'} font-light hero-subtitle tracking-wide`}>
              Data Analyst
            </p>
            <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-900/40 backdrop-blur-lg border border-blue-900/30' : 'bg-white/40 backdrop-blur-lg border border-blue-200'} max-w-2xl hero-text`}>
              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} text-lg leading-relaxed mb-4`}>
                Results-driven Data Analyst specializing in transforming complex data into actionable insights through intuitive visualizations and automated solutions.
              </p>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div>
                  <h3 className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'} font-semibold mb-1`}>EDUCATION</h3>
                  <p className="text-base">Bachelor of Commerce, University of Malta</p>
                  <p className="text-sm">Accounting & Insurance (2014-2017)</p>
                </div>
                <div>
                  <h3 className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'} font-semibold mb-1`}>LOCATION</h3>
                  <p className="text-base">Attard, Malta</p>
                </div>
                <div>
                  <h3 className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'} font-semibold mb-1`}>EXPERTISE</h3>
                  <p className="text-base">Data Visualization, Machine Learning, LLM Implementation</p>
                </div>
                <div>
                  <h3 className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'} font-semibold mb-1`}>INTERESTS</h3>
                  <p className="text-base">Gaming, Music, Fitness</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setDirection('down');
                setPrevSection(0);
                changeSection(1);
              }} 
              className={`mt-12 animate-bounce ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} 
              aria-label="Scroll to skills section"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>
        </section>
        
        {/* Skills Section */}
        <section 
          ref={addToRefs} 
          className={`section snap-start h-screen w-full flex items-center justify-center transition-opacity duration-500 ${
            activeSection === 1 ? 'active opacity-100' : 
            prevSection === 1 ? `prev-active ${direction}-direction opacity-0` : 'opacity-0'
          } ${direction}-direction`}
          data-index={1}
        >
          <div className="container mx-auto px-4 py-16 z-10">
            <h2 className={`text-3xl md:text-5xl font-bold mb-16 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'} skills-title`}>
              Core Competencies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {skills.map((skill, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-xl transition-all hover:scale-105 skill-card ${
                    darkMode 
                      ? 'bg-gray-900/30 backdrop-blur-md' 
                      : 'bg-white/30 backdrop-blur-md'
                  }`}
                >
                  <div className={`p-3 rounded-lg mb-4 inline-block ${darkMode ? 'bg-gray-800' : 'bg-blue-100'}`}>
                    {React.cloneElement(skill.icon, { 
                      className: `w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                    })}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{skill.name}</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{skill.desc}</p>
                  <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                    {skill.details.map((detail, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 text-blue-500 text-xs mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Experience Section */}
        <section 
          ref={addToRefs} 
          className={`section snap-start h-screen w-full flex items-center justify-center transition-opacity duration-500 ${
            activeSection === 2 ? 'active opacity-100' : 
            prevSection === 2 ? `prev-active ${direction}-direction opacity-0` : 'opacity-0'
          } ${direction}-direction`}
          data-index={2}
        >
          <div className="container mx-auto px-4 py-16 z-10">
            <h2 className={`text-3xl md:text-5xl font-bold mb-12 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'} experience-title`}>
              Professional Experience
            </h2>
            <div className="max-w-4xl mx-auto">
              {/* Timeline layout for experience */}
              <div className="space-y-12">
                {/* Junior Data Scientist */}
                <div className="relative pl-8 md:pl-12 experience-card">
                  {/* Timeline line */}
                  <div className={`absolute left-0 top-0 h-full w-0.5 ${darkMode ? 'bg-blue-500/30' : 'bg-blue-600/20'}`}></div>
                  {/* Timeline dot */}
                  <div className={`absolute left-[-8px] top-1 h-4 w-4 rounded-full border-2 ${darkMode ? 'bg-gray-900 border-blue-400' : 'bg-white border-blue-600'}`}></div>
                  
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900/30 backdrop-blur-md' : 'bg-white/30 backdrop-blur-md'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Junior Data Scientist</h3>
                      <div className="flex items-center mt-2 md:mt-0">
                        <span className="font-medium">Red Acre Ltd.</span>
                        <span className={`ml-4 px-2 py-1 text-xs rounded ${darkMode ? 'bg-blue-900/50 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
                          Oct '23 - Present
                        </span>
                      </div>
                    </div>
                    <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <li className="flex">
                        <span className="mr-2 text-blue-500">•</span>
                        <span>Leveraged chatbot interaction data to develop analytical reports, improving operational efficiency.</span>
                      </li>
                      <li className="flex">
                        <span className="mr-2 text-blue-500">•</span>
                        <span>Architected scalable data processing workflows with rigorous quality control protocols.</span>
                      </li>
                      <li className="flex">
                        <span className="mr-2 text-blue-500">•</span>
                        <span>Translated complex interaction data into business insights using advanced visualization techniques.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Business Intelligence Analyst */}
                <div className="relative pl-8 md:pl-12 experience-card">
                  <div className={`absolute left-0 top-0 h-full w-0.5 ${darkMode ? 'bg-blue-500/30' : 'bg-blue-600/20'}`}></div>
                  <div className={`absolute left-[-8px] top-1 h-4 w-4 rounded-full border-2 ${darkMode ? 'bg-gray-900 border-blue-400' : 'bg-white border-blue-600'}`}></div>
                  
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900/30 backdrop-blur-md' : 'bg-white/30 backdrop-blur-md'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Business Intelligence Analyst</h3>
                      <div className="flex items-center mt-2 md:mt-0">
                        <span className="font-medium">Red Acre Ltd.</span>
                        <span className={`ml-4 px-2 py-1 text-xs rounded ${darkMode ? 'bg-blue-900/50 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
                          Nov '20 - Oct '23
                        </span>
                      </div>
                    </div>
                    <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <li className="flex">
                        <span className="mr-2 text-blue-500">•</span>
                        <span>Designed comprehensive business intelligence dashboards tracking revenue metrics and operational KPIs.</span>
                      </li>
                      <li className="flex">
                        <span className="mr-2 text-blue-500">•</span>
                        <span>Created customized visualizations and automated reporting solutions for executive decision making.</span>
                      </li>
                      <li className="flex">
                        <span className="mr-2 text-blue-500">•</span>
                        <span>Monitored campaign effectiveness and customer success metrics to optimize revenue streams.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Projects Section */}
        <section 
          ref={addToRefs} 
          className={`section snap-start h-screen w-full flex items-center justify-center transition-opacity duration-500 ${
            activeSection === 3 ? 'active opacity-100' : 
            prevSection === 3 ? `prev-active ${direction}-direction opacity-0` : 'opacity-0'
          } ${direction}-direction`}
          data-index={3}
        >
          <div className="container mx-auto px-4 py-16 z-10">
            <h2 className={`text-3xl md:text-5xl font-bold mb-16 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'} projects-title`}>
              Data Visualization Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Project Placeholders - Would be replaced with actual components */}
              {[1, 2].map((_, i) => (
                <div 
                  key={i}
                  className={`p-8 rounded-xl aspect-video flex items-center justify-center project-card ${
                    darkMode 
                      ? 'bg-gray-900/30 backdrop-blur-md' 
                      : 'bg-white/30 backdrop-blur-md'
                  }`}
                >
                  <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Data Visualization Project {i+1}
                    <br />
                    <span className="text-sm">(Projects will be added here)</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Contact Section - Fixed transitions */}
        <section 
          ref={addToRefs} 
          className={`section snap-start h-screen w-full flex items-center justify-center transition-opacity duration-500 ${
            activeSection === 4 ? 'active opacity-100' : 
            prevSection === 4 ? `prev-active ${direction}-direction opacity-0` : 'opacity-0'
          } ${direction}-direction`}
          data-index={4}
        >
          <div className="container mx-auto px-4 py-16 text-center z-10">
            <h2 className={`text-3xl md:text-5xl font-bold mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-800'} contact-title`}>
              Get In Touch
            </h2>
            <div className={`max-w-md mx-auto p-8 rounded-xl ${
              darkMode 
                ? 'bg-gray-900/30 backdrop-blur-md' 
                : 'bg-white/30 backdrop-blur-md'
            } contact-card`}>
              <div className="flex flex-col gap-4 mb-6">
                <p className="text-lg">
                  <a 
                    href="mailto:zammit.andre@outlook.com" 
                    className={`font-medium flex items-center justify-center gap-2 ${
                      darkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    zammit.andre@outlook.com
                  </a>
                </p>
                <p className="text-lg">
                  <a 
                    href="https://www.linkedin.com/in/zammitandre/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`font-medium flex items-center justify-center gap-2 ${
                      darkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    <Linkedin className="w-5 h-5" /> LinkedIn Profile
                  </a>
                </p>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                &copy; {new Date().getFullYear()} André Zammit. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>
      
      <style jsx>{`
        .fullpage-container {
          height: 100vh;
          overflow: hidden;
          position: relative;
          overscroll-behavior: none; /* Prevent browser bounce effects */
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .fullpage-container::-webkit-scrollbar,
        .sections-container::-webkit-scrollbar {
          display: none;
        }
        
        /* Added styles for smoother transitions */
        .section {
          transform: translateY(0);
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          will-change: transform, opacity;
        }
        
        .section.prev-active.down-direction {
          transform: translateY(-10%);
        }
        
        .section.prev-active.up-direction {
          transform: translateY(10%);
        }
        
        /* Specific styles for the last section to ensure it transitions properly */
        .section:last-child {
          transition-duration: 0.7s;
        }
        
        /* Ensure consistent behavior for all sections */
        .sections-container {
          scroll-behavior: smooth;
          scroll-snap-type: y mandatory;
        }
        
        /* Prevent any snap behaviors from overriding our transitions */
        .transitioning .section {
          scroll-snap-align: none;
        }
        
        /* Added animations for hero section elements */
        @keyframes fadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .hero-title {
          animation: fadeUp 0.8s ease-out forwards;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          letter-spacing: -1px;
        }
        
        .hero-subtitle {
          animation: fadeUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .hero-text {
          animation: fadeUp 0.8s ease-out 0.4s forwards;
          opacity: 0;
          animation-fill-mode: forwards;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Portfolio;