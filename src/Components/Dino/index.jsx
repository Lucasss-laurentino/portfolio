import React, { useEffect } from 'react';

export const Dino = () => {

  useEffect(() => {
    // Constantes e variáveis globais
    const FPS = 60;
    const DEFAULT_WIDTH = 600;
    const IS_HIDPI = window.devicePixelRatio > 1;
    const IS_MOBILE = window.navigator.userAgent.indexOf('Mobi') > -1;
    const IS_TOUCH_ENABLED = 'ontouchstart' in window;

    // Inicia o jogo
    function Runner(outerContainerId, opt_config) {
      // Singleton
      if (Runner.instance_) {
        return Runner.instance_;
      }
      Runner.instance_ = this;
      this.outerContainerEl = document.querySelector(outerContainerId);
      this.containerEl = null;
      this.config = opt_config || Runner.config;

      this.dimensions = Runner.defaultDimensions;
      this.canvas = null;
      this.canvasCtx = null;
      this.tRex = null;
      this.distanceMeter = null;
      this.distanceRan = 0;

      this.highestScore = 0;
      this.time = 0;
      this.runningTime = 0;
      this.msPerFrame = 1000 / FPS;
      this.currentSpeed = this.config.SPEED;
      this.obstacles = [];
      this.started = false;
      this.activated = false;
      this.crashed = false;
      this.paused = false;

      this.resizeTimerId_ = null;
      this.playCount = 0;
      // Sound FX.
      this.audioBuffer = null;
      this.soundFx = {};
      // Global web audio context for playing sounds.
      this.audioContext = null;

      // Images.
      this.images = {};
      this.imagesLoaded = 0;
      this.loadImages();
    }
    window['Runner'] = Runner;

    // Configurações padrão
    Runner.config = {
      ACCELERATION: 0.001,
      BG_CLOUD_SPEED: 0.2,
      BOTTOM_PAD: 10,
      CLEAR_TIME: 3000,
      CLOUD_FREQUENCY: 0.5,
      GAMEOVER_CLEAR_TIME: 750,
      GAP_COEFFICIENT: 0.6,
      GRAVITY: 0.6,
      INITIAL_JUMP_VELOCITY: 12,
      MAX_CLOUDS: 6,
      MAX_OBSTACLE_LENGTH: 3,
      MAX_SPEED: 12,
      MIN_JUMP_HEIGHT: 35,
      MOBILE_SPEED_COEFFICIENT: 1.2,
      RESOURCE_TEMPLATE_ID: 'audio-resources',
      SPEED: 6,
      SPEED_DROP_COEFFICIENT: 3
    };

    // Define dimensões padrão da área de jogo
    Runner.defaultDimensions = {
      WIDTH: DEFAULT_WIDTH,
      HEIGHT: 150
    };

    // Define classes css
    Runner.classes = {
      CANVAS: 'runner-canvas',
      CONTAINER: 'runner-container',
      CRASHED: 'crashed',
      ICON: 'icon-offline',
      TOUCH_CONTROLLER: 'controller'
    };

    // define imagens e resoluções
    Runner.imageSources = {
      LDPI: [{
        name: 'CACTUS_LARGE',
        id: '1x-obstacle-large'
      }, {
        name: 'CACTUS_SMALL',
        id: '1x-obstacle-small'
      }, {
        name: 'CLOUD',
        id: '1x-cloud'
      }, {
        name: 'HORIZON',
        id: '1x-horizon'
      }, {
        name: 'RESTART',
        id: '1x-restart'
      }, {
        name: 'TEXT_SPRITE',
        id: '1x-text'
      }, {
        name: 'TREX',
        id: '1x-trex'
      }],
      HDPI: [{
        name: 'CACTUS_LARGE',
        id: '2x-obstacle-large'
      }, {
        name: 'CACTUS_SMALL',
        id: '2x-obstacle-small'
      }, {
        name: 'CLOUD',
        id: '2x-cloud'
      }, {
        name: 'HORIZON',
        id: '2x-horizon'
      }, {
        name: 'RESTART',
        id: '2x-restart'
      }, {
        name: 'TEXT_SPRITE',
        id: '2x-text'
      }, {
        name: 'TREX',
        id: '2x-trex'
      }]
    };

    // Configura sons do jogo
    Runner.sounds = {
      BUTTON_PRESS: 'offline-sound-press',
      HIT: 'offline-sound-hit',
      SCORE: 'offline-sound-reached'
    };

    // Mapeia teclas do teclado pra ações especificas no jogo
    Runner.keycodes = {
      JUMP: {
        '38': 1,
        '32': 1
      }, // Up, spacebar
      DUCK: {
        '40': 1
      }, // Down
      RESTART: {
        '13': 1
      } // Enter
    };

    // Eventos
    Runner.events = {
      ANIM_END: 'webkitAnimationEnd',
      CLICK: 'click',
      KEYDOWN: 'keydown',
      KEYUP: 'keyup',
      MOUSEDOWN: 'mousedown',
      MOUSEUP: 'mouseup',
      RESIZE: 'resize',
      TOUCHEND: 'touchend',
      TOUCHSTART: 'touchstart',
      VISIBILITY: 'visibilitychange',
      BLUR: 'blur',
      FOCUS: 'focus',
      LOAD: 'load'
    };

    // Lógica
    Runner.prototype = {
      updateConfigSetting: function (setting, value) {
        if (setting in this.config && value != undefined) {
          this.config[setting] = value;
          switch (setting) {
            case 'GRAVITY':
            case 'MIN_JUMP_HEIGHT':
            case 'SPEED_DROP_COEFFICIENT':
              this.tRex.config[setting] = value;
              break;
            case 'INITIAL_JUMP_VELOCITY':
              this.tRex.setJumpVelocity(value);
              break;
            case 'SPEED':
              this.setSpeed(value);
              break;
          }
        }
      },

      /**
       * Load and cache the image assets from the page.
       */
      loadImages: function () {
        var imageSources = IS_HIDPI ? Runner.imageSources.HDPI :
          Runner.imageSources.LDPI;
        var numImages = imageSources.length;
        for (var i = numImages - 1; i >= 0; i--) {
          var imgSource = imageSources[i];
          this.images[imgSource.name] = document.getElementById(imgSource.id);
        }
        this.init();
      },
      /**
       * Load and decode base 64 encoded sounds.
       */
      loadSounds: function () {
        this.audioContext = new AudioContext();
        var resourceTemplate =
          document.getElementById(this.config.RESOURCE_TEMPLATE_ID).content;

        for (var sound in Runner.sounds) {
          var soundSrc = resourceTemplate.getElementById(Runner.sounds[sound]).src;
          soundSrc = soundSrc.substr(soundSrc.indexOf(',') + 1);

          var buffer = decodeBase64ToArrayBuffer(soundSrc);
          // Async, so no guarantee of order in array.
          this.audioContext.decodeAudioData(buffer, function (index, audioData) {
            this.soundFx[index] = audioData;
          }.bind(this, sound));
        }
      },
      /**
       * Sets the game speed. Adjust the speed accordingly if on a smaller screen.
       * @param {number} opt_speed
       */
      setSpeed: function (opt_speed) {
        var speed = opt_speed || this.currentSpeed;
        // Reduce the speed on smaller mobile screens.
        if (this.dimensions.WIDTH < DEFAULT_WIDTH) {
          var mobileSpeed = speed * this.dimensions.WIDTH / DEFAULT_WIDTH *
            this.config.MOBILE_SPEED_COEFFICIENT;
          this.currentSpeed = mobileSpeed > speed ? speed : mobileSpeed;
        } else if (opt_speed) {
          this.currentSpeed = opt_speed;
        }
      },

      /**
       * Game initialiser.
       */
      init: function () {
        // Hide the static icon.
        document.querySelector('.' + Runner.classes.ICON).style.visibility =
          'hidden';
        this.adjustDimensions();
        this.setSpeed();
        this.containerEl = document.createElement('div');
        this.containerEl.className = Runner.classes.CONTAINER;
        // Player canvas container.
        this.canvas = createCanvas(this.containerEl, this.dimensions.WIDTH,
          this.dimensions.HEIGHT, Runner.classes.PLAYER);

        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasCtx.fillStyle = '#f7f7f7';
        this.canvasCtx.fill();
        Runner.updateCanvasScaling(this.canvas);
        // Horizon contains clouds, obstacles and the ground.
        this.horizon = new Horizon(this.canvas, this.images, this.dimensions,
          this.config.GAP_COEFFICIENT);
        // Distance meter
        this.distanceMeter = new DistanceMeter(this.canvas,
          this.images.TEXT_SPRITE, this.dimensions.WIDTH);
        // Draw t-rex
        this.tRex = new Trex(this.canvas, this.images.TREX);

        this.outerContainerEl.appendChild(this.containerEl);
        if (IS_MOBILE) {
          this.createTouchController();
        }
        this.startListening();
        this.update();
        window.addEventListener(Runner.events.RESIZE,
          this.debounceResize.bind(this));
      },

      /**
       * Create the touch controller. A div that covers whole screen.
       */
      createTouchController: function () {
        this.touchController = document.createElement('div');
        this.touchController.className = Runner.classes.TOUCH_CONTROLLER;
      },
      /**
       * Debounce the resize event.
       */
      debounceResize: function () {
        if (!this.resizeTimerId_) {
          this.resizeTimerId_ =
            setInterval(this.adjustDimensions.bind(this), 250);
        }
      },
      /**
       * Adjust game space dimensions on resize.
       */
      adjustDimensions: function () {
        clearInterval(this.resizeTimerId_);
        this.resizeTimerId_ = null;
        var boxStyles = window.getComputedStyle(this.outerContainerEl);
        var padding = Number(boxStyles.paddingLeft.substr(0,
          boxStyles.paddingLeft.length - 2));

        this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - padding * 2;
        // Redraw the elements back onto the canvas.
        if (this.canvas) {
          this.canvas.width = this.dimensions.WIDTH;
          this.canvas.height = this.dimensions.HEIGHT;
          Runner.updateCanvasScaling(this.canvas);
          this.distanceMeter.calcXPos(this.dimensions.WIDTH);
          this.clearCanvas();
          this.horizon.update(0, 0, true);
          this.tRex.update(0);

          // Outer container and distance meter.
          if (this.activated || this.crashed) {
            this.containerEl.style.width = this.dimensions.WIDTH + 'px';
            this.containerEl.style.height = this.dimensions.HEIGHT + 'px';
            this.distanceMeter.update(0, Math.ceil(this.distanceRan));
            this.stop();
          } else {
            this.tRex.draw(0, 0);
          }
          // Game over panel.
          if (this.crashed && this.gameOverPanel) {
            this.gameOverPanel.updateDimensions(this.dimensions.WIDTH);
            this.gameOverPanel.draw();
          }
        }
      },
      /**
       * Play the game intro.
       * Canvas container width expands out to the full width.
       */
      playIntro: function () {
        if (!this.started && !this.crashed) {
          this.playingIntro = true;
          this.tRex.playingIntro = true;
          // CSS animation definition.
          var keyframes = '@-webkit-keyframes intro { ' +
            'from { width:' + Trex.config.WIDTH + 'px }' +
            'to { width: ' + this.dimensions.WIDTH + 'px }' +
            '}';
          document.styleSheets[0].insertRule(keyframes, 0);

          this.containerEl.addEventListener(Runner.events.ANIM_END,
            this.startGame.bind(this));
          this.containerEl.style.webkitAnimation = 'intro .4s ease-out 1 both';
          this.containerEl.style.width = this.dimensions.WIDTH + 'px';
          if (this.touchController) {
            this.outerContainerEl.appendChild(this.touchController);
          }
          this.activated = true;
          this.started = true;
        } else if (this.crashed) {
          this.restart();
        }
      },

      /**
       * Update the game status to started.
       */
      startGame: function () {
        this.runningTime = 0;
        this.playingIntro = false;
        this.tRex.playingIntro = false;
        this.containerEl.style.webkitAnimation = '';
        this.playCount++;
        // Handle tabbing off the page. Pause the current game.
        window.addEventListener(Runner.events.VISIBILITY,
          this.onVisibilityChange.bind(this));
        window.addEventListener(Runner.events.BLUR,
          this.onVisibilityChange.bind(this));
        window.addEventListener(Runner.events.FOCUS,
          this.onVisibilityChange.bind(this));
      },

      clearCanvas: function () {
        this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH,
          this.dimensions.HEIGHT);
      },
      /**
       * Update the game frame.
       */
      update: function () {
        this.drawPending = false;
        var now = performance.now();
        var deltaTime = now - (this.time || now);
        this.time = now;
        if (this.activated) {
          this.clearCanvas();

          if (this.tRex.jumping) {
            this.tRex.updateJump(deltaTime, this.config);
          }
          this.runningTime += deltaTime;
          var hasObstacles = this.runningTime > this.config.CLEAR_TIME;
          // First jump triggers the intro.
          if (this.tRex.jumpCount == 1 && !this.playingIntro) {
            this.playIntro();
          }
          // The horizon doesn't move until the intro is over.
          if (this.playingIntro) {
            this.horizon.update(0, this.currentSpeed, hasObstacles);
          } else {
            deltaTime = !this.started ? 0 : deltaTime;
            this.horizon.update(deltaTime, this.currentSpeed, hasObstacles);
          }

          // Check for collisions.
          var collision = hasObstacles &&
            checkForCollision(this.horizon.obstacles[0], this.tRex);
          if (!collision) {
            this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;
            if (this.currentSpeed < this.config.MAX_SPEED) {
              this.currentSpeed += this.config.ACCELERATION;
            }
          } else {
            this.gameOver();
          }
          if (this.distanceMeter.getActualDistance(this.distanceRan) >
            this.distanceMeter.maxScore) {
            this.distanceRan = 0;
          }

          var playAcheivementSound = this.distanceMeter.update(deltaTime,
            Math.ceil(this.distanceRan));
          if (playAcheivementSound) {
            this.playSound(this.soundFx.SCORE);
          }
        }
        if (!this.crashed) {
          this.tRex.update(deltaTime);
          this.raq();
        }
      },
      /**
       * Event handler.
       */
      handleEvent: function (e) {
        return (function (evtType, events) {
          switch (evtType) {
            case events.KEYDOWN:
            case events.TOUCHSTART:
            case events.MOUSEDOWN:
              this.onKeyDown(e);
              break;
            case events.KEYUP:
            case events.TOUCHEND:
            case events.MOUSEUP:
              this.onKeyUp(e);
              break;
          }
        }.bind(this))(e.type, Runner.events);
      },

      /**
       * Bind relevant key / mouse / touch listeners.
       */
      startListening: function () {
        // Keys.
        document.addEventListener(Runner.events.KEYDOWN, this);
        document.addEventListener(Runner.events.KEYUP, this);
        if (IS_MOBILE) {
          // Mobile only touch devices.
          this.touchController.addEventListener(Runner.events.TOUCHSTART, this);
          this.touchController.addEventListener(Runner.events.TOUCHEND, this);
          this.containerEl.addEventListener(Runner.events.TOUCHSTART, this);
        } else {
          // Mouse.
          document.addEventListener(Runner.events.MOUSEDOWN, this);
          document.addEventListener(Runner.events.MOUSEUP, this);
        }
      },
      /**
       * Remove all listeners.
       */
      stopListening: function () {
        document.removeEventListener(Runner.events.KEYDOWN, this);
        document.removeEventListener(Runner.events.KEYUP, this);
        if (IS_MOBILE) {
          this.touchController.removeEventListener(Runner.events.TOUCHSTART, this);
          this.touchController.removeEventListener(Runner.events.TOUCHEND, this);
          this.containerEl.removeEventListener(Runner.events.TOUCHSTART, this);
        } else {
          document.removeEventListener(Runner.events.MOUSEDOWN, this);
          document.removeEventListener(Runner.events.MOUSEUP, this);
        }
      },

      /**
       * Process keydown.
       * @param {Event} e
       */
      onKeyDown: function (e) {
        if (!this.crashed && (Runner.keycodes.JUMP[String(e.keyCode)] ||
          e.type == Runner.events.TOUCHSTART)) {
          if (!this.activated) {
            // this.loadSounds();
            this.activated = true;
          }
          if (!this.tRex.jumping) {
            this.playSound(this.soundFx.BUTTON_PRESS);
            this.tRex.startJump();
          }
        }
        if (this.crashed && e.type == Runner.events.TOUCHSTART &&
          e.currentTarget == this.containerEl) {
          this.restart();
        }
        // Speed drop, activated only when jump key is not pressed.
        if (Runner.keycodes.DUCK[e.keyCode] && this.tRex.jumping) {
          e.preventDefault();
          this.tRex.setSpeedDrop();
        }
      },

      /**
       * Process key up.
       * @param {Event} e
       */
      onKeyUp: function (e) {
        var keyCode = String(e.keyCode);
        var isjumpKey = Runner.keycodes.JUMP[keyCode] ||
          e.type == Runner.events.TOUCHEND ||
          e.type == Runner.events.MOUSEDOWN;
        if (this.isRunning() && isjumpKey) {
          this.tRex.endJump();
        } else if (Runner.keycodes.DUCK[keyCode]) {
          this.tRex.speedDrop = false;
        } else if (this.crashed) {
          // Check that enough time has elapsed before allowing jump key to restart.
          var deltaTime = performance.now() - this.time;
          if (Runner.keycodes.RESTART[keyCode] ||
            (e.type == Runner.events.MOUSEUP && e.target == this.canvas) ||
            (deltaTime >= this.config.GAMEOVER_CLEAR_TIME &&
              Runner.keycodes.JUMP[keyCode])) {
            this.restart();
          }
        } else if (this.paused && isjumpKey) {
          this.play();
        }
      },

      /**
       * RequestAnimationFrame wrapper.
       */
      raq: function () {
        if (!this.drawPending) {
          this.drawPending = true;
          this.raqId = requestAnimationFrame(this.update.bind(this));
        }
      },
      /**
       * Whether the game is running.
       * @return {boolean}
       */
      isRunning: function () {
        return !!this.raqId;
      },
      /**
       * Game over state.
       */
      gameOver: function () {
        this.playSound(this.soundFx.HIT);
        vibrate(200);
        this.stop();
        this.crashed = true;
        this.distanceMeter.acheivement = false;

        this.tRex.update(100, Trex.status.CRASHED);
        // Game over panel.
        if (!this.gameOverPanel) {
          this.gameOverPanel = new GameOverPanel(this.canvas,
            this.images.TEXT_SPRITE, this.images.RESTART,
            this.dimensions);
        } else {
          this.gameOverPanel.draw();
        }
        // Update the high score.
        if (this.distanceRan > this.highestScore) {
          this.highestScore = Math.ceil(this.distanceRan);
          this.distanceMeter.setHighScore(this.highestScore);
        }
        // Reset the time clock.
        this.time = performance.now();
      },

      stop: function () {
        this.activated = false;
        this.paused = true;
        cancelAnimationFrame(this.raqId);
        this.raqId = 0;
      },
      play: function () {
        if (!this.crashed) {
          this.activated = true;
          this.paused = false;
          this.tRex.update(0, Trex.status.RUNNING);
          this.time = performance.now();
          this.update();
        }
      },
      restart: function () {
        if (!this.raqId) {
          this.playCount++;
          this.runningTime = 0;
          this.activated = true;
          this.crashed = false;
          this.distanceRan = 0;
          this.setSpeed(this.config.SPEED);
          this.time = performance.now();
          this.containerEl.classList.remove(Runner.classes.CRASHED);
          this.clearCanvas();
          this.distanceMeter.reset(this.highestScore);
          this.horizon.reset();
          this.tRex.reset();
          this.playSound(this.soundFx.BUTTON_PRESS);

          this.update();
        }
      },
      /**
       * Pause the game if the tab is not in focus.
       */
      onVisibilityChange: function (e) {
        if (document.hidden || document.webkitHidden || e.type == 'blur') {
          this.stop();
        } else {
          this.play();
        }
      },
      /**
       * Play a sound.
       * @param {SoundBuffer} soundBuffer
       */
      playSound: function (soundBuffer) {
        if (soundBuffer) {
          var sourceNode = this.audioContext.createBufferSource();
          sourceNode.buffer = soundBuffer;
          sourceNode.connect(this.audioContext.destination);
          sourceNode.start(0);
        }
      }
    };

    // ajusta resolução do canvas
    Runner.updateCanvasScaling = function (canvas, opt_width, opt_height) {
      var context = canvas.getContext('2d');
      // Query the various pixel ratios
      var devicePixelRatio = Math.floor(window.devicePixelRatio) || 1;
      var backingStoreRatio = Math.floor(context.webkitBackingStorePixelRatio) || 1;
      var ratio = devicePixelRatio / backingStoreRatio;
      // Upscale the canvas if the two ratios don't match
      if (devicePixelRatio !== backingStoreRatio) {
        var oldWidth = opt_width || canvas.width;
        var oldHeight = opt_height || canvas.height;

        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        // Scale the context to counter the fact that we've manually scaled
        // our canvas element.
        context.scale(ratio, ratio);
        return true;
      }
      return false;
    };

    // retorna um numero inteiro entre min e max
    function getRandomNum(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // faz o dispositivo vibrar caso seja mobile
    function vibrate(duration) {
      if (IS_MOBILE) {
        window.navigator['vibrate'](duration);
      }
    }

    // cria o elemento canvas
    function createCanvas(container, width, height, opt_classname) {
      var canvas = document.createElement('canvas');
      canvas.className = opt_classname ? Runner.classes.CANVAS + ' ' +
        opt_classname : Runner.classes.CANVAS;
      canvas.width = width;
      canvas.height = height;
      container.appendChild(canvas);
      return canvas;
    }

    function decodeBase64ToArrayBuffer(base64String) {
      var len = (base64String.length / 4) * 3;
      var str = atob(base64String);
      var arrayBuffer = new ArrayBuffer(len);
      var bytes = new Uint8Array(arrayBuffer);

      for (var i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
      }
      return bytes.buffer;
    }

    // Cria o painel de game over
    function GameOverPanel(canvas, textSprite, restartImg, dimensions) {
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      this.canvasDimensions = dimensions;
      this.textSprite = textSprite;
      this.restartImg = restartImg;
      this.draw();
    };

    // define as dimensoes e posições dos elementros dentro do painel de game over
    GameOverPanel.dimensions = {
      TEXT_X: 0,
      TEXT_Y: 13,
      TEXT_WIDTH: 191,
      TEXT_HEIGHT: 11,
      RESTART_WIDTH: 36,
      RESTART_HEIGHT: 32
    };

    GameOverPanel.prototype = {
      /**
       * Update the panel dimensions.
       * @param {number} width New canvas width.
       * @param {number} opt_height Optional new canvas height.
       */
      updateDimensions: function (width, opt_height) {
        this.canvasDimensions.WIDTH = width;
        if (opt_height) {
          this.canvasDimensions.HEIGHT = opt_height;
        }
      },
      /**
       * Draw the panel.
       */
      draw: function () {
        var dimensions = GameOverPanel.dimensions;
        var centerX = this.canvasDimensions.WIDTH / 2;
        // Game over text.
        var textSourceX = dimensions.TEXT_X;
        var textSourceY = dimensions.TEXT_Y;
        var textSourceWidth = dimensions.TEXT_WIDTH;
        var textSourceHeight = dimensions.TEXT_HEIGHT;

        var textTargetX = Math.round(centerX - (dimensions.TEXT_WIDTH / 2));
        var textTargetY = Math.round((this.canvasDimensions.HEIGHT - 25) / 3);
        var textTargetWidth = dimensions.TEXT_WIDTH;
        var textTargetHeight = dimensions.TEXT_HEIGHT;
        var restartSourceWidth = dimensions.RESTART_WIDTH;
        var restartSourceHeight = dimensions.RESTART_HEIGHT;
        var restartTargetX = centerX - (dimensions.RESTART_WIDTH / 2);
        var restartTargetY = this.canvasDimensions.HEIGHT / 2;
        if (IS_HIDPI) {
          textSourceY *= 2;
          textSourceX *= 2;
          textSourceWidth *= 2;
          textSourceHeight *= 2;
          restartSourceWidth *= 2;
          restartSourceHeight *= 2;
        }
        // Game over text from sprite.
        this.canvasCtx.drawImage(this.textSprite,
          textSourceX, textSourceY, textSourceWidth, textSourceHeight,
          textTargetX, textTargetY, textTargetWidth, textTargetHeight);

        // Restart button.
        this.canvasCtx.drawImage(this.restartImg, 0, 0,
          restartSourceWidth, restartSourceHeight,
          restartTargetX, restartTargetY, dimensions.RESTART_WIDTH,
          dimensions.RESTART_HEIGHT);
      }
    };

    // Detecta colisões entre o dino e os obstaculos
    function checkForCollision(obstacle, tRex, opt_canvasCtx) {
      var obstacleBoxXPos = Runner.defaultDimensions.WIDTH + obstacle.xPos;

      // Adjustments are made to the bounding box as there is a 1 pixel white
      // border around the t-rex and obstacles.
      var tRexBox = new CollisionBox(
        tRex.xPos + 1,
        tRex.yPos + 1,
        tRex.config.WIDTH - 2,
        tRex.config.HEIGHT - 2);
      var obstacleBox = new CollisionBox(
        obstacle.xPos + 1,
        obstacle.yPos + 1,
        obstacle.typeConfig.width * obstacle.size - 2,
        obstacle.typeConfig.height - 2);
      // Debug outer box
      if (opt_canvasCtx) {
        drawCollisionBoxes(opt_canvasCtx, tRexBox, obstacleBox);
      }
      // Simple outer bounds check.
      if (boxCompare(tRexBox, obstacleBox)) {
        var collisionBoxes = obstacle.collisionBoxes;
        var tRexCollisionBoxes = Trex.collisionBoxes;

        // Detailed axis aligned box check.
        for (var t = 0; t < tRexCollisionBoxes.length; t++) {
          for (var i = 0; i < collisionBoxes.length; i++) {
            // Adjust the box to actual positions.
            var adjTrexBox =
              createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
            var adjObstacleBox =
              createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);
            var crashed = boxCompare(adjTrexBox, adjObstacleBox);
            // Draw boxes for debug.
            if (opt_canvasCtx) {
              drawCollisionBoxes(opt_canvasCtx, adjTrexBox, adjObstacleBox);
            }
            if (crashed) {
              return [adjTrexBox, adjObstacleBox];
            }
          }
        }
      }
      return false;
    };

    function createAdjustedCollisionBox(box, adjustment) {
      return new CollisionBox(
        box.x + adjustment.x,
        box.y + adjustment.y,
        box.width,
        box.height);
    };

    function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
      canvasCtx.save();
      canvasCtx.strokeStyle = '#f00';
      canvasCtx.strokeRect(tRexBox.x, tRexBox.y,
        tRexBox.width, tRexBox.height);
      canvasCtx.strokeStyle = '#0f0';
      canvasCtx.strokeRect(obstacleBox.x, obstacleBox.y,
        obstacleBox.width, obstacleBox.height);
      canvasCtx.restore();
    };

    function boxCompare(tRexBox, obstacleBox) {
      var crashed = false;
      var tRexBoxX = tRexBox.x;
      var tRexBoxY = tRexBox.y;
      var obstacleBoxX = obstacleBox.x;
      var obstacleBoxY = obstacleBox.y;
      // Axis-Aligned Bounding Box method.
      if (tRexBox.x < obstacleBoxX + obstacleBox.width &&
        tRexBox.x + tRexBox.width > obstacleBoxX &&
        tRexBox.y < obstacleBox.y + obstacleBox.height &&
        tRexBox.height + tRexBox.y > obstacleBox.y) {
        crashed = true;
      }

      return crashed;
    };

    function CollisionBox(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;
    };

    // configurações dos obstaculos
    function Obstacle(canvasCtx, type, obstacleImg, dimensions,
      gapCoefficient, speed) {
      this.canvasCtx = canvasCtx;
      this.image = obstacleImg;
      this.typeConfig = type;
      this.gapCoefficient = gapCoefficient;
      this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
      this.dimensions = dimensions;
      this.remove = false;
      this.xPos = 0;
      this.yPos = this.typeConfig.yPos;
      this.width = 0;
      this.collisionBoxes = [];
      this.gap = 0;

      this.init(speed);
    };

    Obstacle.MAX_GAP_COEFFICIENT = 1.5;

    Obstacle.MAX_OBSTACLE_LENGTH = 3 //,

    Obstacle.prototype = {

      init: function (speed) {
        this.cloneCollisionBoxes();
        // Only allow sizing if we're at the right speed.
        if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
          this.size = 1;
        }
        this.width = this.typeConfig.width * this.size;
        this.xPos = this.dimensions.WIDTH - this.width;
        this.draw();

        // Make collision box adjustments,
        // Central box is adjusted to the size as one box.
        //      ____        ______        ________
        //    _|   |-|    _|     |-|    _|       |-|
        //   | |<->| |   | |<--->| |   | |<----->| |
        //   | | 1 | |   | |  2  | |   | |   3   | |
        //   |_|___|_|   |_|_____|_|   |_|_______|_|
        //
        if (this.size > 1) {
          this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width -
            this.collisionBoxes[2].width;
          this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
        }
        this.gap = this.getGap(this.gapCoefficient, speed);
      },
      /**
       * Draw and crop based on size.
       */
      draw: function () {
        var sourceWidth = this.image.width; // Largura original da imagem
        var sourceHeight = this.image.height; // Altura original da imagem

        if (IS_HIDPI) {
          sourceWidth *= 2; // Para telas HiDPI, aumenta a largura da imagem
          sourceHeight *= 2; // Para telas HiDPI, aumenta a altura da imagem
        }

        // Definir o fator de aumento para a imagem
        var scaleFactor = 1.5; // Ajuste o fator conforme necessário

        // Calcular o tamanho da imagem de destino com base no fator de escala
        var destWidth = sourceWidth * scaleFactor;
        var destHeight = sourceHeight * scaleFactor;

        // Garantir que a imagem não ultrapasse o tamanho máximo do obstáculo
        var maxWidth = this.image.width; // Largura máxima permitida
        var maxHeight = this.image.height; // Altura máxima permitida

        // Ajuste a largura se ultrapassar o limite máximo
        if (destWidth > maxWidth) {
          destWidth = maxWidth;
          destHeight = destWidth * (sourceHeight / sourceWidth); // Mantém a proporção
        }

        // Ajuste a altura se ultrapassar o limite máximo
        if (destHeight > maxHeight) {
          destHeight = maxHeight;
          destWidth = destHeight * (sourceWidth / sourceHeight); // Mantém a proporção
        }

        // Centralizar a imagem no canvas
        var offsetX = this.xPos + (this.image.width - destWidth) / 2;
        var offsetY = this.yPos + (this.image.height - destHeight) / 2;

        // Desenhar a imagem no canvas com o novo tamanho ajustado
        this.canvasCtx.drawImage(
          this.image,
          0, 0, // Posição da imagem original
          sourceWidth, sourceHeight, // Tamanho original da imagem
          offsetX, offsetY, // Posição da imagem no canvas
          destWidth, destHeight // Tamanho da imagem após o redimensionamento
        );
      },

      /**
       * Obstacle frame update.
       * @param {number} deltaTime
       * @param {number} speed
       */
      update: function (deltaTime, speed) {
        if (!this.remove) {
          this.xPos -= Math.floor((speed * FPS / 1000) * deltaTime);
          this.draw();
          if (!this.isVisible()) {
            this.remove = true;
          }
        }
      },
      /**
       * Calculate a random gap size.
       * - Minimum gap gets wider as speed increses
       * @param {number} gapCoefficient
       * @param {number} speed
       * @return {number} The gap size.
       */
      getGap: function (gapCoefficient, speed) {
        var minGap = Math.round(this.width * speed +
          this.typeConfig.minGap * gapCoefficient);
        var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
        return getRandomNum(minGap, maxGap);
      },

      /**
       * Check if obstacle is visible.
       * @return {boolean} Whether the obstacle is in the game area.
       */
      isVisible: function () {
        return this.xPos + this.width > 0;
      },
      /**
       * Make a copy of the collision boxes, since these will change based on
       * obstacle type and size.
       */
      cloneCollisionBoxes: function () {
        var collisionBoxes = this.typeConfig.collisionBoxes;
        for (var i = collisionBoxes.length - 1; i >= 0; i--) {
          this.collisionBoxes[i] = new CollisionBox(collisionBoxes[i].x,
            collisionBoxes[i].y, collisionBoxes[i].width,
            collisionBoxes[i].height);
        }
      }
    };

    Obstacle.types = [{
      type: 'CACTUS_SMALL',
      className: ' cactus cactus-small ',
      width: 17,
      height: 35,
      yPos: 105,
      multipleSpeed: 3,
      minGap: 120,
      collisionBoxes: [
        new CollisionBox(0, 7, 5, 27),
        new CollisionBox(4, 0, 6, 34),
        new CollisionBox(10, 4, 7, 14)
      ]
    }, {
      type: 'CACTUS_LARGE',
      className: ' cactus cactus-large ',
      width: 25,
      height: 50,
      yPos: 90,
      multipleSpeed: 6,
      minGap: 120,
      collisionBoxes: [
        new CollisionBox(0, 12, 7, 38),
        new CollisionBox(8, 0, 7, 49),
        new CollisionBox(13, 10, 10, 38)
      ]
    }];

    /* ---------- fim das configurações de obstaculos ------------- */

    // Configurações do dino
    function Trex(canvas, image) {
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      this.image = image;
      this.xPos = 0;
      this.yPos = 0;
      // Position when on the ground.
      this.groundYPos = 0;
      this.currentFrame = 0;
      this.currentAnimFrames = [];
      this.blinkDelay = 0;
      this.animStartTime = 0;
      this.timer = 0;
      this.msPerFrame = 1000 / FPS;
      this.config = Trex.config;
      // Current status.
      this.status = Trex.status.WAITING;
      this.jumping = false;
      this.jumpVelocity = 0;
      this.reachedMinHeight = false;
      this.speedDrop = false;
      this.jumpCount = 0;
      this.jumpspotX = 0;

      this.init();
    };

    Trex.config = {
      DROP_VELOCITY: -5,
      GRAVITY: 0.6,
      HEIGHT: 47,
      INIITAL_JUMP_VELOCITY: -10,
      INTRO_DURATION: 1500,
      MAX_JUMP_HEIGHT: 30,
      MIN_JUMP_HEIGHT: 30,
      SPEED_DROP_COEFFICIENT: 3,
      SPRITE_WIDTH: 262,
      START_X_POS: 50,
      WIDTH: 44
    };

    Trex.collisionBoxes = [
      new CollisionBox(1, -1, 30, 26),
      new CollisionBox(32, 0, 8, 16),
      new CollisionBox(10, 35, 14, 8),
      new CollisionBox(1, 24, 29, 5),
      new CollisionBox(5, 30, 21, 4),
      new CollisionBox(9, 34, 15, 4)
    ];

    Trex.status = {
      CRASHED: 'CRASHED',
      JUMPING: 'JUMPING',
      RUNNING: 'RUNNING',
      WAITING: 'WAITING'
    };

    Trex.BLINK_TIMING = 7000;

    Trex.animFrames = {
      WAITING: {
        frames: [44, 0],
        msPerFrame: 1000 / 3
      },
      RUNNING: {
        frames: [88, 132],
        msPerFrame: 1000 / 12
      },
      CRASHED: {
        frames: [220],
        msPerFrame: 1000 / 60
      },
      JUMPING: {
        frames: [0],
        msPerFrame: 1000 / 60
      }
    };

    Trex.prototype = {
      /**
       * T-rex player initaliser.
       * Sets the t-rex to blink at random intervals.
       */
      init: function () {
        this.blinkDelay = this.setBlinkDelay();
        this.groundYPos = Runner.defaultDimensions.HEIGHT - this.config.HEIGHT -
          Runner.config.BOTTOM_PAD;
        this.yPos = this.groundYPos;
        this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT;

        this.draw(0, 0);
        this.update(0, Trex.status.WAITING);
      },
      /**
       * Setter for the jump velocity.
       * The approriate drop velocity is also set.
       */
      setJumpVelocity: function (setting) {
        this.config.INIITAL_JUMP_VELOCITY = -setting;
        this.config.DROP_VELOCITY = -setting / 2;
      },
      /**
       * Set the animation status.
       * @param {!number} deltaTime
       * @param {Trex.status} status Optional status to switch to.
       */
      update: function (deltaTime, opt_status) {
        this.timer += deltaTime;
        // Update the status.
        if (opt_status) {
          this.status = opt_status;
          this.currentFrame = 0;
          this.msPerFrame = Trex.animFrames[opt_status].msPerFrame;
          this.currentAnimFrames = Trex.animFrames[opt_status].frames;

          if (opt_status == Trex.status.WAITING) {
            this.animStartTime = performance.now();
            this.setBlinkDelay();
          }
        }
        // Game intro animation, T-rex moves in from the left.
        if (this.playingIntro && this.xPos < this.config.START_X_POS) {
          this.xPos += Math.round((this.config.START_X_POS /
            this.config.INTRO_DURATION) * deltaTime);
        }
        if (this.status == Trex.status.WAITING) {
          this.blink(performance.now());
        } else {
          this.draw(this.currentAnimFrames[this.currentFrame], 0);
        }
        // Update the frame position.
        if (this.timer >= this.msPerFrame) {
          this.currentFrame = this.currentFrame ==
            this.currentAnimFrames.length - 1 ? 0 : this.currentFrame + 1;
          this.timer = 0;
        }
      },

      /**
       * Draw the t-rex to a particular position.
       * @param {number} x
       * @param {number} y
       */
      draw: function (x, y) {
        var sourceX = x;
        var sourceY = y;
        var sourceWidth = this.config.WIDTH;
        var sourceHeight = this.config.HEIGHT;
        if (IS_HIDPI) {
          sourceX *= 2;
          sourceY *= 2;
          sourceWidth *= 2;
          sourceHeight *= 2;
        }
        this.canvasCtx.drawImage(this.image, sourceX, sourceY,
          sourceWidth, sourceHeight,
          this.xPos, this.yPos,
          this.config.WIDTH, this.config.HEIGHT);
      },
      /**
       * Sets a random time for the blink to happen.
       */
      setBlinkDelay: function () {
        this.blinkDelay = Math.ceil(Math.random() * Trex.BLINK_TIMING);
      },

      /**
       * Make t-rex blink at random intervals.
       * @param {number} time Current time in milliseconds.
       */
      blink: function (time) {
        var deltaTime = time - this.animStartTime;
        if (deltaTime >= this.blinkDelay) {
          this.draw(this.currentAnimFrames[this.currentFrame], 0);
          if (this.currentFrame == 1) {
            // Set new random delay to blink.
            this.setBlinkDelay();
            this.animStartTime = time;
          }
        }
      },
      /**
       * Initialise a jump.
       */
      startJump: function () {
        if (!this.jumping) {
          this.update(0, Trex.status.JUMPING);
          this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY;
          this.jumping = true;
          this.reachedMinHeight = false;
          this.speedDrop = false;
        }
      },

      /**
       * Jump is complete, falling down.
       */
      endJump: function () {
        if (this.reachedMinHeight &&
          this.jumpVelocity < this.config.DROP_VELOCITY) {
          this.jumpVelocity = this.config.DROP_VELOCITY;
        }
      },
      /**
       * Update frame for a jump.
       * @param {number} deltaTime
       */
      updateJump: function (deltaTime) {
        var msPerFrame = Trex.animFrames[this.status].msPerFrame;
        var framesElapsed = deltaTime / msPerFrame;
        // Speed drop makes Trex fall faster.
        if (this.speedDrop) {
          this.yPos += Math.round(this.jumpVelocity *
            this.config.SPEED_DROP_COEFFICIENT * framesElapsed);
        } else {
          this.yPos += Math.round(this.jumpVelocity * framesElapsed);
        }
        this.jumpVelocity += this.config.GRAVITY * framesElapsed;

        // Minimum height has been reached.
        if (this.yPos < this.minJumpHeight || this.speedDrop) {
          this.reachedMinHeight = true;
        }
        // Reached max height
        if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
          this.endJump();
        }
        // Back down at ground level. Jump completed.
        if (this.yPos > this.groundYPos) {
          this.reset();
          this.jumpCount++;
        }
        this.update(deltaTime);
      },

      /**
       * Set the speed drop. Immediately cancels the current jump.
       */
      setSpeedDrop: function () {
        this.speedDrop = true;
        this.jumpVelocity = 1;
      },
      /**
       * Reset the t-rex to running at start of game.
       */
      reset: function () {
        this.yPos = this.groundYPos;
        this.jumpVelocity = 0;
        this.jumping = false;
        this.update(0, Trex.status.RUNNING);
        this.midair = false;
        this.speedDrop = false;
        this.jumpCount = 0;
      }
    };

    /* --------- fim config dino ---------- */

    // configura e controla a distância percorrida no jogo
    function DistanceMeter(canvas, spriteSheet, canvasWidth) {
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      this.image = spriteSheet;
      this.x = 0;
      this.y = 5;
      this.currentDistance = 0;
      this.maxScore = 0;
      this.highScore = 0;
      this.container = null;
      this.digits = [];
      this.acheivement = false;
      this.defaultString = '';
      this.flashTimer = 0;
      this.flashIterations = 0;
      this.config = DistanceMeter.config;
      this.init(canvasWidth);
    };

    DistanceMeter.dimensions = {
      WIDTH: 10,
      HEIGHT: 13,
      DEST_WIDTH: 11
    };

    DistanceMeter.yPos = [0, 13, 27, 40, 53, 67, 80, 93, 107, 120];

    DistanceMeter.config = {
      // Number of digits.
      MAX_DISTANCE_UNITS: 5,
      // Distance that causes achievement animation.
      ACHIEVEMENT_DISTANCE: 100,
      // Used for conversion from pixel distance to a scaled unit.
      COEFFICIENT: 0.025,

      // Flash duration in milliseconds.
      FLASH_DURATION: 1000 / 4,
      // Flash iterations for achievement animation.
      FLASH_ITERATIONS: 3
    };

    DistanceMeter.prototype = {
      /**
       * Initialise the distance meter to '00000'.
       * @param {number} width Canvas width in px.
       */
      init: function (width) {
        var maxDistanceStr = '';

        this.calcXPos(width);
        this.maxScore = this.config.MAX_DISTANCE_UNITS;
        for (var i = 0; i < this.config.MAX_DISTANCE_UNITS; i++) {
          this.draw(i, 0);
          this.defaultString += '0';
          maxDistanceStr += '9';
        }
        this.maxScore = parseInt(maxDistanceStr);
      },
      /**
       * Calculate the xPos in the canvas.
       * @param {number} canvasWidth
       */
      calcXPos: function (canvasWidth) {
        this.x = canvasWidth - (DistanceMeter.dimensions.DEST_WIDTH *
          (this.config.MAX_DISTANCE_UNITS + 1));
      },
      /**
       * Draw a digit to canvas.
       * @param {number} digitPos Position of the digit.
       * @param {number} value Digit value 0-9.
       * @param {boolean} opt_highScore Whether drawing the high score.
       */
      draw: function (digitPos, value, opt_highScore) {
        var sourceWidth = DistanceMeter.dimensions.WIDTH;
        var sourceHeight = DistanceMeter.dimensions.HEIGHT;
        var sourceX = DistanceMeter.dimensions.WIDTH * value;

        var targetX = digitPos * DistanceMeter.dimensions.DEST_WIDTH;
        var targetY = this.y;
        var targetWidth = DistanceMeter.dimensions.WIDTH;
        var targetHeight = DistanceMeter.dimensions.HEIGHT;
        // For high DPI we 2x source values.
        if (IS_HIDPI) {
          sourceWidth *= 2;
          sourceHeight *= 2;
          sourceX *= 2;
        }
        this.canvasCtx.save();
        if (opt_highScore) {
          // Left of the current score.
          var highScoreX = this.x - (this.config.MAX_DISTANCE_UNITS * 2) *
            DistanceMeter.dimensions.WIDTH;
          this.canvasCtx.translate(highScoreX, this.y);
        } else {
          this.canvasCtx.translate(this.x, this.y);
        }

        this.canvasCtx.drawImage(this.image, sourceX, 0,
          sourceWidth, sourceHeight,
          targetX, targetY,
          targetWidth, targetHeight
        );
        this.canvasCtx.restore();
      },
      /**
       * Covert pixel distance to a 'real' distance.
       * @param {number} distance Pixel distance ran.
       * @return {number} The 'real' distance ran.
       */
      getActualDistance: function (distance) {
        return distance ?
          Math.round(distance * this.config.COEFFICIENT) : 0;
      },
      /**
       * Update the distance meter.
       * @param {number} deltaTime
       * @param {number} distance
       * @return {boolean} Whether the acheivement sound fx should be played.
       */
      update: function (deltaTime, distance) {
        var paint = true;
        var playSound = false;

        if (!this.acheivement) {
          distance = this.getActualDistance(distance);
          if (distance > 0) {
            // Acheivement unlocked
            if (distance % this.config.ACHIEVEMENT_DISTANCE == 0) {
              // Flash score and play sound.
              this.acheivement = true;
              this.flashTimer = 0;
              playSound = true;
            }
            // Create a string representation of the distance with leading 0.
            var distanceStr = (this.defaultString +
              distance).substr(-this.config.MAX_DISTANCE_UNITS);
            this.digits = distanceStr.split('');
          } else {
            this.digits = this.defaultString.split('');
          }
        } else {
          // Control flashing of the score on reaching acheivement.
          if (this.flashIterations <= this.config.FLASH_ITERATIONS) {
            this.flashTimer += deltaTime;
            if (this.flashTimer < this.config.FLASH_DURATION) {
              paint = false;
            } else if (this.flashTimer >
              this.config.FLASH_DURATION * 2) {
              this.flashTimer = 0;
              this.flashIterations++;
            }
          } else {
            this.acheivement = false;
            this.flashIterations = 0;
            this.flashTimer = 0;
          }
        }

        // Draw the digits if not flashing.
        if (paint) {
          for (var i = this.digits.length - 1; i >= 0; i--) {
            this.draw(i, parseInt(this.digits[i]));
          }
        }
        this.drawHighScore();
        return playSound;
      },
      /**
       * Draw the high score.
       */
      drawHighScore: function () {
        this.canvasCtx.save();
        this.canvasCtx.globalAlpha = .8;
        for (var i = this.highScore.length - 1; i >= 0; i--) {
          this.draw(i, parseInt(this.highScore[i], 10), true);
        }
        this.canvasCtx.restore();
      },

      /**
       * Set the highscore as a array string.
       * Position of char in the sprite: H - 10, I - 11.
       * @param {number} distance Distance ran in pixels.
       */
      setHighScore: function (distance) {
        distance = this.getActualDistance(distance);
        var highScoreStr = (this.defaultString +
          distance).substr(-this.config.MAX_DISTANCE_UNITS);
        this.highScore = ['10', '11', ''].concat(highScoreStr.split(''));
      },
      /**
       * Reset the distance meter back to '00000'.
       */
      reset: function () {
        this.update(0);
        this.acheivement = false;
      }
    };

    /* --------- fim config Distancia ---------- */


    // configura as nuvens
    function Cloud(canvas, cloudImg, containerWidth) {
      this.canvas = canvas;
      this.canvasCtx = this.canvas.getContext('2d');
      this.image = cloudImg;
      this.containerWidth = containerWidth;
      this.xPos = containerWidth;
      this.yPos = 0;
      this.remove = false;
      this.cloudGap = getRandomNum(Cloud.config.MIN_CLOUD_GAP,
        Cloud.config.MAX_CLOUD_GAP);
      this.init();
    };

    Cloud.config = {
      HEIGHT: 13,
      MAX_CLOUD_GAP: 400,
      MAX_SKY_LEVEL: 30,
      MIN_CLOUD_GAP: 100,
      MIN_SKY_LEVEL: 71,
      WIDTH: 46
    };

    Cloud.prototype = {
      /**
       * Initialise the cloud. Sets the Cloud height.
       */
      init: function () {
        this.yPos = getRandomNum(Cloud.config.MAX_SKY_LEVEL,
          Cloud.config.MIN_SKY_LEVEL);
        this.draw();
      },
      /**
       * Draw the cloud.
       */
      draw: function () {
        this.canvasCtx.save();

        var sourceWidth = this.image.width; // Largura original da imagem
        var sourceHeight = this.image.height; // Altura original da imagem

        if (IS_HIDPI) {
          sourceWidth *= 2;
          sourceHeight *= 2;
        }

        // Desenha a imagem no tamanho original
        this.canvasCtx.drawImage(
          this.image,
          0, 0, // Posição inicial da imagem original
          sourceWidth, sourceHeight, // Dimensões originais da imagem
          this.xPos, this.yPos, // Posição no canvas
          sourceWidth, sourceHeight // Mantendo o tamanho original
        );

        this.canvasCtx.restore();
      },

      /**
       * Update the cloud position.
       * @param {number} speed
       */
      update: function (speed) {
        if (!this.remove) {
          this.xPos -= Math.ceil(speed);
          this.draw();

          // Mark as removeable if no longer in the canvas.
          if (!this.isVisible()) {
            this.remove = true;
          }
        }
      },
      /**
       * Check if the cloud is visible on the stage.
       * @return {boolean}
       */
      isVisible: function () {
        return this.xPos + Cloud.config.WIDTH > 0;
      }
    };

    /* --------- fim config nuvens ---------- */

    // configura repetição de cenario
    function HorizonLine(canvas, bgImg) {
      this.image = bgImg;
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      this.sourceDimensions = {};
      this.dimensions = HorizonLine.dimensions;
      this.sourceXPos = [0, this.dimensions.WIDTH];
      this.xPos = [];
      this.yPos = 0;
      this.bumpThreshold = 0.5;
      this.setSourceDimensions();
      this.draw();
    };

    HorizonLine.dimensions = {
      WIDTH: 600,
      HEIGHT: 12,
      YPOS: 127
    };

    HorizonLine.prototype = {
      /**
       * Set the source dimensions of the horizon line.
       */
      setSourceDimensions: function () {
        for (var dimension in HorizonLine.dimensions) {
          if (IS_HIDPI) {
            if (dimension != 'YPOS') {
              this.sourceDimensions[dimension] =
                HorizonLine.dimensions[dimension] * 2;
            }
          } else {
            this.sourceDimensions[dimension] =
              HorizonLine.dimensions[dimension];
          }
          this.dimensions[dimension] = HorizonLine.dimensions[dimension];
        }
        this.xPos = [0, HorizonLine.dimensions.WIDTH];
        this.yPos = HorizonLine.dimensions.YPOS;
      },

      /**
       * Return the crop x position of a type.
       */
      getRandomType: function () {
        return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
      },
      /**
       * Draw the horizon line.
       */
      draw: function () {
        this.canvasCtx.drawImage(this.image, this.sourceXPos[0], 0,
          this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT,
          this.xPos[0], this.yPos,
          this.dimensions.WIDTH, this.dimensions.HEIGHT);
        this.canvasCtx.drawImage(this.image, this.sourceXPos[1], 0,
          this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT,
          this.xPos[1], this.yPos,
          this.dimensions.WIDTH, this.dimensions.HEIGHT);
      },
      /**
       * Update the x position of an indivdual piece of the line.
       * @param {number} pos Line position.
       * @param {number} increment
       */
      updateXPos: function (pos, increment) {
        var line1 = pos;
        var line2 = pos == 0 ? 1 : 0;

        this.xPos[line1] -= increment;
        this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;
        if (this.xPos[line1] <= -this.dimensions.WIDTH) {
          this.xPos[line1] += this.dimensions.WIDTH * 2;
          this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH;
          this.sourceXPos[line1] = this.getRandomType();
        }
      },
      /**
       * Update the horizon line.
       * @param {number} deltaTime
       * @param {number} speed
       */
      update: function (deltaTime, speed) {
        var increment = Math.floor(speed * (FPS / 1000) * deltaTime);
        if (this.xPos[0] <= 0) {
          this.updateXPos(0, increment);
        } else {
          this.updateXPos(1, increment);
        }
        this.draw();
      },

      /**
       * Reset horizon to the starting position.
       */
      reset: function () {
        this.xPos[0] = 0;
        this.xPos[1] = HorizonLine.dimensions.WIDTH;
      }
    };

    /* --------- fim da repetição de cenario -------- */

    // gerencia os elementos do cenario do jogo
    function Horizon(canvas, images, dimensions, gapCoefficient) {
      this.canvas = canvas;
      this.canvasCtx = this.canvas.getContext('2d');
      this.config = Horizon.config;
      this.dimensions = dimensions;
      this.gapCoefficient = gapCoefficient;
      this.obstacles = [];
      this.horizonOffsets = [0, 0];
      this.cloudFrequency = this.config.CLOUD_FREQUENCY;

      // Cloud
      this.clouds = [];
      this.cloudImg = images.CLOUD;
      this.cloudSpeed = this.config.BG_CLOUD_SPEED;
      // Horizon
      this.horizonImg = images.HORIZON;
      this.horizonLine = null;
      // Obstacles
      this.obstacleImgs = {
        CACTUS_SMALL: images.CACTUS_SMALL,
        CACTUS_LARGE: images.CACTUS_LARGE
      };
      this.init();
    };

    Horizon.config = {
      BG_CLOUD_SPEED: 0.2,
      BUMPY_THRESHOLD: .3,
      CLOUD_FREQUENCY: .5,
      HORIZON_HEIGHT: 16,
      MAX_CLOUDS: 6
    };

    Horizon.prototype = {
      /**
       * Initialise the horizon. Just add the line and a cloud. No obstacles.
       */
      init: function () {
        this.addCloud();
        this.horizonLine = new HorizonLine(this.canvas, this.horizonImg);
      },

      /**
       * @param {number} deltaTime
       * @param {number} currentSpeed
       * @param {boolean} updateObstacles Used as an override to prevent
       *     the obstacles from being updated / added. This happens in the
       *     ease in section.
       */
      update: function (deltaTime, currentSpeed, updateObstacles) {
        this.runningTime += deltaTime;
        this.horizonLine.update(deltaTime, currentSpeed);
        this.updateClouds(deltaTime, currentSpeed);
        if (updateObstacles) {
          this.updateObstacles(deltaTime, currentSpeed);
        }
      },
      /**
       * Update the cloud positions.
       * @param {number} deltaTime
       * @param {number} currentSpeed
       */
      updateClouds: function (deltaTime, speed) {
        var cloudSpeed = this.cloudSpeed / 1000 * deltaTime * speed;
        var numClouds = this.clouds.length;
        if (numClouds) {
          for (var i = numClouds - 1; i >= 0; i--) {
            this.clouds[i].update(cloudSpeed);
          }

          var lastCloud = this.clouds[numClouds - 1];
          // Check for adding a new cloud.
          if (numClouds < this.config.MAX_CLOUDS &&
            (this.dimensions.WIDTH - lastCloud.xPos) > lastCloud.cloudGap &&
            this.cloudFrequency > Math.random()) {
            this.addCloud();
          }
          // Remove expired clouds.
          this.clouds = this.clouds.filter(function (obj) {
            return !obj.remove;
          });
        }
      },
      /**
       * Update the obstacle positions.
       * @param {number} deltaTime
       * @param {number} currentSpeed
       */
      updateObstacles: function (deltaTime, currentSpeed) {
        // Obstacles, move to Horizon layer.
        var updatedObstacles = this.obstacles.slice(0);

        for (var i = 0; i < this.obstacles.length; i++) {
          var obstacle = this.obstacles[i];
          obstacle.update(deltaTime, currentSpeed);
          // Clean up existing obstacles.
          if (obstacle.remove) {
            updatedObstacles.shift();
          }
        }
        this.obstacles = updatedObstacles;
        if (this.obstacles.length > 0) {
          var lastObstacle = this.obstacles[this.obstacles.length - 1];
          if (lastObstacle && !lastObstacle.followingObstacleCreated &&
            lastObstacle.isVisible() &&
            (lastObstacle.xPos + lastObstacle.width + lastObstacle.gap) <
            this.dimensions.WIDTH) {
            this.addNewObstacle(currentSpeed);
            lastObstacle.followingObstacleCreated = true;
          }
        } else {
          // Create new obstacles.
          this.addNewObstacle(currentSpeed);
        }
      },

      /**
       * Add a new obstacle.
       * @param {number} currentSpeed
       */
      addNewObstacle: function (currentSpeed) {
        var obstacleTypeIndex =
          getRandomNum(0, Obstacle.types.length - 1);
        var obstacleType = Obstacle.types[obstacleTypeIndex];
        var obstacleImg = this.obstacleImgs[obstacleType.type];
        this.obstacles.push(new Obstacle(this.canvasCtx, obstacleType,
          obstacleImg, this.dimensions, this.gapCoefficient, currentSpeed));
      },
      /**
       * Reset the horizon layer.
       * Remove existing obstacles and reposition the horizon line.
       */
      reset: function () {
        this.obstacles = [];
        this.horizonLine.reset();
      },
      /**
       * Update the canvas width and scaling.
       * @param {number} width Canvas width.
       * @param {number} height Canvas height.
       */
      resize: function (width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
      },

      /**
       * Add a new cloud to the horizon.
       */
      addCloud: function () {
        this.clouds.push(new Cloud(this.canvas, this.cloudImg,
          this.dimensions.WIDTH));
      }
    };

    // Inicializa o jogo
    const runner = new Runner('#main-frame-error');

    // Limpeza ao desmontar o componente
    return () => {
      window.removeEventListener(Runner.events.RESIZE, runner.debounceResize.bind(runner));
      runner.stopListening();
    };
  }, []);

  return (
    <>
      <div className="container">
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="main-frame-error" className="interstitial-wrapper" jstcache="0">
          <img className="icon icon-offline" jseval="updateIconClass(this.classList, iconClass)" jstcache="1" style={{ visibility: "hidden" }} />
        </div>
        <div id="offline-resources" jstcache="0">
          <div id="offline-resources-1x" jstcache="0">
            <img id="1x-obstacle-large" src="img/logo192.png" jstcache="0" />
            <img id="1x-obstacle-small" src="img/logo192.png" jstcache="0" />
            <img id="1x-cloud" src="img/nodecld.png" jstcache="0" />
            <img id="1x-text" src="img/1x-text.png" jstcache="0" />
            <img id="1x-horizon" src="img/1x-horizon.png" jstcache="0" />
            <img id="1x-trex" src="img/1x-trex.png" jstcache="0" />
            <img id="1x-restart" src="img/1x-restart.png" jstcache="0" />
          </div>
          <div id="offline-resources-2x" jstcache="0">
            <img id="2x-obstacle-large" src="img/logo192.png" jstcache="0" />
            <img id="2x-obstacle-small" src="img/logo192.png" jstcache="0" />
            <img id="2x-cloud" src="img/nodecld.png" jstcache="0" />
            <img id="2x-text" src="img/2x-text.png" jstcache="0" />
            <img id="2x-horizon" src="img/2x-horizon.png" jstcache="0" />
            <img id="2x-trex" src="img/2x-trex.png" jstcache="0" />
            <img id="2x-restart" src="img/2x-restart.png" jstcache="0" />
          </div>
        </div>
        <template id="audio-resources" jstcache="0">
          <audio id="offline-sound-press" src="data:audio/mpeg;base64,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"></audio>
          <audio id="offline-sound-hit" src="data:audio/mpeg;base64,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"></audio>
          <audio id="offline-sound-reached" src="data:audio/mpeg;base64,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"></audio>
        </template>
        <div id="options">
          <input type="checkbox" id="botStatus" />
          <span>Activate Bot?</span>
        </div>
        <div id="buttons">
          <h3>Pressione a Barra de espaço pra iniciar o jogo</h3>
        </div>
      </div>
    </>
  );
};