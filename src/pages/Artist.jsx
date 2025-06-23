// pages/ArtistPage.jsx
import '../styles/artist.css';

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Artist({ setPlaylist, setCurrentIndex, setIsPlaying , tocarPreview , buscarLetra }) {
  const { state } = useLocation();
  const { artista } = state || {};
  const [topMusicas, setTopMusicas] = useState([]);
  const navigate = useNavigate();
  const voltarParaHome = ()=>{navigate('/')};
  

  useEffect(() => {
    console.log('🎯 Artista recebido via state:', artista);
    console.log('🆔 ID do artista:', artista?.id);
    if (!artista) return;

    const buscarTop10DoArtista = (idArtista) => {
  const callbackName = `jsonp_callback_${Math.floor(Math.random() * 100000)}`;

  window[callbackName] = (data) => {
    console.log('🎶 Top músicas do artista:', data.data);
    setTopMusicas(data.data || []);
    delete window[callbackName];
    document.body.removeChild(script);
  };

  const script = document.createElement('script');
  script.src = `https://api.deezer.com/artist/${idArtista}/top?limit=10&output=jsonp&callback=${callbackName}`;
  document.body.appendChild(script);
};


    buscarTop10DoArtista(artista.id);
  }, [artista]);

  return (

    <div className="artist-page">
      <button className="back-button" onClick={voltarParaHome}> ⬅ </button>
      <div className="artist-header">
    
        <img src={artista.picture_xl} alt={artista.name} />
        <h1>{artista.name}</h1>
      </div>

      <h2>Top 10 músicas</h2>
      <ul className="top-musicas-lista">
      {topMusicas.map((musica, index) => (
        <li key={musica.id} className="musica-item">
          {musica.album?.cover_medium && (
  <img src={musica.album.cover_medium} alt={musica.album.title} />
)}

          <div className="musica-info">
            <strong>{musica.title}</strong>
            <p>{musica.album.title}</p>
          </div>
          <div className="musica-actions">
            <button onClick={() => tocarPreview(musica.preview, index, topMusicas)} className="button-play-artist">
              <span className="fas fa-play"></span>
            </button>
            <button
              onClick={() =>
                buscarLetra(musica.artist.name, musica.title, musica.album.cover_medium)
              }
              className="btn-letra-artist"
            >
              Letra
            </button>
          </div>
        </li>
      ))
      }
      </ul>


    </div>
  );
}

export default Artist;
