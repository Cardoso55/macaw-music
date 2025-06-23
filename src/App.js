import { useState , useRef, useEffect} from 'react';
import { Routes, Route, BrowserRouter } from 'react-router';
import React from 'react';
import Main  from './components/Main';
import Header from './components/Header';
import Search from './pages/Search';
import Artist from './pages/Artist';
import Album from './pages/Album';
import Playlists from './pages/Playlists';
import PlaylistView from './pages/PlaylistView';
import History from './pages/History';
import Login from './pages/Login'
import Sidebar from './components/Sidebar';
import Register from './pages/Register';
import Player from './components/Player';
import CriarPlaylist from './pages/CriarPlaylist';
import ArtistCard from './components/ArtistCard';
import HeaderPlaylists from './components/HeaderPlaylists';
import AlbumContent from './components/AlbumContent';
import { useLocation } from 'react-router-dom';


function App() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [letra, setLetra] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [infoMusica, setInfoMusica] = useState({});
  const [topMusicas, setTopMusicas] = useState([]);
  const [artistaSelecionado, setArtistaSelecionado] = useState(null);
  const generosComIds = [
    { nome: 'Rock', id: 152 },
    { nome: 'Pop', id: 132 },
    { nome: 'Jazz', id: 129 },
    { nome: 'Electro', id: 106 },
    { nome: 'Reggae', id: 144 },
    { nome: 'Funk', id: 472 }, 
    { nome: 'Sertanejo', id: 80 },
    { nome: 'Trap', id: 465 },  
    { nome: 'MPB', id: 78 }, 
    { nome: 'Samba e Pagóde', id: 79},
    { nome: 'Metal', id: 464},
  ];
  const [musicasPorGenero, setMusicasPorGenero] = useState({});
  const audioRef = useRef(null);
  const location = useLocation();
  const currentPath = location.pathname;
 const showPlayer =
  currentPath === '/' ||
  currentPath.startsWith('/artist/') ||
  currentPath.startsWith('/album/');


  useEffect(() => {
    buscarGeneros();
  }, []);

  const buscarMusica = async (q) => {
    if (!q) {
      setResultados([]);
      setPlaylist([]);
      return;
    }

    const url = `https://deezerdevs-deezer.p.rapidapi.com/search?q=${encodeURIComponent(q)}`;

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'a534008d60mshec9500de3c5977bp1e540cjsn7cfd3cdff862',
        'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
      }
    };
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      setResultados(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Erro ao buscar música:', error);
    }
  };

  const buscarArtista = async (q) => {
  if (!q) {
    setArtistas([]);
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/deezer/search/artist?q=${encodeURIComponent(q)}`);

    const data = await res.json();

    if (Array.isArray(data.data)) {
      console.log('✅ Artistas encontrados via proxy:', data.data);
      setArtistas(data.data);
    } else {
      console.warn('⚠️ Nenhum artista encontrado');
      setArtistas([]);
    }
  } catch (error) {
    console.error('❌ Erro ao buscar artista via proxy:', error);
    setArtistas([]);
  }
};

  const buscarGeneros = () => {
    generosComIds.forEach(({ nome, id }) => {
      buscarMusicasPorGenero(id, nome);
    });
  };

  const buscarMusicasPorGenero = (genreId, generoNome) => {
    const callback = 'jsonp_callback_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');

    window[callback] = (data) => {
      const artistas = data.data || [];

      // Pega os top 2 artistas para não fazer muitas requisições
      artistas.slice(0, 3).forEach((artista) => {
        const callbackArtista = 'jsonp_callback_' + Math.floor(Math.random() * 100000);
        const scriptArtista = document.createElement('script');

        window[callbackArtista] = (dataMusicas) => {
          const musicas = dataMusicas.data || [];
          setMusicasPorGenero(prev => {
            const existingMusicas = prev[generoNome] || [];
            const novasSemRepetir = musicas.filter(m => !existingMusicas.some(em => em.id === m.id));
            return {
              ...prev,
              [generoNome]: [...existingMusicas, ...novasSemRepetir]
            }
          });
          delete window[callbackArtista];
          document.body.removeChild(scriptArtista);
        };

        scriptArtista.src = `https://api.deezer.com/artist/${artista.id}/top?limit=6&output=jsonp&callback=${callbackArtista}`;
        document.body.appendChild(scriptArtista);
      });

      delete window[callback];
      document.body.removeChild(script);
    };

    script.src = `https://api.deezer.com/genre/${genreId}/artists?output=jsonp&callback=${callback}`;
    document.body.appendChild(script);
  };
  
  const tocarPreview = (url, index, novaPlaylist) => {
  if (!url) {
    alert('Essa música não tem preview disponível.');
    return;
  }

  const player = audioRef.current;

  if (player) {
    // ✅ evita tocar a mesma música duas vezes
    if (player.src === url && !player.paused) {
      console.log('🎵 Música já está tocando.');
      return;
    }

    player.src = url;
    player.play();
  }

  setPlaylist(novaPlaylist);
  setCurrentIndex(index);
  setIsPlaying(true);
};
  
  const buscarLetra = async (artista, musica, capa) => {
  const url = `http://localhost:5000/lyrics?artist=${encodeURIComponent(artista)}&title=${encodeURIComponent(musica)}`;


  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data.lyrics) {
      console.log('Letra da música:', data.lyrics);
      const letraComEstrofesSeparadas = data.lyrics.replace(/([^\n])\n(?=[^\n])/g, '$1\n');
      setLetra(letraComEstrofesSeparadas);
      setInfoMusica({artista, musica, capa});
      setMostrarModal(true);
    } else {
      console.warn('Letra não encontrada.');
    }
  } catch (error) {
    console.error('Erro ao buscar letra:', error.message);
  }
};


  return (
    <div>
        <Routes>
          <Route path='/' element={
            <>
              <Sidebar/> 
              <Header query={query} setQuery={setQuery} buscarMusica={buscarMusica} buscarArtista={buscarArtista} />
              <Main 
                resultados={resultados} 
                artistas={artistas}
                musicasPorGenero={musicasPorGenero} 
                tocarPreview={tocarPreview}  
                buscarLetra={buscarLetra}
                setPlaylist={setPlaylist}
                setCurrentIndex={setCurrentIndex}
                setIsPlaying={setIsPlaying}
                artista={artistaSelecionado}
                topMusicas={topMusicas}
              />
            </>
          }/>
          <Route path="/artist/:id" element={ 
          <Artist
            setPlaylist={setPlaylist}
            setCurrentIndex={setCurrentIndex}
            setIsPlaying={setIsPlaying}
            tocarPreview={tocarPreview}
            buscarLetra={buscarLetra}
          />
          
          } />
         <Route
  path="/album/:id"
  element={ 


    < >
    <Sidebar />
    <Header />
    <AlbumContent
      setPlaylist={setPlaylist}
      setCurrentIndex={setCurrentIndex}
      setIsPlaying={setIsPlaying}
    />
    </>
  }
/>

          <Route 
           path="/playlists" 
            element={
            <Playlists 
             query={query} 
      setQuery={setQuery} 
      buscarMusica={buscarMusica} 
      resultados={resultados} 
      tocarPreview={tocarPreview}
      buscarLetra={buscarLetra}
      setPlaylist={setPlaylist}
      setCurrentIndex={setCurrentIndex}
      setIsPlaying={setIsPlaying}
            />
          } 
        />

          <Route path="/playlist/:id" element={<PlaylistView buscarLetra={buscarLetra}/>} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register/>} />
          <Route path="/criar-playlist" element={<CriarPlaylist/>} />
          <Route path="/search" element={<Search />} />
        </Routes>
        {showPlayer && (
  <Player 
    playlist={playlist} 
    currentIndex={currentIndex} 
    setCurrentIndex={setCurrentIndex} 
    isPlaying={isPlaying} 
    setIsPlaying={setIsPlaying}
    audioRef={audioRef}
  />
)}
        <audio ref={audioRef} />

        {mostrarModal && (
          <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
            {console.log('infoMusica ->', infoMusica)}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="fechar-btn" onClick={() => setMostrarModal(false)}>X</button>

              <div className="info-musica-modal">
                <img src={infoMusica.capa} alt="Capa do álbum" />
                <div>
                  <h3>{infoMusica.musica}</h3>
                  <p>{infoMusica.artista}</p>
                </div>
              </div>

              <div className="letra">
                {letra.split('\n\n').map((estrofe, index) => (
                  <p key={index}>
                    {estrofe.split('\n').map((linha, i) => (
                      <React.Fragment key={i}>
                        {linha}
                        <br />
                      </React.Fragment>
                    ))}
                  </p>
                ))}
            </div>
            </div>
          </div>
        )}

    </div>
  );


}

export default App;
