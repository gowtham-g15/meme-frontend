import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

const debounce = (func, wait) => {
  let timeout;
  
  const debounced = function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  
  return debounced;
};

import { useNavigate } from 'react-router-dom';
import '../styles/CreateMeme.css';

const MEME_TEMPLATES = [
  { id: 1, name: 'One Does Not Simply', url: 'https://i.imgflip.com/1bij.jpg' },
  { id: 2, name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1bgw.jpg' },
  { id: 3, name: 'Drake Hotline Bling', url: 'https://i.imgflip.com/30b1gx.jpg' },
  { id: 4, name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
  { id: 5, name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
];

const CreateMeme = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [myMemes, setMyMemes] = useState([]);

  const fetchMyMemes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user not logged in');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8080/api/memes/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const memes = await response.json();
      setMyMemes(memes);
    } catch (err) {
      console.error('Error fetching memes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyMemes();
  }, [fetchMyMemes]);

  const handleSave = async () => {
    if (!selectedTemplate) {
      alert('Please select a template or upload an image first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in to save memes.');
      }
      
      const response = await fetch('http://localhost:8080/api/memes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topText,
          bottomText,
          imageUrl: selectedTemplate.url,
          templateName: selectedTemplate.name || 'Custom Meme',
          uploadOption: selectedTemplate.id === 'custom' ? 'upload' : 'template'
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save meme');
      }
      
      console.log('Meme saved successfully:', responseData);
      
  
      setMyMemes(prevMemes => {
        if (Array.isArray(prevMemes)) {
          return [...prevMemes, responseData];
        }
        return [responseData];
      });

      setSelectedTemplate(null);
      setTopText('');
      setBottomText('');
      
      alert('Meme saved successfully!');
    } catch (err) {
      console.error('Error saving meme:', err);
      alert(err.message || 'Failed to save meme. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTopText('');
    setBottomText('');
  };

  const drawTextWithStroke = useCallback((ctx, text, x, y, size) => {
    if (!ctx) return;
    
    ctx.font = `bold ${size}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = size / 5;
    ctx.strokeText(text, x, y);
    

    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
  }, []);


  const generateMeme = useCallback(() => {
    if (!selectedTemplate || !canvasRef.current) return;
    
    setIsLoading(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsLoading(false);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        console.log('Image loaded:', { width: img.width, height: img.height });
      
        const containerWidth = 500;
        const containerHeight = 500;
        
        const aspectRatio = img.width / img.height;
        let width, height;
        
        if (img.width > img.height) {
          width = Math.min(containerWidth, img.width);
          height = width / aspectRatio;
          if (height > containerHeight) {
            height = containerHeight;
            width = height * aspectRatio;
          }
        } else {
          height = Math.min(containerHeight, img.height);
          width = height * aspectRatio;
          if (width > containerWidth) {
            width = containerWidth;
            height = width / aspectRatio;
          }
        }
        
        console.log('Setting canvas size:', { width, height });
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        const scale = window.devicePixelRatio || 1;
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        ctx.scale(scale, scale);
        
  
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        if (topText || bottomText) {
          const textSize = Math.max(20, Math.floor(width / 15));
          
          if (topText) {
            ctx.textBaseline = 'top';
            drawTextWithStroke(ctx, topText, width / 2, 10, textSize);
          }
          
          if (bottomText) {
            ctx.textBaseline = 'bottom';
            drawTextWithStroke(ctx, bottomText, width / 2, height - 10, textSize);
          }
        }
        
      } catch (error) {
        console.error('Error drawing on canvas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      console.log('Image URL:', selectedTemplate.url);
      setIsLoading(false);
    };
    
    
    console.log('Loading image:', selectedTemplate.url);
    img.src = selectedTemplate.url;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [selectedTemplate, topText, bottomText, drawTextWithStroke]);
  
  useEffect(() => {
    generateMeme();
  }, [generateMeme]);

  const downloadMeme = () => {
    const link = document.createElement('a');
    link.download = 'my-meme.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setSelectedTemplate({
          id: 'custom',
          name: file.name || 'Custom Image',
          url: event.target.result
        });
      } catch (error) {
        console.error('Error processing uploaded file:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleResize = useCallback(() => {
    if (canvasRef.current && selectedTemplate) {
      generateMeme();
    }
  }, [generateMeme, selectedTemplate]);

  const debouncedResize = useMemo(
    () => debounce(handleResize, 100),
    [handleResize]
  );

  useEffect(() => {
    if (!selectedTemplate) return;
    
   
    const currentDebouncedResize = debouncedResize;
    
    window.addEventListener('resize', currentDebouncedResize);
    
    currentDebouncedResize();
    
    return () => {
      window.removeEventListener('resize', currentDebouncedResize);
      
      currentDebouncedResize.cancel();
    };
  }, [debouncedResize, selectedTemplate]);
  
  useEffect(() => {
    generateMeme();
  }, [topText, bottomText, selectedTemplate, generateMeme]);

  return (
    <div className="create-meme-container">
      <div className="page-header">
        <button 
          onClick={() => navigate('/')} 
          className="back-to-home"
        >
          ← Back to Home
        </button>
        <h2>Create Your Meme</h2>
      </div>
      
      <div className="meme-editor">
        <div className="template-selector">
          <h3>Choose a Template</h3>
          <div className="template-grid">
            {MEME_TEMPLATES.map((template) => (
              <div 
                key={template.id}
                className={`template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => handleTemplateSelect(template)}
              >
                <img src={template.url} alt={template.name} />
                <span>{template.name}</span>
              </div>
            ))}
          </div>
          
          <div className="upload-section">
            <h4>Or upload your own image</h4>
            <input
              type="file"
              id="meme-upload"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="meme-upload" className="upload-btn">
              Choose File
            </label>
            {selectedTemplate?.id === 'custom' && (
              <span className="file-name">{selectedTemplate.name}</span>
            )}
          </div>
        </div>
        
        <div className="meme-preview">
          <h3>Preview</h3>
          <div className="canvas-container">
            {isLoading ? (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            ) : selectedTemplate ? (
              <canvas ref={canvasRef} className="meme-canvas" />
            ) : (
              <div className="no-template-selected">
                <p>Select a template or upload an image to get started</p>
              </div>
            )}
          </div>
          
          <div className="meme-controls">
            <div className="form-group">
              <label>Top Text</label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="Top text"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Bottom Text</label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="Bottom text"
                className="form-control"
              />
            </div>
            
            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={downloadMeme}
                disabled={!selectedTemplate || isLoading}
              >
                {isLoading ? 'Processing...' : 'Download Meme'}
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={handleSave}
                disabled={!selectedTemplate || isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Meme'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #ddd' }}>
        <h3>Your Saved Memes</h3>
        {isLoading ? (
          <p>Loading your memes...</p>
        ) : myMemes.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {myMemes.map((meme) => (
              <div key={meme._id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={meme.imageUrl} 
                  alt={meme.templateName || 'Saved Meme'}
                  style={{ width: '100%', height: 'auto' }}
                />
                <div style={{ padding: '10px' }}>
                  <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{meme.templateName || 'Custom Meme'}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                    Created: {new Date(meme.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't saved any memes yet. Create and save your first meme!</p>
        )}
      </div>
    </div>
  );
};

export default CreateMeme;
