import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { motion } from 'motion/react';

const TRACKS = [
  {
    id: '1',
    title: 'Mere Sapno Ki Rani',
    artist: 'Kishore Kumar',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '5:01'
  },
  {
    id: '2',
    title: 'Chaiyya Chaiyya',
    artist: 'A.R. Rahman, Sukhwinder Singh',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '6:54'
  },
  {
    id: '3',
    title: 'Tujhe Dekha Toh',
    artist: 'Kumar Sanu, Lata Mangeshkar',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:02'
  },
  {
    id: '4',
    title: 'Pehla Nasha',
    artist: 'Udit Narayan, Sadhana Sargam',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: '4:49'
  },
  {
    id: '5',
    title: 'Kya Hua Tera Wada',
    artist: 'Mohammed Rafi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: '4:24'
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5); // 0 to 1
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.url);
      audioRef.current.volume = volume;
    } else {
      // Update src when track changes, only if different
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        if (isPlaying) {
          audioRef.current.play().catch(e => console.error("Playback prevented:", e));
        }
      }
    }

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, currentTrack.url]); // Removed isPlaying from dependencies to prevent re-triggering src update logic unnecessarily

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    }
  };

  return (
    <>
      {/* Now Playing Card */}
      <section className="flex-none bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-xl w-full">
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-2xl flex items-center justify-center overflow-hidden relative group shadow-inner">
            <div className="absolute inset-0 bg-black/20"></div>
            
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-4 border-white/30 rounded-full flex items-center justify-center shadow-2xl relative"
              style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(30,30,30,0.9) 100%)' }}
            >
              <div className="w-8 h-8 bg-white rounded-full shadow-inner border border-gray-300"></div>
              {/* Record grooves */}
              <div className="absolute inset-2 rounded-full border border-white/10"></div>
              <div className="absolute inset-5 rounded-full border border-white/10"></div>
              <div className="absolute inset-8 rounded-full border border-white/10"></div>
            </motion.div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-bold truncate text-white">{currentTrack.title}</h3>
            <p className="text-sm text-zinc-500 font-medium">{currentTrack.artist}</p>
          </div>
          
          {/* Audio Visualizer Mock */}
          <div className="flex items-end justify-between h-8 gap-1 opacity-80">
            {[40, 70, 100, 50, 80, 30, 90].map((h, i) => (
              <motion.div 
                key={i}
                animate={isPlaying ? { height: ['20%', `${h}%`, '20%'] } : { height: '20%' }}
                transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                className="w-full bg-fuchsia-500 rounded-full"
                style={{ height: isPlaying ? `${h}%` : '20%' }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 group cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
            setProgress(percentage);
            if (audioRef.current && audioRef.current.duration) {
              audioRef.current.currentTime = (percentage / 100) * audioRef.current.duration;
            }
          }}>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 bottom-0 bg-white rounded-full transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase mt-1">
              <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
              <span>{currentTrack.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center px-4 pt-2">
            <button onClick={playPrev} className="text-zinc-400 hover:text-white transition-colors">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-1" />
              )}
            </button>
            <button onClick={playNext} className="text-zinc-400 hover:text-white transition-colors">
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>
        </div>
      </section>

      {/* Playlist List */}
      <section className="flex-1 bg-zinc-900 rounded-3xl p-6 border border-zinc-800 overflow-y-auto flex flex-col w-full shadow-xl">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Upcoming Vibes</h4>
        <div className="space-y-4">
          {TRACKS.map((track, i) => (
            <div 
              key={track.id} 
              className={`flex items-center gap-4 group cursor-pointer p-2 rounded-xl transition-colors ${currentTrackIndex === i ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'}`}
              onClick={() => {
                setCurrentTrackIndex(i);
                setProgress(0);
                setIsPlaying(true);
              }}
            >
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex-none flex items-center justify-center text-zinc-600">
                {currentTrackIndex === i && isPlaying ? (
                  <Music className="w-4 h-4 text-fuchsia-400" />
                ) : (
                  <span className="text-xs font-mono">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate transition-colors ${currentTrackIndex === i ? 'text-fuchsia-400' : 'group-hover:text-fuchsia-400 text-zinc-300'}`}>
                  {track.title}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">{track.artist}</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-600">{track.duration}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
