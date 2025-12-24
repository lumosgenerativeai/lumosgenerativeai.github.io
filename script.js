
    // Dark Mode Toggle
    function toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }

    // Language Toggle
    function setLanguage(lang) {
      const isEnglish = lang === 'en';
      document.body.className = document.body.className.replace(/lang-\w+/, '') + (isEnglish ? ' lang-en' : ' lang-tr');

      // Update button states
      document.querySelectorAll('.lang-option').forEach(btn => {
        btn.classList.remove('lang-option-active');
        if (btn.dataset.langBtn === lang) {
          btn.classList.add('lang-option-active');
        }
      });

      localStorage.setItem('language', lang);
    }

    // Load language preference
    const savedLang = localStorage.getItem('language') || 'en';
    if (savedLang !== 'en') {
      setLanguage(savedLang);
    }

    // Calculate and set image panel width
    function updateImagePanelWidth() {
      const imagePanel = document.getElementById('imagePanel');
      const contentPanel = document.querySelector('.content-panel');

      // Only apply dynamic width on desktop (> 1200px)
      if (window.innerWidth > 1200) {
        const viewportHeight = window.innerHeight - 64; // minus navbar
        const baseWidth = viewportHeight * (9 / 16);
        const imageWidth = baseWidth * 1.2; // 20% daha geniş

        if (imagePanel) {
          imagePanel.style.width = imageWidth + 'px';
        }

        if (contentPanel) {
          contentPanel.style.marginRight = imageWidth + 'px';
        }
      } else {
        // Reset styles for mobile/tablet
        if (imagePanel) {
          imagePanel.style.width = '';
        }

        if (contentPanel) {
          contentPanel.style.marginRight = '';
        }
      }
    }

    // Update on load and resize
    updateImagePanelWidth();
    window.addEventListener('resize', updateImagePanelWidth);

    // Scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // ===================================================================
    // SCROLL-BASED RIGHT PANEL ANIMATIONS
    // ===================================================================
    function initRightPanelAnimations() {
      console.log('🚀 Initializing right panel animations...');

      const contentPanel = document.querySelector('.content-panel');
      const imagePanel = document.getElementById('imagePanel');
      const floatingLogo = document.getElementById('floatingLogo');
      const blurOverlay = document.getElementById('blurOverlay');
      const panelImage = document.querySelector('.panel-image');
      const panelVideo = document.getElementById('heroVideo');

      // Debug: Check if elements are found
      console.log('✓ Elements found:', {
        contentPanel: !!contentPanel,
        floatingLogo: !!floatingLogo,
        blurOverlay: !!blurOverlay,
        panelImage: !!panelImage,
        panelVideo: !!panelVideo
      });

      if (!contentPanel) {
        console.error('❌ Content panel not found!');
        return;
      }

      // Video looping state
      let isVideoLooping = false;

      // Test scroll listener first
      console.log('Adding scroll listener to:', contentPanel);
      console.log('ContentPanel scroll dimensions:', {
        scrollTop: contentPanel.scrollTop,
        scrollHeight: contentPanel.scrollHeight,
        clientHeight: contentPanel.clientHeight
      });

      // Main scroll listener - NEW CINEMATIC FLOW
      contentPanel.addEventListener('scroll', () => {
        const scrollTop = contentPanel.scrollTop;
        const scrollHeight = contentPanel.scrollHeight - contentPanel.clientHeight;
        const scrollPercentage = scrollTop / scrollHeight;

        // Phase 1: Initial blur, decreasing as scroll (0-30% scroll)
        if (scrollPercentage <= 0.3) {
          // Blur starts at 16px, gradually decreases to 0px
          const blurAmount = 16 * (1 - scrollPercentage / 0.3); // 16px -> 0px

          console.log('📊 Scroll:', (scrollPercentage * 100).toFixed(1) + '% | Blur:', blurAmount.toFixed(1) + 'px');

          blurOverlay.style.background = 'rgba(0, 0, 0, 0)';
          blurOverlay.style.backdropFilter = `blur(${blurAmount}px)`;

          floatingLogo.classList.remove('video-active', 'hidden');
          if (panelImage) panelImage.style.opacity = '1';
          if (panelVideo) panelVideo.style.opacity = '0';
        }
        // Phase 2: Video Fade In, Blur Already Zero (30-35% scroll)
        else if (scrollPercentage > 0.3 && scrollPercentage <= 0.35) {
          const videoProgress = (scrollPercentage - 0.3) / 0.05; // 0 to 1

          // Cross-fade between image and video
          if (panelImage) panelImage.style.opacity = `${1 - videoProgress}`;
          if (panelVideo) panelVideo.style.opacity = `${videoProgress}`;

          // Blur is already 0
          blurOverlay.style.backdropFilter = 'blur(0px)';
          blurOverlay.style.background = 'rgba(0, 0, 0, 0)';

          floatingLogo.classList.add('video-active');
          floatingLogo.classList.remove('hidden');
        }
        // Phase 6: Video Active with Scroll Playback (35-100% scroll)
        else if (scrollPercentage > 0.35) {
          if (panelImage) panelImage.style.opacity = '0';
          if (panelVideo) panelVideo.style.opacity = '1';
          blurOverlay.style.backdropFilter = 'blur(0px)';
          blurOverlay.style.background = 'rgba(0, 0, 0, 0)';

          floatingLogo.classList.add('video-active');
          floatingLogo.classList.remove('hidden');

          // Scroll-controlled video playback
          if (panelVideo && panelVideo.duration) {
            const videoProgress = (scrollPercentage - 0.35) / 0.65; // 0 to 1 from 35% to 100%
            const targetTime = videoProgress * panelVideo.duration;

            if (scrollPercentage >= 0.95 && !isVideoLooping) {
              isVideoLooping = true;
              panelVideo.play().catch(err => console.log('⚠ Autoplay prevented:', err));
            } else if (scrollPercentage < 0.95) {
              if (isVideoLooping) {
                isVideoLooping = false;
                panelVideo.pause();
              }
              if (Math.abs(panelVideo.currentTime - targetTime) > 0.1) {
                panelVideo.currentTime = targetTime;
              }
            }
          }
        }

        // Legacy scrolled class
        if (scrollPercentage > 0.1) {
          imagePanel.classList.add('scrolled');
        } else {
          imagePanel.classList.remove('scrolled');
        }
      });

      // Video event listeners
      if (panelVideo) {
        panelVideo.addEventListener('loadedmetadata', () => {
          console.log('🎬 Video loaded, duration:', panelVideo.duration + 's');
        });

        panelVideo.addEventListener('ended', () => {
          if (isVideoLooping) {
            panelVideo.currentTime = 0;
            panelVideo.play();
          }
        });
      }

      console.log('✅ Right panel animations initialized!');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initRightPanelAnimations);
    } else {
      initRightPanelAnimations();
    }

    // Visual Prompting Guide Interactive Keywords
    const keywords = document.querySelectorAll('.interactive-keyword');
    const revealArea = document.getElementById('keywordRevealArea');
    const revealLabel = document.getElementById('keywordRevealLabel');
    const revealTitle = document.getElementById('keywordRevealTitle');
    const revealDesc = document.getElementById('keywordRevealDesc');

    if (keywords.length > 0 && revealArea) {
      keywords.forEach(keyword => {
        keyword.addEventListener('mouseenter', function() {
          // Remove active class from all keywords
          keywords.forEach(kw => kw.classList.remove('active'));
          // Add active class to current keyword
          this.classList.add('active');

          // Update reveal area content
          revealLabel.textContent = this.getAttribute('data-label');
          revealTitle.textContent = this.getAttribute('data-title');
          revealDesc.textContent = this.getAttribute('data-desc');

          // Show reveal area
          revealArea.classList.add('visible');
        });

        keyword.addEventListener('mouseleave', function() {
          // Remove active class
          this.classList.remove('active');

          // Hide reveal area
          revealArea.classList.remove('visible');
        });
      });
    }

    // Fluent Collaboration Simulation
    const collabChatStream = document.getElementById('collabChatStream');
    const collabTopic = document.getElementById('collabTopic');
    const collabAngle = document.getElementById('collabAngle');
    const collabRowVisual = document.getElementById('collabRowVisual');
    const collabRowArtKey = document.getElementById('collabRowArtKey');
    const collabRowAtmos = document.getElementById('collabRowAtmos');
    const collabRowSpecs = document.getElementById('collabRowSpecs');
    const collabJsonStatus = document.getElementById('collabJsonStatus');
    const collabJsonStatusContainer = document.querySelector('.collab-json-status');

    if (collabChatStream) {
      function updateCollabRow(row, value) {
        row.classList.add('collab-param-filled');
        row.querySelector('.collab-param-value').textContent = value;
      }

      const collabTimeline = [
        // 1. User Input
        { t: 500, role: 'u', text: "Hey, I want to make a video about Tardigrades!" },

        // Action: Topic Extraction
        { t: 600, action: () => {
            const currentLang = document.body.classList.contains('lang-tr') ? 'tr' : 'en';
            if (currentLang === 'en') {
              collabTopic.textContent = "Tardigrades";
            } else {
              collabTopic.textContent = "Su Ayıları (Tardigrades)";
            }
            collabTopic.classList.remove('collab-topic-empty');
          }
        },

        // 2. AI Proactive Proposal (Concept)
        { t: 1500, role: 'ai', text: "That is a fascinating subject. To define the narrative angle, should we focus on a scientific breakdown of their biology, or perhaps a dramatic survival story set in extreme environments?" },

        // 3. User Choice
        { t: 2500, role: 'u', text: "Make it a dramatic survival story." },

        // Action: Angle Extraction
        { t: 2600, action: () => {
            const currentLang = document.body.classList.contains('lang-tr') ? 'tr' : 'en';
            if (currentLang === 'en') {
              collabAngle.textContent = '"Survival in the Extreme"';
            } else {
              collabAngle.textContent = '"Uç Noktalarda Hayatta Kalma"';
            }
            collabAngle.classList.add('collab-angle-active');
          }
        },

        // 4. AI Proactive Proposal (Style)
        { t: 4000, role: 'ai', text: "Understood. A narrative centered on resilience. For the visual fidelity, do you envisage realistic 8k footage like a nature documentary, or a stylized animation?" },

        // 5. User Choice
        { t: 5000, role: 'u', text: "Disney style animation please." },

        // Action: Style & Keyword Extraction
        { t: 5200, action: () => {
            updateCollabRow(collabRowVisual, "Animation");
            updateCollabRow(collabRowArtKey, "Disney 3D Style");
          }
        },

        // 6. AI Proactive Proposal (Atmosphere)
        { t: 6000, role: 'ai', text: "Noted. We will aim for a charming, high-quality animated look. Regarding the atmosphere, should it feel tense and epic, or perhaps more uplifting and whimsical?" },

        // 7. User Choice
        { t: 6500, role: 'u', text: "Uplifting and whimsical." },

        // Action: Atmosphere Extraction
        { t: 6700, action: () => {
            updateCollabRow(collabRowAtmos, "Uplifting/Whimsical");
          }
        },

        // 8. AI Confirmation (Specs)
        { t: 8000, role: 'ai', text: "Excellent. Finally, shall we stick to the standard 16:9 landscape ratio with a 2-minute duration?" },

        // 9. User Confirmation
        { t: 9000, role: 'u', text: "Yes." },

        // Action: Specs & Finalize
        { t: 9500, action: () => {
            updateCollabRow(collabRowSpecs, "16:9 • 2min");
            collabJsonStatus.textContent = "True";
            collabJsonStatusContainer.classList.add('collab-json-ready');
          }
        },

        // 10. AI Final
        { t: 11500, role: 'ai', text: 'Perfect. I have all the details. Proceeding to script generation... <span class="collab-cursor-blink"></span>' }
      ];

      let collabHasRun = false;

      const collabObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !collabHasRun) {
            collabHasRun = true;
            runCollabSimulation();
          }
        });
      }, { threshold: 0.3 });

      collabObserver.observe(document.querySelector('.collaboration-sim-section'));

      function runCollabSimulation() {
        collabTimeline.forEach(step => {
          setTimeout(() => {
            if (step.role) {
              addCollabMessage(step.role, step.text);
            }
            if (step.action) {
              step.action();
            }
          }, step.t);
        });
      }

      function addCollabMessage(role, text) {
        const MAX_MESSAGES = 6;

        // Check if we already have max messages
        const currentMessages = collabChatStream.querySelectorAll('.collab-msg');
        if (currentMessages.length >= MAX_MESSAGES) {
          // Fade out and remove the oldest message
          const oldestMsg = currentMessages[0];
          oldestMsg.classList.remove('visible');
          oldestMsg.classList.add('fade-out');

          // Remove after animation completes
          setTimeout(() => {
            oldestMsg.remove();
          }, 500);
        }

        // Create new message
        const div = document.createElement('div');
        div.className = 'collab-msg';
        div.innerHTML = `
          <div class="collab-avatar collab-avatar-${role}">${role === 'u' ? 'U' : 'AI'}</div>
          <div class="collab-text">${text}</div>
        `;
        collabChatStream.appendChild(div);

        // Fade in new message
        requestAnimationFrame(() => {
          div.classList.add('visible');
        });
      }
    }
