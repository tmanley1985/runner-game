import React from 'react';
import './App.css';
import arrowDown from './Assets/arrowDown.svg'
import arrowUp from './Assets/arrowUp.svg'
import arrowLeft from './Assets/arrowLeft.svg'
import arrowRight from './Assets/arrowRight.svg'
import { useState, useEffect } from 'react';

// https://www.colorbook.io/colorschemes/view/1625

const canvasStyle = {
  border: '1px solid black',
  background: '#FF0083'
}
const FPS = 30
const [ LEFT, UP, RIGHT, DOWN, ENTER ] = [37,38,39,40,13]

const [ CANVAS_WIDTH, CANVAS_HEIGHT ] = [400, 300]

const Controls = () => (
  <div className="controls">
    <div>Left: <img src={arrowLeft} className="controls--direction" alt="move left" /></div>
    <div>Right: <img src={arrowRight} className="controls--direction" alt="move right" /></div>
    <div>Jump: <img src={arrowUp} className="controls--direction" alt="jump" /></div>
    <div>Shrink: <img src={arrowDown} className="controls--direction" alt="shrink" /></div>
    <div>Power Jump: <img src={arrowDown} className="controls--direction" alt="power jump" /> then <img src={arrowUp} className="controls--direction" alt="logo" /></div>
  </div>
)
class Player {

  constructor() {
    this.initialY = 240
    this.x = 0
    this.y = this.initialY
    this.x_velocity = 0
    this.y_velocity = 0
    this.width = 40
    this.normalHeight = 60
    this.shrunkenHeight = 20
    this.height = this.normalHeight
    this.gravity = 7
    this.friction = 0.9
    this.time = 0
    this.currentDirections = []
  }
  
  move = directions => {
    this.currentDirections = directions
  
    if (this.currentDirections.includes('LEFT')) {
      this.x_velocity -= 2
    }
    if (this.currentDirections.includes('RIGHT')) {
      this.x_velocity += 2
    }

    if (this.currentDirections.includes('UP') && this.isBelowJumpMax() && !this.isJumping()) {
      this.y_velocity += 20
    }
    if (this.currentDirections.includes('DOWN') && this.height === this.normalHeight) {
      this.height = this.shrunkenHeight
      // We want to push to push the player down by the same number as we shrink it by.
      this.y+= this.shrunkenHeight
    }
  }

  // If they are on or below the ground, the can jump.
  canJump = () => this.y >= this.initialY;

  isJumping = () => !this.canJump()

  isBelowJumpMax = () => this.y > 200

  hasCollidedWith = entity => {
    // Canvas is bottom down, the top left corner starts at 0,0.
    // So the y axis is inverted. Down is more, Up is less.
    // TODO convert these to accessor methods and possibly put into an entity class.
    const playerRightEdge  = Math.trunc(this.x + this.width)
    const playerLeftEdge   = Math.trunc(this.x)
    const playerBottomEdge = Math.trunc(this.y + this.height)
    const playerTopEdge    = Math.trunc(this.y)

    const entityRightEdge  = Math.trunc(entity.x + entity.width)
    const entityLeftEdge   = Math.trunc(entity.x)
    const entityBottomEdge = Math.trunc(entity.y + entity.height)
    const entityTopEdge    = Math.trunc(entity.y)
    // Let's get the collection of coordinates
    if (
      // If the right edge of player is equal to or greater than enemy's left edge.
       playerRightEdge >= entityLeftEdge
      && // AND the player's left edge has not passed the enemy's right edge.
       playerLeftEdge <= entityRightEdge
      && // Either the player is above them or below them
       (playerBottomEdge >= entityTopEdge && playerTopEdge <= entityBottomEdge)
    ) {
      return true
    }
    return false

  }

  draw = (ctx, directions) => {

    this.move(directions)
  
    const { gravity, friction, width, height} = this

    this.time++

    // If we're shrunken, we need to grow.
    // TODO I can refactor this later. Just trying to tinker.
    if (this.height < this.normalHeight) {
      this.height+=2
    }

    if (this.isJumping()) {
      this.y += gravity
    }

    // Let's not stray beyond the left edge of the screen.
    if (this.x < 0) {
      this.x = 0
    }
    // Let's not stray beyond the right edge of the screen.
    if (this.x > CANVAS_WIDTH - this.width) {
      this.x = CANVAS_WIDTH - this.width
    }

    this.x += this.x_velocity
    this.y -= this.y_velocity


    // Friction
    this.x_velocity *= friction
    this.y_velocity *= friction
  
    ctx.fillStyle = '#00A'
    ctx.fillRect(this.x,this.y,width,height)
  }
}

class Enemy {
  constructor(type) {
    const [RUNNING] = Enemy.getEnemyTypes()
    this.type = type
    this.initialY = type === RUNNING ? 280 : 200
    // Let's put this enemy off screen.
    this.initialX = CANVAS_WIDTH + 40
    this.x = this.initialX
    this.y = this.initialY
    this.x_velocity = type === RUNNING ? 10 : 5
    this.y_velocity = 0
    this.width = 40
    this.height = 20
    this.friction = 0.9
    this.time = 0
  }

  static getEnemyTypes = () => ['RUNNING', 'FLYING']

  draw = ctx => {

    const { friction, width, height } = this

    const [ RUNNING, FLYING ] = Enemy.getEnemyTypes()

    // Let's not stray beyond the boundary.
    if (this.x < 0) {
      this.x = this.initialX
    }

    if (this.type === FLYING) {
      this.x -= this.x_velocity + 5
      this.y = Math.trunc(Math.sin(this.time) * 20) + this.initialY
      this.time = this.time + 100
    }

    if (this.type === RUNNING) {
      this.x -= this.x_velocity + 10
      this.y -= this.y_velocity
    }

    // Friction
    this.x_velocity *= friction
    this.y_velocity *= friction
  
    if (this.type === FLYING) {
      ctx.fillStyle = '#FED650'
    }
    if (this.type === RUNNING) {
      ctx.fillStyle = '#CC0010'
    }
    ctx.fillRect(this.x,this.y,width,height)
  }
}


function App() {

  const [RUNNING, FLYING] = Enemy.getEnemyTypes()
  const [player] = useState(new Player())
  const [[runningEnemy, flyingEnemy]] = useState([new Enemy(RUNNING), new Enemy(FLYING)])
  const [gameOver, setGameOver] = useState(false)
  // const [gameLoop, setGameLoop] = useState(null)

  useEffect(
    () => {
      const canvas = document.getElementById("myCanvas");
      const ctx = canvas.getContext("2d");
  
      // We want to be able to have multiple keys pressed at once so we have to use a cache here.
      let directionsCache = []

      var interval = setInterval(() => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        player.draw(ctx, directionsCache)
        runningEnemy.draw(ctx)
        flyingEnemy.draw(ctx)
        if (player.hasCollidedWith(runningEnemy) || player.hasCollidedWith(flyingEnemy)) {
          clearInterval(interval)
          setGameOver(() => true)
        }
      }, FPS)
  
      document.addEventListener('keydown', e => {
        e.preventDefault()

        // Move Left
        if (e.keyCode === LEFT && !directionsCache.includes('LEFT')) {
          directionsCache = [...directionsCache, 'LEFT'].filter(direction => direction !== 'RIGHT')
        }
        // Move Right
        if (e.keyCode === RIGHT && !directionsCache.includes('RIGHT')) {
          directionsCache = [...directionsCache, 'RIGHT'].filter(direction => direction !== 'LEFT')
        }
        // Jump
        if (e.keyCode === UP && !directionsCache.includes('UP')) {
          directionsCache = [...directionsCache, 'UP']
        }
        // Shrink
        if (e.keyCode === DOWN && !directionsCache.includes('DOWN')) {
          directionsCache = [...directionsCache, 'DOWN']
        }
      })

      // When keys are let go we don't want them moving in that direction anymore.
      document.addEventListener('keyup', e => {
        e.preventDefault()

        if (e.keyCode === LEFT) {
          directionsCache = directionsCache.filter(direction => direction !== 'LEFT')
        }
        if (e.keyCode === RIGHT) {
          directionsCache = directionsCache.filter(direction => direction !== 'RIGHT')
        }
        if (e.keyCode === UP) {
          directionsCache = directionsCache.filter(direction => direction !== 'UP')
        }
        if (e.keyCode === DOWN) {
          directionsCache = directionsCache.filter(direction => direction !== 'DOWN')
        }
        if (e.keyCode === ENTER) {
          window.location.reload()
        }
      })
    }, [player, runningEnemy, flyingEnemy] // https://reactjs.org/docs/hooks-reference.html#conditionally-firing-an-effect
  )

  return (
    <div className="App">
      { !gameOver && (
        <div>
          <canvas style={canvasStyle} id="myCanvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>
          <Controls />
        </div>
      )}
      { gameOver && (
        <div>
          <h2>Game Over</h2>
          <h3>Press Enter To Challenge Again!</h3>
        </div>
      )
      }
    </div>
  );
}

export default App;
