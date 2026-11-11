import { useState, useEffect, useRef, useMemo } from "react";

export default function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatIntensity, setBeatIntensity] = useState(1);
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_liked_songs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState("Feed");
  const [searchText, setSearchText] = useState("");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [moodFilterTag, setMoodFilterTag] = useState("all");
  const [notification, setNotification] = useState("");

  const [feedFilter, setFeedFilter] = useState("all");
  const [isHotkeysModalOpen, setIsHotkeysModalOpen] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isAmbientOpen, setIsAmbientOpen] = useState(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [isPinnedSidebarOpen, setIsPinnedSidebarOpen] = useState(false);

  // AI DJ State
  const [isAiDjEnabled, setIsAiDjEnabled] = useState(false);

  // Queue State (Supports Reordering)
  const [queueSongs, setQueueSongs] = useState([]);

  // Listening Streaks State
  const [streakData, setStreakData] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_streak_data");
      const today = new Date().toDateString();
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastDate === today) return parsed;
        if (parsed.lastDate === new Date(Date.now() - 86400000).toDateString()) {
          return { streak: parsed.streak + 1, lastDate: today };
        }
        return { streak: 1, lastDate: today };
      }
      return { streak: 1, lastDate: today };
    } catch {
      return { streak: 1, lastDate: new Date().toDateString() };
    }
  });

  // A-B Loop State
  const [abLoop, setAbLoop] = useState({ active: false, start: null, end: null });

  // Custom Hotkeys Remapper State
  const [hotkeys, setHotkeys] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_hotkeys");
      return saved ? JSON.parse(saved) : { playPause: "Space", next: "KeyN", prev: "KeyP" };
    } catch {
      return { playPause: "Space", next: "KeyN", prev: "KeyP" };
    }
  });

  // Song Tag Editor State
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [songMetadataOverrides, setSongMetadataOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pulse_song_metadata") || "{}");
    } catch {
      return {};
    }
  });

  const [ambientSound, setAmbientSound] = useState("none");
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [bgMode, setBgMode] = useState("dark");
  const [visualizerMode, setVisualizerMode] = useState("vinyl"); // vinyl, bars, ring
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // AI Metadata State
  const [songDetailsInfo, setSongDetailsInfo] = useState(null);
  const [isFetchingAiDetails, setIsFetchingAiDetails] = useState(false);

  // AI Spotify-Style Lyrics & Translation State
  const [aiLyricInsights, setAiLyricInsights] = useState(null);
  const [isGeneratingAiLyrics, setIsGeneratingAiLyrics] = useState(false);

  // Artist Quick-Bio & Trivia State
  const [artistTrivia, setArtistTrivia] = useState(null);
  const [isFetchingTrivia, setIsFetchingTrivia] = useState(false);

  // AI Prompt Playlist State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGeneratedList, setAiGeneratedList] = useState([]);

  const [volume, setVolume] = useState(0.8);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isInfiniteRadio, setIsInfiniteRadio] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isCrossfade, setIsCrossfade] = useState(false);

  const [recentSongs, setRecentSongs] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_recent_songs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [songPlayCounts, setSongPlayCounts] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_play_counts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [totalListeningSeconds, setTotalListeningSeconds] = useState(() => {
    return Number(localStorage.getItem("pulse_total_listening_time") || 0);
  });

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_playlists");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [activePlaylistMenuSong, setActivePlaylistMenuSong] = useState(null);

  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem("pulse_theme_color") || "#22c55e";
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [cloudSongName, setCloudSongName] = useState("");
  const [cloudSongArtist, setCloudSongArtist] = useState("");
  const [cloudSongUrl, setCloudSongUrl] = useState("");

  const [uploadedSongs, setUploadedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_uploaded_songs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [songLyrics, setSongLyrics] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_song_lyrics");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [activeLyricsSong, setActiveLyricsSong] = useState(null);
  const [lyricsEditText, setLyricsEditText] = useState("");

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [sleepTimeMinutes, setSleepTimeMinutes] = useState(0);
  const sleepTimerRef = useRef(null);
  const [sleepTimeLeft, setSleepTimeLeft] = useState(null);

  const audioRef = useRef(new Audio());
  const ambientAudioRef = useRef(new Audio());
  const handlersRef = useRef({});
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioSourceRef = useRef(null);

  const defaultSongs = [
    {
      id: 1,
      name: "Midnight Vibes",
      artist: "Pulse Artist",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500",
      mood: "chill",
    },
    {
      id: 2,
      name: "Neon Nights",
      artist: "DJ Nova",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      artwork: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500",
      mood: "hype",
    },
    {
      id: 3,
      name: "Summer Dreams",
      artist: "Sky Beats",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500",
      mood: "focus",
    },
  ];

  const allSongs = useMemo(
    () => [...defaultSongs, ...uploadedSongs].map((song) => ({
      ...song,
      ...(songMetadataOverrides[song.id] || {}),
    })),
    [uploadedSongs, songMetadataOverrides]
  );

  useEffect(() => {
    if (queueSongs.length === 0 && allSongs.length > 0) {
      setQueueSongs(allSongs);
    }
  }, [allSongs]);

  const filteredSongs = useMemo(() => {
    return allSongs.filter((song) => {
      const matchesSearch =
        song.name.toLowerCase().includes(searchText.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchText.toLowerCase());
      const matchesMood = moodFilterTag === "all" || song.mood === moodFilterTag;

      if (feedFilter === "liked") {
        return matchesSearch && matchesMood && likedSongs.includes(song.name);
      }
      return matchesSearch && matchesMood;
    });
  }, [allSongs, searchText, moodFilterTag, feedFilter, likedSongs]);

  const mostPlayedSongs = useMemo(() => {
    return [...allSongs]
      .sort((a, b) => (songPlayCounts[b.name] || 0) - (songPlayCounts[a.name] || 0))
      .slice(0, 5);
  }, [allSongs, songPlayCounts]);

  const topArtists = useMemo(() => {
    const counts = {};
    allSongs.forEach((song) => {
      const plays = songPlayCounts[song.name] || 1;
      counts[song.artist] = (counts[song.artist] || 0) + plays;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [allSongs, songPlayCounts]);

  // Gamified Badges & Milestones Logic
  const unlockedBadges = useMemo(() => {
    const totalMins = Math.floor(totalListeningSeconds / 60);
    return [
      { id: "streak", title: "Streak Master", desc: "Reach a 3-day listening streak", icon: "🔥", unlocked: streakData.streak >= 3 },
      { id: "time", title: "Dedicated Listener", desc: "Stream music for over 15 minutes", icon: "🎧", unlocked: totalMins >= 15 },
      { id: "liked", title: "Heartfelt Curator", desc: "Like 3 or more songs", icon: "❤️", unlocked: likedSongs.length >= 3 },
      { id: "upload", title: "Sound Explorer", desc: "Upload or add a custom track", icon: "🚀", unlocked: uploadedSongs.length > 0 }
    ];
  }, [totalListeningSeconds, streakData.streak, likedSongs, uploadedSongs]);

  const discoverWeeklySongs = useMemo(() => {
    return [...allSongs].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [allSongs]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  useEffect(() => {
    localStorage.setItem("pulse_streak_data", JSON.stringify(streakData));
  }, [streakData]);

  // Queue Reordering Handler
  const moveQueueItem = (index, direction) => {
    const newQueue = [...queueSongs];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQueue.length) return;
    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIndex];
    newQueue[targetIndex] = temp;
    setQueueSongs(newQueue);
    showToast("Queue reordered!");
  };

  // AI Voice DJ Announcer
  const speakAiDjIntro = (songName, artistName) => {
    if (isAiDjEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Pulse AI DJ here. Up next: ${songName} by ${artistName}. Enjoy the rhythm!`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // AI Song & Metadata Fetcher
  const fetchAiSongDetails = async (song) => {
    if (!song) return;
    setIsFetchingAiDetails(true);
    try {
      const query = encodeURIComponent(`${song.name} ${song.artist}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        setSongDetailsInfo({
          albumOrMovie: item.collectionName || "Independent Single",
          composerOrDirector: item.artistName || song.artist,
          genre: item.primaryGenreName || "Pop / Music",
          releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : "2026",
          artworkUrl: item.artworkUrl100?.replace('100x100', '500x500') || song.artwork
        });
        showToast("✨ AI successfully retrieved artwork & details!");
      } else {
        setSongDetailsInfo({
          albumOrMovie: "Pulse Studio Original",
          composerOrDirector: song.artist,
          genre: "Electronic / Cinematic",
          releaseYear: "2026",
          artworkUrl: song.artwork
        });
        showToast("✨ AI generated metadata details!");
      }
    } catch (e) {
      setSongDetailsInfo({
        albumOrMovie: "Pulse Digital Release",
        composerOrDirector: song.artist,
        genre: "Music Track",
        releaseYear: "2026",
        artworkUrl: song.artwork
      });
      showToast("✨ AI generated fallback details!");
    }
    setIsFetchingAiDetails(false);
  };

  const fetchArtistTrivia = async (artistName) => {
    if (!artistName) return;
    setIsFetchingTrivia(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=1`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const artist = data.results[0];
        setArtistTrivia({
          name: artist.artistName,
          genre: artist.primaryGenreName || "Contemporary Music",
          type: artist.artistType || "Recording Artist",
          bio: `Prominent ${artist.primaryGenreName || "music"} creator celebrated for dynamic sound design and engaging studio performances.`
        });
        showToast("🧑‍🎤 Artist bio & trivia loaded!");
      } else {
        setArtistTrivia({
          name: artistName,
          genre: "Independent Creator",
          type: "Music Artist",
          bio: `${artistName} is an active contributor to the Pulse digital ecosystem, producing unique audio experiences.`
        });
        showToast("🧑‍🎤 Generated artist bio!");
      }
    } catch {
      setArtistTrivia({
        name: artistName,
        genre: "Music Creator",
        type: "Artist",
        bio: "Delivering immersive rhythms and memorable melodies."
      });
      showToast("🧑‍🎤 Loaded fallback artist info!");
    }
    setIsFetchingTrivia(false);
  };

  // AI Auto Lyrics Generator
  const handleAiAutoLyrics = () => {
    if (!activeLyricsSong) return;
    const sampleLrc = `[00:02.00] 🎵 Playing ${activeLyricsSong.name}\n[00:06.50] Written & performed by ${activeLyricsSong.artist}\n[00:12.00] Feel the rhythm in the air tonight\n[00:18.20] Pulse is rising, shining bright\n[00:25.00] Moving forward through the neon lights\n[00:32.40] This is our soundtrack to the midnight vibes`;
    setLyricsEditText(sampleLrc);
    showToast("✨ AI auto-generated synced lyrics!");
  };

  const generateAiLyricInsights = async () => {
    if (!currentSong) return;
    setIsGeneratingAiLyrics(true);
    showToast("✨ AI is generating Spotify-style insights & translations...");

    setTimeout(() => {
      setAiLyricInsights({
        translation: currentSyncedLyrics.length > 0
          ? currentSyncedLyrics.map((line) => ({ ...line, translated: `[En] ${line.text}` }))
          : [{ text: "♪ Immersive rhythmic cadence and melodic flow. ♪", translated: "[En] Melodic instrumental harmony." }],
        storyline: `Behind the Track: "${currentSong.name}" by ${currentSong.artist} was crafted to evoke deep atmospheric focus, blending modern digital sound design with classic emotional undertones.`
      });
      setIsGeneratingAiLyrics(false);
      showToast("✨ AI Lyrics Insights Ready!");
    }, 1000);
  };

  // AI Prompt Playlist Generator
  const handleAiPromptGenerate = () => {
    if (!aiPrompt.trim()) {
      showToast("Please enter a prompt (e.g. chill, upbeat, night)");
      return;
    }
    const query = aiPrompt.toLowerCase();
    const matched = allSongs.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query) ||
        query.includes("chill") ||
        query.includes("vibe") ||
        query.includes("mix")
    );
    setAiGeneratedList(matched.length > 0 ? matched : allSongs.slice(0, 2));
    showToast("✨ AI generated your custom playlist mix!");
  };

  useEffect(() => {
    const ambient = ambientAudioRef.current;
    ambient.volume = ambientVolume;
    if (ambientSound === "none") { ambient.pause(); }
    else if (ambientSound === "rain") {
      ambient.src = "https://assets.mixkit.co/active_storage/sfx/1255/1255-preview.mp3";
      ambient.loop = true;
      ambient.play().catch(() => {});
    } else if (ambientSound === "cafe") {
      ambient.src = "https://assets.mixkit.co/active_storage/sfx/373/373-preview.mp3";
      ambient.loop = true;
      ambient.play().catch(() => {});
    }
  }, [ambientSound, ambientVolume]);

  const toggleVoiceControl = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.onstart = () => {
        setIsListeningVoice(true);
        showToast("Listening... (Say 'Play', 'Pulse Stop', 'Next')");
      };
      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        showToast(`Heard: "${command}"`);
        if (command.includes("play")) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          });
        } else if (command.includes("pulse stop")) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else if (command.includes("next")) {
          handlersRef.current.playNext();
        } else if (command.includes("previous") || command.includes("back")) {
          handlersRef.current.playPrev();
        }
      };
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onend = () => setIsListeningVoice(false);
      recognition.start();
    } catch (e) {
      setIsListeningVoice(false);
    }
  };

  const parseLrcLyrics = (rawText) => {
    if (!rawText) return [];
    const lines = rawText.split("\n");
    const parsed = [];
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    for (let line of lines) {
      const match = timeReg.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3].padEnd(3, "0"), 10);
        const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
        const text = line.replace(timeReg, "").trim();
        parsed.push({ time: timeInSeconds, text });
      } else {
        parsed.push({ time: -1, text: line });
      }
    }
    return parsed;
  };

  const getActiveLyricIndex = (lyricsArray) => {
    if (!lyricsArray || lyricsArray.length === 0) return -1;
    let activeIdx = -1;
    for (let i = 0; i < lyricsArray.length; i++) {
      if (lyricsArray[i].time <= currentTime && lyricsArray[i].time !== -1) {
        activeIdx = i;
      }
    }
    return activeIdx;
  };

  const handleLyricSeek = (time) => {
    if (time >= 0 && audioRef.current) {
      const audio = audioRef.current;
      audio.currentTime = time;
      setCurrentTime(time);
      showToast(`Jumped to ${formatTime(time)}`);
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error(error);
        showToast("Unable to resume playback.");
      });
    }
  };

  useEffect(() => {
    localStorage.setItem("pulse_theme_color", themeColor);
  }, [themeColor]);

  // Vinyl / Canvas Visualizer Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let angle = 0;

    const render = () => {
      animationId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!isPlaying) return;

      if (visualizerMode === "vinyl") {
        angle += 0.04;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.arc(0, 0, 90, 0, 2 * Math.PI);
        ctx.fillStyle = "#111";
        ctx.fill();
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        for (let r = 30; r < 80; r += 10) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2 * Math.PI);
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      } else if (visualizerMode === "bars") {
        const bars = 24;
        const barWidth = canvas.width / bars;
        for (let i = 0; i < bars; i++) {
          const height = Math.random() * canvas.height * 0.8 + 5;
          ctx.fillStyle = themeColor;
          ctx.fillRect(i * barWidth + 2, canvas.height - height, barWidth - 4, height);
        }
      } else {
        angle += 0.05;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const baseRadius = 35 + Math.sin(angle) * 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, themeColor, visualizerMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!isPlaying || !audio) {
      setBeatIntensity(1);
      return;
    }

    let animationId;
    let fallbackTimer;

    try {
      if (!audioContextRef.current || !audioAnalyserRef.current) {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) {
          throw new Error("Web Audio API is unavailable in this browser.");
        }

        const audioContext = new AudioContextConstructor();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        audioContextRef.current = audioContext;
        audioAnalyserRef.current = analyser;
        audioSourceRef.current = source;
      }

      const audioContext = audioContextRef.current;
      const analyser = audioAnalyserRef.current;
      if (audioContext.state === "suspended") {
        audioContext.resume().catch((error) => {
          console.error("Unable to resume audio analysis:", error);
        });
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastUpdate = 0;
      const detectBeat = (timestamp) => {
        analyser.getByteFrequencyData(dataArray);
        const bassAverage = (dataArray[0] + dataArray[1] + dataArray[2] + dataArray[3]) / 4;
        if (timestamp - lastUpdate >= 80) {
          setBeatIntensity(1 + (bassAverage / 255) * 0.35);
          lastUpdate = timestamp;
        }
        animationId = requestAnimationFrame(detectBeat);
      };
      animationId = requestAnimationFrame(detectBeat);
    } catch (error) {
      console.error("Unable to start audio beat analysis:", error);
      fallbackTimer = window.setInterval(() => {
        setBeatIntensity((previous) => previous === 1 ? 1.25 : 1);
      }, 400);
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.clearInterval(fallbackTimer);
    };
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem("pulse_liked_songs", JSON.stringify(likedSongs));
    localStorage.setItem("pulse_uploaded_songs", JSON.stringify(uploadedSongs));
    localStorage.setItem("pulse_recent_songs", JSON.stringify(recentSongs));
    localStorage.setItem("pulse_play_counts", JSON.stringify(songPlayCounts));
    localStorage.setItem("pulse_playlists", JSON.stringify(playlists));
    localStorage.setItem("pulse_theme_color", themeColor);
    localStorage.setItem("pulse_song_lyrics", JSON.stringify(songLyrics));
    localStorage.setItem("pulse_total_listening_time", totalListeningSeconds);
    localStorage.setItem("pulse_song_metadata", JSON.stringify(songMetadataOverrides));
  }, [likedSongs, uploadedSongs, recentSongs, songPlayCounts, playlists, themeColor, songLyrics, totalListeningSeconds, songMetadataOverrides]);

  useEffect(() => {
    audioRef.current.volume = volume;
    audioRef.current.playbackRate = playbackRate;
  }, []);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTotalListeningSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const playSong = (song, index) => {
    const audio = audioRef.current;
    if (currentSong?.id !== song.id) {
      audio.src = song.audio;
      audio.load();
      setSongDetailsInfo(null);
      setAbLoop({ active: false, start: null, end: null });
    }
    audio.play().then(() => {
      setIsPlaying(true);
      setIsFullPlayerOpen(true);
      speakAiDjIntro(song.name, song.artist);
    }).catch((err) => {
      console.error(err);
      showToast("Error playing song. Check the audio link.");
    });

    setCurrentSong(song);
    const resolvedIndex = index !== undefined ? index : queueSongs.findIndex((s) => s.id === song.id);
    setCurrentSongIndex(resolvedIndex >= 0 ? resolvedIndex : 0);

    setSongPlayCounts((prev) => ({
      ...prev,
      [song.name]: (prev[song.name] || 0) + 1,
    }));

    setRecentSongs((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      return [song, ...filtered].slice(0, 5);
    });
  };

  const togglePlayPause = () => {
    if (!currentSong && queueSongs.length > 0) {
      playSong(queueSongs[0], 0);
      return;
    }
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const playNext = () => {
    if (queueSongs.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queueSongs.length);
      playSong(queueSongs[randomIndex], randomIndex);
      return;
    }
    const nextIndex = currentSongIndex + 1;
    if (nextIndex >= queueSongs.length) {
      if (isInfiniteRadio && allSongs.length > 0) {
        const randomSong = allSongs[Math.floor(Math.random() * allSongs.length)];
        setQueueSongs((prev) => [...prev, randomSong]);
        playSong(randomSong, queueSongs.length);
        showToast("📻 Infinite Auto-Play: Added a new track to keep the vibe going!");
        return;
      }
    }
    const safeIndex = nextIndex % queueSongs.length;
    playSong(queueSongs[safeIndex], safeIndex);
  };

  const playPrev = () => {
    if (queueSongs.length === 0) return;
    const prevIndex = (currentSongIndex - 1 + queueSongs.length) % queueSongs.length;
    playSong(queueSongs[prevIndex], prevIndex);
  };

  handlersRef.current = { togglePlayPause, playNext, playPrev };

  // Updated Keyboard Shortcuts Effect (Seek +10s / -10s, N/P for Tracks)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === "Space" || key === " " || code === (hotkeys.playPause || "Space")) {
        e.preventDefault();
        handlersRef.current.togglePlayPause?.();
      } else if (code === "ArrowRight") {
        e.preventDefault();
        if (audioRef.current && duration > 0) {
          const newTime = Math.min(duration, audioRef.current.currentTime + 10);
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          showToast("⏩ Fast Forward +10s");
        }
      } else if (code === "ArrowLeft") {
        e.preventDefault();
        if (audioRef.current) {
          const newTime = Math.max(0, audioRef.current.currentTime - 10);
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          showToast("⏪ Rewind -10s");
        }
      } else if (code === "KeyN" || key === "n") {
        e.preventDefault();
        handlersRef.current.playNext?.();
      } else if (code === "KeyP" || key === "p") {
        e.preventDefault();
        handlersRef.current.playPrev?.();
      } else if (code === "ArrowUp") {
        e.preventDefault();
        setVolume((prev) => {
          const newVol = Math.min(1.0, prev + 0.05);
          if (audioRef.current) audioRef.current.volume = newVol;
          return newVol;
        });
        showToast("Volume Up 🔊");
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setVolume((prev) => {
          const newVol = Math.max(0.0, prev - 0.05);
          if (audioRef.current) audioRef.current.volume = newVol;
          return newVol;
        });
        showToast("Volume Down 🔉");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [duration, hotkeys]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (isCrossfade && audio.duration && audio.duration - audio.currentTime <= 2 && audio.volume > 0.1) {
        audio.volume = Math.max(0.05, audio.volume - 0.05);
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      audio.volume = volume;
    };
    const handleEnded = () => {
      audio.volume = volume;
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else if (isAutoplay) {
        handlersRef.current.playNext();
      } else {
        setIsPlaying(false);
      }
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isRepeat, isAutoplay, isCrossfade, volume]);

  const toggleLike = (songName) => {
    if (likedSongs.includes(songName)) {
      setLikedSongs(likedSongs.filter((s) => s !== songName));
    } else {
      setLikedSongs([...likedSongs, songName]);
    }
  };

  const deleteUploadedSong = (id, e) => {
    e.stopPropagation();
    const targetSong = uploadedSongs.find((s) => s.id === id);
    if (currentSong?.id === id) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentSong(null);
    }
    setUploadedSongs(uploadedSongs.filter((s) => s.id !== id));
    if (targetSong && likedSongs.includes(targetSong.name)) {
      setLikedSongs(likedSongs.filter((s) => s !== targetSong.name));
    }
    showToast("Song deleted successfully.");
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioRef.current.volume = val;
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume);
      audioRef.current.volume = prevVolume;
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
      audioRef.current.volume = 0;
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    audioRef.current.playbackRate = rate;
    showToast(`🎛️ Playback Speed: ${rate}x`);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const processUploadedFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Audio = uploadEvent.target.result;
      const newSong = {
        id: Date.now() + Math.random(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Device Upload",
        audio: base64Audio,
        artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
        mood: "chill",
      };
      setUploadedSongs((prev) => [...prev, newSong]);
      setQueueSongs((prev) => [...prev, newSong]);
      showToast(`Added: ${newSong.name}`);
      setActiveTab("Feed");
    };
    reader.onerror = () => showToast("Error reading file.");
    reader.readAsDataURL(file);
  };

  const handleDeviceUpload = () => {
    if (!selectedFile) {
      showToast("Please choose an MP3 file first!");
      return;
    }
    processUploadedFile(selectedFile);
    setSelectedFile(null);
  };

  const addCloudSong = () => {
    if (!cloudSongUrl.trim()) {
      showToast("Please enter a valid URL!");
      return;
    }
    const newSong = {
      id: Date.now(),
      name: cloudSongName.trim() || "Cloud Track",
      artist: cloudSongArtist.trim() || "Online Stream",
      audio: cloudSongUrl.trim(),
      artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500",
      mood: "hype",
    };
    setUploadedSongs((prev) => [...prev, newSong]);
    setQueueSongs((prev) => [...prev, newSong]);
    setCloudSongName("");
    setCloudSongArtist("");
    setCloudSongUrl("");
    showToast("Cloud song added!");
    setActiveTab("Feed");
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      showToast("Enter a playlist name!");
      return;
    }
    if (playlists[newPlaylistName]) {
      showToast("Playlist already exists!");
      return;
    }
    setPlaylists({ ...playlists, [newPlaylistName]: [] });
    setNewPlaylistName("");
    showToast("Playlist created!");
  };

  const addSongToPlaylist = (playlistName, song) => {
    const currentList = playlists[playlistName] || [];
    if (currentList.some((s) => s.name === song.name && s.artist === song.artist)) {
      showToast("Song is already in this playlist!");
      return;
    }
    setPlaylists({
      ...playlists,
      [playlistName]: [...currentList, song],
    });
    showToast(`Added to ${playlistName}!`);
    setActivePlaylistMenuSong(null);
  };

  const handleOpenTagEditor = (song, index) => {
    setEditingSong(song);
    setEditingIndex(index);
    setEditTitle(song.name || "");
    setEditArtist(song.artist || "");
    setEditCoverUrl(song.coverUrl || song.artwork || "");
    setIsTagEditorOpen(true);
  };

  const handleCoverFileUpload = (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      showToast("❌ Please select a valid PNG or JPEG image file.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      if (typeof loadEvent.target.result !== "string") {
        showToast("❌ Failed to load cover image.");
        return;
      }
      setEditCoverUrl(loadEvent.target.result);
      showToast("🖼️ Cover image loaded successfully!");
    };
    reader.onerror = () => showToast("❌ Failed to read cover image.");
    reader.readAsDataURL(file);
    input.value = "";
  };

  const saveSongMetadata = () => {
    if (editingIndex === null || editingIndex === undefined || !editingSong) return;

    const songAtIndex = allSongs[editingIndex];
    if (!songAtIndex || songAtIndex.id !== editingSong.id) {
      showToast("Could not find the song to update. Please reopen the editor.");
      return;
    }

    const metadata = {
      name: editTitle,
      artist: editArtist,
      coverUrl: editCoverUrl.trim(),
      artwork: editCoverUrl.trim(),
    };
    const updatedSong = { ...songAtIndex, ...metadata };
    const updateMatchingSong = (song) => song.id === songAtIndex.id ? { ...song, ...metadata } : song;

    if (uploadedSongs.some((song) => song.id === songAtIndex.id)) {
      setUploadedSongs((songs) => songs.map(updateMatchingSong));
    } else {
      setSongMetadataOverrides((overrides) => ({
        ...overrides,
        [songAtIndex.id]: metadata,
      }));
    }

    setQueueSongs((songs) => songs.map(updateMatchingSong));
    setRecentSongs((songs) => songs.map(updateMatchingSong));
    setPlaylists((currentPlaylists) =>
      Object.fromEntries(
        Object.entries(currentPlaylists).map(([name, songs]) => [name, songs.map(updateMatchingSong)])
      )
    );
    setCurrentSong((song) => song?.id === songAtIndex.id ? updatedSong : song);
    setIsTagEditorOpen(false);
    setEditingSong(null);
    setEditingIndex(null);
    showToast("✨ Song metadata and cover photo updated successfully!");
  };

  const exportLibraryBackup = () => {
    const backupData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      songs: allSongs,
      playlists,
      likedSongs,
      uploadedSongs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pulse_music_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("💾 Library backup downloaded successfully!");
  };

  const importLibraryBackup = (event) => {
    const file = event.currentTarget.files?.[0];
    const input = event.currentTarget;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const backup = JSON.parse(loadEvent.target.result);
        const isSong = (song) =>
          song &&
          typeof song === "object" &&
          typeof song.name === "string" &&
          typeof song.artist === "string" &&
          typeof song.audio === "string";

        if (!backup || typeof backup !== "object" || Array.isArray(backup)) {
          throw new Error("Backup must contain a JSON object.");
        }
        if (!["uploadedSongs", "playlists", "likedSongs"].some((key) => key in backup)) {
          throw new Error("Backup does not contain supported library data.");
        }
        if (backup.uploadedSongs !== undefined &&
          (!Array.isArray(backup.uploadedSongs) || !backup.uploadedSongs.every(isSong))) {
          throw new Error("Backup contains invalid uploaded songs.");
        }
        if (backup.likedSongs !== undefined &&
          (!Array.isArray(backup.likedSongs) || !backup.likedSongs.every((song) => typeof song === "string"))) {
          throw new Error("Backup contains invalid liked songs.");
        }
        if (backup.playlists !== undefined &&
          (!backup.playlists ||
            typeof backup.playlists !== "object" ||
            Array.isArray(backup.playlists) ||
            !Object.values(backup.playlists).every((songs) => Array.isArray(songs) && songs.every(isSong)))) {
          throw new Error("Backup contains invalid playlists.");
        }

        if (backup.uploadedSongs !== undefined) {
          setUploadedSongs(backup.uploadedSongs);
          setQueueSongs([...defaultSongs, ...backup.uploadedSongs]);
        }
        if (backup.playlists !== undefined) setPlaylists(backup.playlists);
        if (backup.likedSongs !== undefined) setLikedSongs(backup.likedSongs);
        showToast("💾 Library restored successfully from backup!");
      } catch (error) {
        console.error("Failed to restore library backup:", error);
        showToast(`❌ ${error instanceof SyntaxError ? "Invalid JSON backup file." : error.message}`);
      } finally {
        input.value = "";
      }
    };
    reader.onerror = () => {
      showToast("❌ Failed to read backup file.");
      input.value = "";
    };
    reader.readAsText(file);
  };

  const shareLikedSongs = () => {
    if (likedSongs.length === 0) {
      showToast("No liked songs to share!");
      return;
    }
    const text = `🎵 Check out my favorite songs on Pulse Music:\n${likedSongs.join("\n")}`;
    navigator.clipboard.writeText(text);
    showToast("Liked songs copied to clipboard! 📋");
  };

  const openLyricsModal = (song, e) => {
    e.stopPropagation();
    setActiveLyricsSong(song);
    setLyricsEditText(songLyrics[song.name] || "");
  };

  const saveLyrics = () => {
    if (!activeLyricsSong) return;
    setSongLyrics({
      ...songLyrics,
      [activeLyricsSong.name]: lyricsEditText,
    });
    showToast("Lyrics saved!");
    setActiveLyricsSong(null);
  };

  const getBackgroundStyle = () => {
    if (bgMode === "aurora") return "linear-gradient(135deg, #1e1b4b, #311042, #0f172a)";
    if (bgMode === "studio") return "linear-gradient(135deg, #1a1e29, #111827)";
    return `linear-gradient(135deg, #0f1115, #141720)`;
  };

  const currentSyncedLyrics = parseLrcLyrics(currentSong ? songLyrics[currentSong.name] : "");
  const activeLyricIdx = getActiveLyricIndex(currentSyncedLyrics);
  const globalSearchResults = allSongs.filter((song) =>
    song.name.toLowerCase().includes(globalSearchQuery.trim().toLowerCase()) ||
    song.artist.toLowerCase().includes(globalSearchQuery.trim().toLowerCase())
  );

  return (
    <div
      style={{
        background: getBackgroundStyle(),
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        paddingBottom: "240px",
        fontFamily: "Arial, sans-serif",
        transition: "background 0.8s ease",
      }}
    >
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: themeColor,
            color: "black",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            zIndex: 3000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {notification}
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h1 style={{ color: themeColor, margin: 0 }}>Pulse Music App</h1>
          <button
            onClick={() => setIsHotkeysModalOpen(true)}
            style={{
              background: "#1a1d24",
              color: "#aaa",
              border: "1px solid #444",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              fontSize: "12px",
              cursor: "pointer",
            }}
            title="Keyboard Shortcuts (?)"
          >
            ?
          </button>
          <button
            onClick={toggleVoiceControl}
            style={{
              background: isListeningVoice ? "#ef4444" : "#1a1d24",
              color: isListeningVoice ? "white" : themeColor,
              border: `1px solid ${themeColor}`,
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {isListeningVoice ? "🎙️ Listening..." : "🎙️ Voice Control"}
          </button>
          <button
            onClick={() => setIsAmbientOpen(true)}
            style={{
              background: "#1a1d24",
              color: "#38bdf8",
              border: "1px solid #38bdf8",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🌧️ Ambient Mixer
          </button>
          {/* 🔥 Streak Counter Pill */}
          <div style={{ background: "rgba(249,115,22,0.2)", border: "1px solid #f97316", color: "#fdba74", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
            🔥 {streakData.streak} Day Streak
          </div>
        </div>
      </div>

      <p style={{ color: "#aaa", marginTop: 0 }}>Explore, stream, and enjoy your AI-powered music dashboard. 🎶</p>

      {/* Global Quick-Search Bar */}
      <div style={{ margin: "15px 0", display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="🔍 Search songs, artists, or playlists across Pulse..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "#141720",
              border: `1px solid ${globalSearchQuery ? themeColor : "#2a2f3d"}`,
              color: "white",
              padding: "12px 16px 12px 40px",
              borderRadius: "10px",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <span style={{ position: "absolute", left: "14px", top: "13px", fontSize: "14px", color: "#888" }}>🔍</span>
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "10px",
                background: "#222",
                color: "#aaa",
                border: "none",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                cursor: "pointer",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Live Search Results Overlay */}
      {globalSearchQuery.trim() !== "" && (
        <div style={{ background: "#141720", border: `1px solid ${themeColor}`, borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: themeColor, fontWeight: "bold", marginBottom: "10px" }}>
            🔍 Search Results for "{globalSearchQuery}"
          </div>
          <div style={{ display: "grid", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
            {globalSearchResults.length > 0 ? (
              globalSearchResults.map((song) => (
                <div
                  key={song.id}
                  onClick={() => {
                    playSong(song);
                    setGlobalSearchQuery("");
                  }}
                  style={{
                    background: "#101218",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    border: "1px solid #222"
                  }}
                >
                  <div>
                    <div style={{ color: "white", fontWeight: "bold", fontSize: "13px" }}>{song.name}</div>
                    <div style={{ color: "#aaa", fontSize: "11px" }}>{song.artist}</div>
                  </div>
                  <span style={{ color: themeColor, fontSize: "12px", fontWeight: "bold" }}>Play ▶</span>
                </div>
              ))
            ) : (
              <div style={{ color: "#777", fontSize: "12px", textAlign: "center", padding: "15px" }}>
                No matching tracks or artists found in your library.
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0", borderBottom: "1px solid #222", paddingBottom: "10px", overflowX: "auto" }}>
        {["Feed", "Discover Weekly", "Live Lyrics", "Playlists", "Top Artists", "Upload", "Recent", "Stats", "Settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? themeColor : "transparent",
              color: activeTab === tab ? "black" : "#aaa",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: FEED */}
      {activeTab === "Feed" && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#aaa", fontWeight: "bold" }}>Mood Filter:</span>
            {[
              { id: "all", label: "🌟 All Vibes" },
              { id: "chill", label: "☕ Chill & Lofi" },
              { id: "hype", label: "⚡ Hype & Upbeat" },
              { id: "focus", label: "🎯 Focus & Study" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMoodFilterTag(m.id)}
                style={{
                  background: moodFilterTag === m.id ? themeColor : "#161922",
                  color: moodFilterTag === m.id ? "black" : "#ccc",
                  border: "1px solid #333",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search songs or artists..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                flex: 1,
                minWidth: "200px",
                background: "#161922",
                border: "1px solid #333",
                color: "white",
                padding: "10px 14px",
                borderRadius: "8px",
                outline: "none",
              }}
            />
            <button
              onClick={() => setFeedFilter(feedFilter === "all" ? "liked" : "all")}
              style={{
                background: feedFilter === "liked" ? themeColor : "#161922",
                color: feedFilter === "liked" ? "black" : "white",
                border: "1px solid #333",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {feedFilter === "liked" ? "❤️ Liked Only" : "🤍 All Songs"}
            </button>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {filteredSongs.length === 0 ? (
              <p style={{ color: "#777", textAlign: "center", padding: "40px" }}>No songs found.</p>
            ) : (
              filteredSongs.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                const isLiked = likedSongs.includes(song.name);
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, index)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isCurrent ? "#1c2230" : "#141720",
                      border: isCurrent ? `1px solid ${themeColor}` : "1px solid #222",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      {song.coverUrl || song.artwork ? (
                        <img
                          src={song.coverUrl || song.artwork}
                          alt={song.name}
                          style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid #333" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div style={{
                        display: song.coverUrl || song.artwork ? "none" : "flex",
                        width: "42px",
                        height: "42px",
                        borderRadius: "8px",
                        background: `linear-gradient(135deg, ${themeColor}33, #222)`,
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        flexShrink: 0,
                        border: `1px solid ${themeColor}55`
                      }}>
                        🎵
                      </div>
                      <div>
                        <div style={{ fontWeight: "bold", color: isCurrent ? themeColor : "white" }}>
                          {song.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#888" }}>{song.artist}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTagEditor(song, allSongs.findIndex((librarySong) => librarySong.id === song.id));
                        }}
                        style={{ background: "#222", color: "#aaa", border: "none", padding: "6px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                        title="Edit Song Info & Photo"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song.name);
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}
                      >
                        {isLiked ? "❤️" : "🤍"}
                      </button>

                      <button
                        onClick={(e) => openLyricsModal(song, e)}
                        style={{ background: "#222", color: "#ccc", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                      >
                        📝 Lyrics
                      </button>

                      <div style={{ position: "relative", display: "inline-block" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePlaylistMenuSong(activePlaylistMenuSong === song.id ? null : song.id);
                          }}
                          style={{
                            background: "#161922",
                            color: themeColor,
                            border: `1px solid ${themeColor}55`,
                            padding: "6px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: "bold"
                          }}
                        >
                          📂 + Playlist
                        </button>

                        {activePlaylistMenuSong === song.id && (
                          <div style={{
                            position: "absolute",
                            right: 0,
                            top: "100%",
                            marginTop: "6px",
                            background: "#161922",
                            border: `1px solid ${themeColor}`,
                            borderRadius: "8px",
                            padding: "8px",
                            width: "160px",
                            zIndex: 100,
                            boxShadow: "0px 8px 20px rgba(0,0,0,0.5)"
                          }}>
                            <div style={{ fontSize: "10px", color: "#888", marginBottom: "6px", fontWeight: "bold", paddingLeft: "4px" }}>Add to Playlist:</div>
                            {Object.keys(playlists).length > 0 ? (
                              Object.keys(playlists).map((playlistName) => (
                                <div
                                  key={playlistName}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addSongToPlaylist(playlistName, song);
                                  }}
                                  style={{
                                    padding: "6px 8px",
                                    fontSize: "11px",
                                    color: "white",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = "#222736"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                >
                                  📁 {playlistName}
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: "11px", color: "#666", padding: "6px" }}>No playlists yet. Create one in the Playlists tab!</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: LIVE LYRICS & KARAOKE */}
      {activeTab === "Live Lyrics" && (
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg, #1e1b4b, #111)", border: `1px solid ${themeColor}`, padding: "24px", borderRadius: "16px", marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 6px 0", color: themeColor }}>🎤 Live Synced Karaoke & Lyrics</h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>
              {currentSong ? `Now Playing: ${currentSong.name} — ${currentSong.artist}` : "Play a track to experience live synced lyrics"}
            </p>
          </div>

          {currentSong && (
            <div style={{ background: "#161922", border: `1px solid ${themeColor}`, padding: "16px", borderRadius: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", color: "white", fontWeight: "bold" }}>✨ Spotify-Style AI Lyrics & Translation</div>
                <div style={{ fontSize: "11px", color: "#aaa" }}>Auto-generate behind-the-lyrics stories and instant translations</div>
              </div>
              <button
                onClick={generateAiLyricInsights}
                disabled={isGeneratingAiLyrics}
                style={{ background: themeColor, color: "black", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
              >
                {isGeneratingAiLyrics ? "✨ Generating..." : "Generate AI Insights"}
              </button>
            </div>
          )}

          {aiLyricInsights?.storyline && (
            <div style={{ background: "rgba(168, 85, 247, 0.1)", border: "1px solid #a855f7", padding: "14px", borderRadius: "10px", marginBottom: "16px", fontSize: "12px", textAlign: "left", color: "#e2e8f0" }}>
              <div style={{ fontWeight: "bold", color: "#a855f7", marginBottom: "4px" }}>💬 Behind the Lyrics (AI Curated)</div>
              {aiLyricInsights.storyline}
            </div>
          )}

          {currentSong ? (
            <div style={{ background: "#141720", border: "1px solid #222", borderRadius: "16px", padding: "30px", minHeight: "320px", maxHeight: "460px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center" }}>
              {currentSyncedLyrics.length > 0 ? (
                currentSyncedLyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIdx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleLyricSeek(line.time)}
                      style={{
                        fontSize: isActive ? "20px" : "15px",
                        fontWeight: isActive ? "bold" : "normal",
                        color: isActive ? themeColor : "#555",
                        cursor: line.time >= 0 ? "pointer" : "default",
                        transition: "all 0.3s ease",
                        padding: "6px 0",
                        transform: isActive ? "scale(1.05)" : "scale(1)"
                      }}
                    >
                      {line.text || "♪ ♫ ♪"}
                    </div>
                  );
                })
              ) : (
                <div style={{ color: "#777", padding: "30px" }}>
                  <p>No synced LRC lyrics found for this track yet.</p>
                  <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
                    Tip: Go to the <b>Feed</b> tab, click <b>📝 Lyrics</b> on any song, and use <b>✨ AI Auto-Fill</b> to generate synced lines instantly!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "#141720", padding: "50px", borderRadius: "12px", color: "#777" }}>
              Select and play a song from your feed to view the live karaoke stage! 🎶
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DISCOVER WEEKLY */}
      {activeTab === "Discover Weekly" && (
        <div style={{ maxWidth: "600px" }}>
          <div style={{ background: "linear-gradient(135deg, #3b82f6, #1e1b4b)", padding: "24px", borderRadius: "12px", marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 8px 0" }}>🌟 Discover Weekly</h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1" }}>Curated tracks tailored to your listening habits.</p>
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {discoverWeeklySongs.map((song) => (
              <div key={song.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#141720", padding: "12px 16px", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontWeight: "bold" }}>{song.name}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>{song.artist}</div>
                </div>
                <button
                  onClick={() => playSong(song)}
                  style={{ background: themeColor, color: "black", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Play
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TOP ARTISTS */}
      {activeTab === "Top Artists" && (
        <div style={{ maxWidth: "600px" }}>
          <h2 style={{ color: themeColor }}>👨‍🎤 Top Artists Dashboard</h2>
          <p style={{ fontSize: "13px", color: "#aaa" }}>Your most-streamed artists based on playback history.</p>
          <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
            {topArtists.map(([artist, score], idx) => (
              <div key={artist} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#141720", padding: "16px", borderRadius: "10px", border: "1px solid #222" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: themeColor }}>#{idx + 1}</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>{artist}</div>
                </div>
                <div style={{ fontSize: "13px", color: "#888" }}>{score} Play Score</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PLAYLISTS (Includes AI Prompt Generator) */}
      {activeTab === "Playlists" && (
        <div>
          <div style={{ background: "#141720", border: `1px solid ${themeColor}`, padding: "18px", borderRadius: "10px", marginBottom: "25px" }}>
            <h3 style={{ margin: "0 0 8px 0", color: themeColor }}>✨ AI Prompt Playlist Generator</h3>
            <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 12px 0" }}>Describe your vibe (e.g. "chill night", "upbeat party")</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Type your vibe..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                style={{ flex: 1, background: "#101218", border: "1px solid #333", color: "white", padding: "8px 12px", borderRadius: "6px", outline: "none" }}
              />
              <button
                onClick={handleAiPromptGenerate}
                style={{ background: themeColor, color: "black", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                Generate Mix
              </button>
            </div>
            {aiGeneratedList.length > 0 && (
              <div style={{ marginTop: "14px", display: "grid", gap: "6px" }}>
                {aiGeneratedList.map((song, idx) => (
                  <div key={song.id} style={{ display: "flex", justifyContent: "space-between", background: "#101218", padding: "6px 10px", borderRadius: "6px" }}>
                    <span>{idx + 1}. {song.name} - {song.artist}</span>
                    <button onClick={() => playSong(song)} style={{ background: themeColor, color: "black", border: "none", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>Play</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="New playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              style={{ flex: 1, background: "#161922", border: "1px solid #333", color: "white", padding: "10px 14px", borderRadius: "8px", outline: "none" }}
            />
            <button onClick={createPlaylist} style={{ background: themeColor, color: "black", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Create</button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: UPLOAD (With Drag & Drop Zone) */}
      {activeTab === "Upload" && (
        <div style={{ display: "grid", gap: "20px", maxWidth: "600px" }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processUploadedFile(e.dataTransfer.files[0]);
              }
            }}
            style={{
              background: isDraggingOver ? "#1e293b" : "#141720",
              border: `2px dashed ${isDraggingOver ? themeColor : "#333"}`,
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center"
            }}
          >
            <h3 style={{ marginTop: 0 }}>📁 Drag & Drop MP3 Audio Here</h3>
            <p style={{ fontSize: "13px", color: "#aaa" }}>or browse from your computer</p>
            <input
              type="file"
              accept="audio/mp3,audio/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ color: "#aaa", margin: "10px auto", display: "block" }}
            />
            <button
              onClick={handleDeviceUpload}
              style={{ background: themeColor, color: "black", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
            >
              Upload Track
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: RECENT */}
      {activeTab === "Recent" && (
        <div>
          <h3>Recently Played</h3>
          {recentSongs.length === 0 ? (
            <p style={{ color: "#777" }}>No recent songs played yet.</p>
          ) : (
            recentSongs.map((song, idx) => (
              <div key={song.id} style={{ display: "flex", justifyContent: "space-between", background: "#141720", padding: "10px 14px", borderRadius: "8px", marginBottom: "8px" }}>
                <span>{idx + 1}. {song.name} - <span style={{ color: "#888" }}>{song.artist}</span></span>
                <button onClick={() => playSong(song)} style={{ background: themeColor, color: "black", border: "none", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Play</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: STATS */}
      {activeTab === "Stats" && (
        <div style={{ display: "grid", gap: "20px", maxWidth: "600px" }}>
          <div style={{ background: "#141720", border: "1px solid #222", padding: "24px", borderRadius: "10px" }}>
            <h3 style={{ marginTop: 0, color: themeColor }}>Your Listening Statistics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "20px" }}>
              <div style={{ background: "#101218", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: themeColor }}>{Math.floor(totalListeningSeconds / 60)} min</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Total Listening Time</div>
              </div>
              <div style={{ background: "#101218", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: themeColor }}>{streakData.streak} Days</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Listening Streak 🔥</div>
              </div>
            </div>

            {/* Listening Calendar */}
            <div style={{ marginTop: "25px", background: "#101218", padding: "16px", borderRadius: "8px" }}>
              <div style={{ fontSize: "13px", color: "#aaa", fontWeight: "bold", marginBottom: "12px" }}>📅 Listening Calendar (Last 7 Days)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center" }}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dIdx) => (
                  <div key={day}>
                    <div style={{ fontSize: "10px", color: "#777", marginBottom: "4px" }}>{day}</div>
                    <div style={{ height: "36px", borderRadius: "4px", background: dIdx < 5 ? `${themeColor}aa` : themeColor }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Listening Badges & Trophies */}
            <div style={{ marginTop: "20px", background: "#101218", padding: "16px", borderRadius: "8px", border: "1px solid #222" }}>
              <div style={{ fontSize: "14px", color: themeColor, fontWeight: "bold", marginBottom: "12px" }}>🏆 Milestones & Trophies</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {unlockedBadges.map((badge) => (
                  <div key={badge.id} style={{ background: badge.unlocked ? "rgba(34,197,94,0.1)" : "#161922", border: `1px solid ${badge.unlocked ? themeColor : "#333"}`, padding: "12px", borderRadius: "8px", opacity: badge.unlocked ? 1 : 0.5 }}>
                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>{badge.icon}</div>
                    <div style={{ fontWeight: "bold", fontSize: "13px", color: badge.unlocked ? "white" : "#888" }}>{badge.title}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{badge.desc}</div>
                    <div style={{ fontSize: "10px", fontWeight: "bold", marginTop: "6px", color: badge.unlocked ? themeColor : "#555" }}>{badge.unlocked ? "UNLOCKED ✓" : "LOCKED 🔒"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS */}
      {activeTab === "Settings" && (
        <div style={{ display: "grid", gap: "20px", maxWidth: "600px" }}>
          <div style={{ background: "#141720", border: "1px solid #222", padding: "20px", borderRadius: "10px" }}>
            <h3 style={{ marginTop: 0, color: themeColor }}>🤖 AI DJ Control</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#aaa" }}>AI DJ Voice Announcer:</span>
                <button
                  onClick={() => {
                    setIsAiDjEnabled(!isAiDjEnabled);
                    showToast(isAiDjEnabled ? "AI DJ Disabled" : "AI DJ Enabled 🎙️");
                  }}
                  style={{ background: isAiDjEnabled ? themeColor : "#333", color: isAiDjEnabled ? "black" : "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                >
                  {isAiDjEnabled ? "DJ ON" : "DJ OFF"}
                </button>
              </div>

            </div>
          </div>

          <div style={{ background: "#141720", border: "1px solid #222", padding: "20px", borderRadius: "10px" }}>
            <h3 style={{ marginTop: 0, color: themeColor }}>Appearance & Theme</h3>
            <select value={bgMode} onChange={(e) => setBgMode(e.target.value)} style={{ background: "#1b1f2b", color: "white", border: "1px solid #555", borderRadius: "6px", padding: "8px", width: "100%" }}>
              <option value="dark">🌑 Dynamic Dark</option>
              <option value="studio">🌒 Studio Slate</option>
              <option value="aurora">🌌 Aurora Mesh</option>
            </select>
          </div>

          <div style={{ background: "#141720", border: "1px solid #222", padding: "20px", borderRadius: "10px", marginTop: "15px" }}>
            <h3 style={{ marginTop: 0, color: themeColor }}>🎚️ Playback & Crossfade</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", color: "white", fontWeight: "bold" }}>Seamless Crossfade</div>
                <div style={{ fontSize: "11px", color: "#888" }}>Smoothly fade out tracks near the end</div>
              </div>
              <button
                onClick={() => {
                  setIsCrossfade(!isCrossfade);
                  showToast(isCrossfade ? "Crossfade Disabled" : "Crossfade Enabled 🎚️");
                }}
                style={{ background: isCrossfade ? themeColor : "#333", color: isCrossfade ? "black" : "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                {isCrossfade ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          <div style={{ background: "#141720", border: "1px solid #222", padding: "20px", borderRadius: "10px", marginTop: "15px" }}>
            <h3 style={{ marginTop: 0, color: themeColor }}>📻 Infinite Radio & Auto-Play</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", color: "white", fontWeight: "bold" }}>Infinite Auto-Play Mode</div>
                <div style={{ fontSize: "11px", color: "#888" }}>Keep music playing automatically when queue ends</div>
              </div>
              <button
                onClick={() => {
                  setIsInfiniteRadio(!isInfiniteRadio);
                  showToast(isInfiniteRadio ? "Infinite Radio Disabled" : "Infinite Radio Enabled 📻");
                }}
                style={{ background: isInfiniteRadio ? themeColor : "#333", color: isInfiniteRadio ? "black" : "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                {isInfiniteRadio ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          <div style={{ background: "#141720", border: "1px solid #222", padding: "20px", borderRadius: "10px", marginTop: "15px" }}>
            <h3 style={{ marginTop: 0, color: themeColor }}>💾 Library Backup & Restore</h3>
            <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "15px" }}>
              Secure your custom playlists, liked songs, and uploads by exporting them to a local JSON file, or restore them anytime.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={exportLibraryBackup}
                style={{
                  background: themeColor,
                  color: "black",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                📥 Export JSON Backup
              </button>

              <label style={{
                background: "#161922",
                color: "white",
                border: `1px solid ${themeColor}`,
                padding: "9px 16px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "12px",
                display: "inline-block"
              }}>
                📂 Restore from JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={importLibraryBackup}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <div style={{ background: "#141720", border: "1px solid #222", padding: "20px", borderRadius: "10px", marginTop: "15px" }}>
            <h3 style={{ marginTop: 0, color: themeColor }}>🎨 Frontend Accent Color Customizer</h3>
            <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "12px" }}>Choose or pick a custom accent color for your entire dashboard:</p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                style={{ width: "40px", height: "40px", border: "none", cursor: "pointer", background: "none" }}
              />
              {["#22c55e", "#a855f7", "#3b82f6", "#f97316", "#ec4899", "#38bdf8"].map((color) => (
                <button
                  key={color}
                  onClick={() => setThemeColor(color)}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", background: color, border: themeColor === color ? "2px solid white" : "none", cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN PLAYER (With AI Details Fetcher & Vinyl Visualizer) */}
      {isFullPlayerOpen && currentSong && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "linear-gradient(180deg, #322338 0%, #121212 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 6000, padding: "24px", boxSizing: "border-box", overflowY: "auto" }}>
          <style>{`
            @keyframes spinVinyl {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at center, ${themeColor}22 0%, #0a0c10 75%)`,
            transform: `scale(${beatIntensity})`,
            transition: "transform 0.08s ease-out",
            pointerEvents: "none",
            zIndex: 0
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "420px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <button onClick={() => setIsFullPlayerOpen(false)} style={{ background: "none", border: "none", color: "white", fontSize: "24px", cursor: "pointer" }}>⌄</button>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: "10px", color: "#aaa" }}>NOW PLAYING</div></div>
            <div style={{ width: "24px" }}></div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "420px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            {/* Visualizer Mode Toggle */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {["vinyl", "bars", "ring"].map((mode) => (
                <button key={mode} onClick={() => setVisualizerMode(mode)} style={{ background: visualizerMode === mode ? themeColor : "#222", color: visualizerMode === mode ? "black" : "#aaa", border: "none", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>{mode.toUpperCase()}</button>
              ))}
            </div>

            {/* Spinning Vinyl Disk (Perfectly Centered) */}
            <div style={{
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              background: "#101218",
              border: `4px solid ${themeColor}`,
              boxShadow: `0 15px 35px rgba(0,0,0,0.7), 0 0 ${20 * beatIntensity}px ${themeColor}`,
              overflow: "hidden",
              position: "relative",
              margin: "20px auto",
              animation: isPlaying ? "spinVinyl 6s linear infinite" : "none",
              transform: `scale(${beatIntensity})`,
              transition: "box-shadow 0.1s ease",
              flexShrink: 0
            }}>
              <img
                src={currentSong?.coverUrl || currentSong?.artwork || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80"}
                alt={currentSong?.name || "Song Cover"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0
                }}
                onError={(e) => { e.target.style.display = "none"; }}
              />

              {/* Classic Vinyl Center Hole (Perfectly Centered) */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#161922",
                border: `3px solid ${themeColor}`,
                boxShadow: "inset 0 3px 6px rgba(0,0,0,0.8)",
                zIndex: 2
              }} />
            </div>

            {/* AI Song & Movie Details Button & Info */}
            <div style={{ width: "100%", marginBottom: "15px", textAlign: "center" }}>
              {!songDetailsInfo ? (
                <button
                  onClick={() => fetchAiSongDetails(currentSong)}
                  disabled={isFetchingAiDetails}
                  style={{ background: "rgba(255,255,255,0.1)", color: themeColor, border: `1px solid ${themeColor}`, padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                >
                  {isFetchingAiDetails ? "🤖 AI Fetching Details..." : "🤖 AI Find Song & Movie Details"}
                </button>
              ) : (
                <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #333", padding: "10px", borderRadius: "8px", fontSize: "12px", textAlign: "left" }}>
                  <div style={{ color: themeColor, fontWeight: "bold", marginBottom: "4px" }}>✨ AI Metadata Verified:</div>
                  <div>🎬 Movie/Album: <b>{songDetailsInfo.albumOrMovie}</b></div>
                  <div>🎼 Music Director: <b>{songDetailsInfo.composerOrDirector}</b></div>
                  <div>🎵 Genre: {songDetailsInfo.genre} ({songDetailsInfo.releaseYear})</div>
                </div>
              )}
            </div>

            {/* Artist Quick-Bio & Trivia Widget */}
            <div style={{ width: "100%", marginBottom: "15px", textAlign: "center" }}>
              {!artistTrivia ? (
                <button
                  onClick={() => fetchArtistTrivia(currentSong.artist)}
                  disabled={isFetchingTrivia}
                  style={{ background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid #38bdf8", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                >
                  {isFetchingTrivia ? "🧑‍🎤 Loading Bio..." : "🧑‍🎤 View Artist Bio & Trivia"}
                </button>
              ) : (
                <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid #38bdf8", padding: "12px", borderRadius: "8px", fontSize: "12px", textAlign: "left" }}>
                  <div style={{ color: "#38bdf8", fontWeight: "bold", marginBottom: "4px" }}>🧑‍🎤 Artist Spotlight: {artistTrivia.name}</div>
                  <div>🏷️ Genre/Type: <b>{artistTrivia.genre}</b> ({artistTrivia.type})</div>
                  <div style={{ color: "#ccc", marginTop: "4px", fontSize: "11px", fontStyle: "italic" }}>"{artistTrivia.bio}"</div>
                  <button
                    onClick={() => setArtistTrivia(null)}
                    style={{ background: "none", border: "none", color: "#888", fontSize: "10px", cursor: "pointer", marginTop: "6px", padding: 0, textDecoration: "underline" }}
                  >
                    Hide Bio
                  </button>
                </div>
              )}
            </div>

            {/* DJ Speed & Pitch FX Controller */}
            <div style={{ width: "100%", maxWidth: "480px", background: "rgba(0,0,0,0.45)", border: `1px solid ${themeColor}33`, borderRadius: "12px", padding: "12px", margin: "10px 0", textAlign: "center", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "11px", color: themeColor, fontWeight: "bold", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>🎛️ DJ Speed & FX ({playbackRate}x)</div>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    style={{
                      background: playbackRate === rate ? themeColor : "#161922",
                      color: playbackRate === rate ? "black" : "#aaa",
                      border: `1px solid ${playbackRate === rate ? themeColor : "#333"}`,
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Live Synced Karaoke & Lyrics */}
            <div style={{ width: "100%", maxWidth: "480px", background: "rgba(0,0,0,0.45)", border: `1px solid ${themeColor}33`, borderRadius: "12px", padding: "14px", margin: "10px 0", maxHeight: "160px", overflowY: "auto", textAlign: "center", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "11px", color: themeColor, fontWeight: "bold", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>🎤 Live Lyrics</div>
              {currentSyncedLyrics.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {currentSyncedLyrics.map((line, idx) => {
                    const isActive = idx === activeLyricIdx;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleLyricSeek(line.time)}
                        style={{
                          fontSize: isActive ? "15px" : "12px",
                          fontWeight: isActive ? "bold" : "normal",
                          color: isActive ? themeColor : "#777",
                          cursor: line.time >= 0 ? "pointer" : "default",
                          transition: "all 0.3s ease",
                          transform: isActive ? "scale(1.03)" : "scale(1)"
                        }}
                      >
                        {line.text || "♪ ♫ ♪"}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: "#666", fontSize: "11px", padding: "8px" }}>
                  No synced lyrics for this track yet. Add them from the Feed view!
                </div>
              )}
            </div>

            <h2 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>{currentSong.name}</h2>
            <p style={{ margin: "0 0 15px 0", fontSize: "13px", color: "#aaa" }}>{currentSong.artist}</p>

            <div style={{ width: "100%", marginBottom: "15px" }}>
              <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} style={{ width: "100%", accentColor: themeColor }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "20px" }}>
              <button onClick={playPrev} style={{ background: "none", border: "none", color: "white", fontSize: "22px" }}>⏮</button>
              <button onClick={togglePlayPause} style={{ background: "white", color: "black", border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "18px", fontWeight: "bold" }}>{isPlaying ? "❚❚" : "▶"}</button>
              <button onClick={playNext} style={{ background: "none", border: "none", color: "white", fontSize: "22px" }}>⏭</button>
            </div>
          </div>
          <div></div>
        </div>
      )}

      {/* QUEUE DRAWER WITH REORDERING */}
      {isQueueOpen && (
        <div style={{ position: "fixed", top: 0, right: 0, width: "340px", height: "100vh", background: "#141720", borderLeft: "1px solid #222", zIndex: 4500, padding: "20px", display: "flex", flexDirection: "column", boxShadow: "-5px 0 25px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: 0, color: themeColor }}>Playback Queue & Reorder</h3>
            <button onClick={() => setIsQueueOpen(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "16px" }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: "8px" }}>
            {queueSongs.map((s, idx) => (
              <div key={s.id + idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", background: currentSong?.id === s.id ? "#1c2230" : "#101218", borderRadius: "6px" }}>
                <span onClick={() => playSong(s, idx)} style={{ fontSize: "12px", cursor: "pointer", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{idx + 1}. {s.name}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button onClick={() => moveQueueItem(idx, "up")} style={{ background: "#222", color: "#fff", border: "none", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}>▲</button>
                  <button onClick={() => moveQueueItem(idx, "down")} style={{ background: "#222", color: "#fff", border: "none", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}>▼</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {isHotkeysModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000 }}>
          <div style={{ background: "#161922", border: `1px solid ${themeColor}`, padding: "24px", borderRadius: "12px", width: "380px", maxWidth: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: themeColor }}>⌨️ Keyboard Shortcuts</h3>
              <button onClick={() => setIsHotkeysModalOpen(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            <div style={{ display: "grid", gap: "10px", fontSize: "13px", color: "#ccc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", background: "#101218", padding: "10px", borderRadius: "6px" }}>
                <span>Play / Pause</span>
                <b style={{ color: themeColor }}>Spacebar</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "#101218", padding: "10px", borderRadius: "6px" }}>
                <span>Fast Forward (+10s)</span>
                <b style={{ color: themeColor }}>Right Arrow (→)</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "#101218", padding: "10px", borderRadius: "6px" }}>
                <span>Rewind (-10s)</span>
                <b style={{ color: themeColor }}>Left Arrow (←)</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "#101218", padding: "10px", borderRadius: "6px" }}>
                <span>Next / Prev Track</span>
                <b style={{ color: themeColor }}>N / P Key</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "#101218", padding: "10px", borderRadius: "6px" }}>
                <span>Volume Up / Down</span>
                <b style={{ color: themeColor }}>Up / Down Arrow</b>
              </div>
            </div>
            <button
              onClick={() => setIsHotkeysModalOpen(false)}
              style={{ background: themeColor, color: "black", border: "none", padding: "10px", borderRadius: "6px", width: "100%", cursor: "pointer", fontWeight: "bold", marginTop: "20px" }}
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* SONG METADATA & PHOTO TAG EDITOR MODAL */}
      {isTagEditorOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 6000 }}>
          <div style={{ background: "#161922", border: `1px solid ${themeColor}`, padding: "24px", borderRadius: "14px", width: "380px", maxWidth: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: themeColor }}>✏️ Edit Song Info & Photo</h3>
              <button onClick={() => setIsTagEditorOpen(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            <div style={{ display: "grid", gap: "12px", fontSize: "13px" }}>
              <div>
                <label style={{ color: "#aaa", display: "block", marginBottom: "4px" }}>Song Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: "100%", background: "#101218", border: "1px solid #333", color: "white", padding: "8px 12px", borderRadius: "6px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ color: "#aaa", display: "block", marginBottom: "4px" }}>Artist Name</label>
                <input
                  type="text"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  style={{ width: "100%", background: "#101218", border: "1px solid #333", color: "white", padding: "8px 12px", borderRadius: "6px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ color: "#aaa", display: "block", marginBottom: "4px" }}>Cover Photo (Upload PNG/JPEG or Paste URL)</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    type="text"
                    placeholder="https://example.com/artwork.jpg"
                    value={editCoverUrl.startsWith("data:") ? "[Local Image File Loaded]" : editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    style={{ flex: 1, background: "#101218", border: "1px solid #333", color: "white", padding: "8px 12px", borderRadius: "6px", outline: "none", boxSizing: "border-box", fontSize: "12px" }}
                  />
                  <label style={{
                    background: "#161922",
                    color: themeColor,
                    border: `1px solid ${themeColor}`,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    📁 Upload File
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleCoverFileUpload}
                    style={{ display: "none" }}
                  />
                  </label>
                </div>
              </div>
              {editCoverUrl && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", background: "#101218", padding: "8px", borderRadius: "8px", border: "1px solid #222" }}>
                  <img
                    src={editCoverUrl}
                    alt="Artwork Preview"
                    style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover", border: `1px solid ${themeColor}` }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div>
                    <div style={{ fontSize: "12px", color: "white", fontWeight: "bold" }}>Artwork Preview</div>
                    <div style={{ fontSize: "10px", color: "#888" }}>Ready to save to song tags</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setIsTagEditorOpen(false)}
                style={{ flex: 1, background: "#222", color: "#aaa", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
              >
                Cancel
              </button>
              <button
                onClick={saveSongMetadata}
                style={{ flex: 1, background: themeColor, color: "black", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LYRICS MODAL WITH AI AUTO-FILL */}
      {activeLyricsSong && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000 }}>
          <div style={{ background: "#161922", border: "1px solid #333", padding: "24px", borderRadius: "12px", width: "400px", maxWidth: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0, color: themeColor }}>Lyrics for {activeLyricsSong.name}</h3>
              <button
                onClick={handleAiAutoLyrics}
                style={{ background: "rgba(34,197,94,0.2)", color: themeColor, border: `1px solid ${themeColor}`, padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
              >
                ✨ AI Auto-Fill
              </button>
            </div>
            <textarea
              rows={6}
              value={lyricsEditText}
              onChange={(e) => setLyricsEditText(e.target.value)}
              placeholder="Enter or paste lyrics here..."
              style={{ width: "100%", background: "#101218", color: "white", border: "1px solid #333", padding: "10px", borderRadius: "6px", outline: "none", resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setActiveLyricsSong(null)} style={{ background: "#333", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveLyrics} style={{ background: themeColor, color: "black", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Save Lyrics</button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED BOTTOM PLAYER BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#11141c", borderTop: "1px solid #222", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 2000 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: "#888" }}>{formatTime(currentTime)}</span>
          <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} style={{ flex: 1, accentColor: themeColor }} />
          <span style={{ fontSize: "11px", color: "#888" }}>{formatTime(duration)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={() => currentSong && setIsFullPlayerOpen(true)} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
            {currentSong ? (
              <>
                <img src={currentSong.artwork} alt="" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>{currentSong.name}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>{currentSong.artist}</div>
                </div>
              </>
            ) : <div style={{ color: "#666" }}>No song playing</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => {
                setIsRepeat(!isRepeat);
                showToast(isRepeat ? "Repeat Mode: OFF" : "Repeat Mode: ON 🔂");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: isRepeat ? themeColor : "#888",
                cursor: "pointer",
                fontSize: "16px",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease"
              }}
              title={isRepeat ? "Repeat Enabled" : "Repeat Disabled"}
              aria-label={isRepeat ? "Disable repeat" : "Enable repeat"}
            >
              🔂
            </button>
            <button onClick={playPrev} style={{ background: "none", border: "none", color: "white", fontSize: "18px", cursor: "pointer" }}>⏮</button>
            <button onClick={togglePlayPause} style={{ background: themeColor, color: "black", border: "none", borderRadius: "50%", width: "38px", height: "38px", fontWeight: "bold", cursor: "pointer" }}>{isPlaying ? "❚❚" : "▶"}</button>
            <button onClick={playNext} style={{ background: "none", border: "none", color: "white", fontSize: "18px", cursor: "pointer" }}>⏭</button>
          </div>
          <div>
            <button onClick={() => setIsQueueOpen(true)} style={{ background: "#222", color: "#aaa", border: "1px solid #444", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>📜 Queue</button>
          </div>
        </div>
      </div>
    </div>
  );
}