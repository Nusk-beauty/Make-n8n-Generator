import { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    topic: '',
    audience: 'Niños de 3 a 7 años',
    tone: 'Alegre y Educativo'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate_all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al generar el video');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadProject = () => {
    if (!result) return;
    const projectContent = JSON.stringify(result, null, 2);
    const blob = new Blob([projectContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, '_')}_project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Video Kids Creator 🚀</h1>
        <p>Crea cuentos infantiles en 3D Cartoon Moderno para YouTube</p>
      </header>

      <main className="container">
        {!result && !loading && (
          <section className="form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título o Tema del Cuento:</label>
                <input
                  type="text"
                  name="topic"
                  placeholder="Ej: El conejito valiente que quería volar"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Público Objetivo:</label>
                <select name="audience" value={formData.audience} onChange={handleChange}>
                  <option>Niños de 3 a 7 años</option>
                  <option>Niños de 8 a 12 años</option>
                  <option>Para toda la familia</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tono del Cuento:</label>
                <select name="tone" value={formData.tone} onChange={handleChange}>
                  <option>Alegre y Educativo</option>
                  <option>Aventura y Emoción</option>
                  <option>Calmado para Dormir</option>
                  <option>Divertido y Humorístico</option>
                </select>
              </div>
              <button type="submit" className="submit-btn">✨ Generar Cuento Completo</button>
            </form>
          </section>
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>La IA está creando tu mundo 3D... Esto puede tardar unos segundos.</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ Error: {error}
          </div>
        )}

        {result && (
          <div className="result-container">
            <div className="actions">
              <button onClick={() => setResult(null)} className="back-btn">⬅️ Crear Otro</button>
              <button onClick={downloadProject} className="download-btn">💾 Descargar Proyecto</button>
            </div>

            <header className="result-header">
              <h2>{result.title}</h2>
              <div className="thumbnail-box">
                <h3>Miniatura YouTube (3D Cartoon Moderno):</h3>
                <img src={result.thumbnail_url} alt="Thumbnail preview" className="thumbnail-img" />
              </div>
            </header>

            <section className="seo-section">
              <h3>🚀 SEO YouTube</h3>
              <p><strong>Título:</strong> {result.seo.youtube_title}</p>
              <p><strong>Descripción:</strong> {result.seo.description}</p>
              <p><strong>Keywords:</strong> {result.seo.keywords.join(', ')}</p>
            </section>

            <section className="story-scenes">
              <h3>🎬 Escenas del Video</h3>
              {result.story.map((scene) => (
                <div key={scene.scene_number} className="scene-card">
                  <div className="scene-info">
                    <h4>Escena {scene.scene_number}</h4>
                    <p className="scene-text">{scene.text}</p>
                    <div className="scene-prompt">
                      <strong>AI Prompt:</strong> <code>{scene.image_prompt}</code>
                    </div>
                  </div>
                  <div className="scene-image">
                    <img src={scene.image_url} alt={`Scene ${scene.scene_number}`} />
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
