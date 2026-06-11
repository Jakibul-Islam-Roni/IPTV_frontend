document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const logo = document.querySelector('.logo');
    const homeNav = document.querySelector('[data-target="home"]');
    const homeView = document.getElementById('homeView');
    const watchView = document.getElementById('watchView');
    const videoGrid = document.getElementById('videoGrid');
    const playlistQueue = document.getElementById('playlistQueue');
    const videoPlayer = document.getElementById('hlsPlayer');
    
    // Watch view detail elements
    const currentVideoTitle = document.getElementById('currentVideoTitle');
    const currentChannelName = document.getElementById('currentChannelName');
    const currentViewsAndDate = document.getElementById('currentViewsAndDate');
    const currentChannelAvatar = document.getElementById('currentChannelAvatar');

    let hlsInstance = null;

    // Mock Data representing M3U8 video streams
    // Using widely available public test HLS streams
    const videos = [
        {
            id: 'v1',
            title: 'CCTV 5 Live',
            channel: 'CCTV Sports',
            views: 'Live',
            date: 'Now',
            duration: 'Live',
            thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=640&q=80',
            streamUrl: 'http://112.132.214.218/liveplay-kk.rtxapp.com/live/program/live/cctv5hd/4000000/mnf.m3u8',
            color: '#e11d48'
        },
        {
            id: 'v2',
            title: 'Abu Dhabi Sports 1',
            channel: 'AD Sports',
            views: 'Live',
            date: 'Now',
            duration: 'Live',
            thumbnail: 'https://images.unsplash.com/photo-1518605368461-1ee7c51952e4?auto=format&fit=crop&w=640&q=80',
            streamUrl: 'https://admdn1.cdn.mangomolo.com/adsports1/smil:adsports1.stream.smil/playlist.m3u8',
            color: '#2563eb'
        },
        {
            id: 'v3',
            title: 'Red Bull TV',
            channel: 'Red Bull',
            views: 'Live',
            date: 'Now',
            duration: 'Live',
            thumbnail: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&w=640&q=80',
            streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
            color: '#dc2626'
        },
        {
            id: 'v4',
            title: 'Dubai Sports 1',
            channel: 'Dubai Media',
            views: 'Live',
            date: 'Now',
            duration: 'Live',
            thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=640&q=80',
            streamUrl: 'https://dmitnthvll.cdn.mangomolo.com/dubaisports/smil:dubaisports.smil/index.m3u8',
            color: '#0ea5e9'
        },
        {
            id: 'v5',
            title: 'Fox Sports News',
            channel: 'Fox Sports',
            views: 'Live',
            date: 'Now',
            duration: 'Live',
            thumbnail: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=640&q=80',
            streamUrl: 'https://austchannel-live.akamaized.net/hls/live/2002736/austchannel-sport/master.m3u8',
            color: '#0f766e'
        },
        {
            id: 'v6',
            title: 'CCTV 16 HD',
            channel: 'CCTV Olympics',
            views: 'Live',
            date: 'Now',
            duration: 'Live',
            thumbnail: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=640&q=80',
            streamUrl: 'http://liveop.cctv.cn/hls/CCTV16HD/playlist.m3u8',
            color: '#c026d3'
        }
    ];

    // Initialize Grid
    function renderGrid() {
        videoGrid.innerHTML = videos.map(video => `
            <div class="video-card" data-id="${video.id}">
                <div class="thumbnail-container">
                    <img src="${video.thumbnail}" alt="${video.title}" class="thumbnail">
                    <div class="duration">${video.duration}</div>
                </div>
                <div class="video-details">
                    <div class="channel-icon" style="background-color: ${video.color}"></div>
                    <div class="video-info-meta">
                        <h3>${video.title}</h3>
                        <p>${video.channel}</p>
                        <p>${video.views} &bull; ${video.date}</p>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to grid items
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.getAttribute('data-id');
                const video = videos.find(v => v.id === videoId);
                playVideo(video);
            });
        });
    }

    // Initialize Playlist Sidebar
    function renderPlaylist(currentVideoId) {
        playlistQueue.innerHTML = videos.map(video => `
            <div class="playlist-item ${video.id === currentVideoId ? 'playing' : ''}" data-id="${video.id}">
                <img src="${video.thumbnail}" class="pl-thumb" alt="${video.title}">
                <div class="pl-info">
                    <div class="title">${video.title}</div>
                    <div class="channel">${video.channel}</div>
                    <div class="views">${video.views}</div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const videoId = item.getAttribute('data-id');
                const video = videos.find(v => v.id === videoId);
                playVideo(video);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // Play a video using HLS.js
    function playVideo(video) {
        // Update View
        homeView.classList.remove('active');
        watchView.classList.add('active');

        // Update Metadata
        currentVideoTitle.textContent = video.title;
        currentChannelName.textContent = video.channel;
        currentViewsAndDate.textContent = `${video.views} \u2022 ${video.date}`;
        currentChannelAvatar.style.backgroundColor = video.color;

        // Render Playlist relative to current
        renderPlaylist(video.id);

        // HLS Logic
        if (Hls.isSupported()) {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
            hlsInstance = new Hls();
            hlsInstance.loadSource(video.streamUrl);
            hlsInstance.attachMedia(videoPlayer);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                videoPlayer.play();
            });
        } 
        // For Safari which has native HLS support
        else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = video.streamUrl;
            videoPlayer.addEventListener('loadedmetadata', function() {
                videoPlayer.play();
            });
        }
    }

    // Navigation logic
    const goHome = () => {
        watchView.classList.remove('active');
        homeView.classList.add('active');
        // Stop playing
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        videoPlayer.pause();
        videoPlayer.removeAttribute('src');
        videoPlayer.load();
    };

    logo.addEventListener('click', goHome);
    homeNav.addEventListener('click', goHome);

    // Sidebar Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    menuBtn.addEventListener('click', () => {
        if (sidebar.style.transform === 'translateX(-100%)') {
            sidebar.style.transform = 'translateX(0)';
            sidebar.style.position = 'relative';
        } else {
            sidebar.style.transform = 'translateX(-100%)';
            setTimeout(() => { sidebar.style.position = 'absolute'; }, 300);
        }
    });

    // Initial Render
    renderGrid();
});
