import React from 'react';

const AIImageGenerator = () => {
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [img, setImg] = React.useState<string | null>(null);
  const API_WORKER_URL = import.meta.env.VITE_API_WORKER_URL;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setInput('');
    try {
      const response = await fetch(`${API_WORKER_URL}/api/ai/generate-image`, {
        method: 'POST',
        body: JSON.stringify({ prompt: input }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'image/png',
        },
      });
      console.log('Response:', response);
      setImg(await response.text());
      setLoading(false);
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
    }
  };
  return (
    <div>
      <h1>AI Image Generator</h1>
      <form onSubmit={handleSubmit}>
        <input type='text' value={input} onChange={(e) => setInput(e.target.value)} placeholder='Enter a prompt' />
        <button type='submit' disabled={loading}>
          {loading ? 'Loading...' : 'Generate Image'}
        </button>
      </form>
      {img && <img src={img} alt='Generated' />}
    </div>
  );
};

export default AIImageGenerator;
