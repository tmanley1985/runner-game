import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

const canvasStyle = {
  border: '1px solid black',
  background: '#FF0083'
}
const FPS = 30
const [ LEFT, UP, RIGHT, DOWN ] = [37,38,39,40]

const [ CANVAS_WIDTH, CANVAS_HEIGHT ] = [400, 300]

class Player {

  constructor() {
    this.initialY = 240
    this.x = 0
    this.y = this.initialY
    this.x_velocity = 0
    this.y_velocity = 0
    this.width = 40
    this.height = 60
    this.gravity = 7
    this.friction = 0.9
    this.currentDirections = []
  }
  
  move = directions => {
    this.currentDirections = directions
  
    if (this.currentDirections.includes('LEFT')) {
      console.log('got in here')
      this.x_velocity -= 2
    }
    if (this.currentDirections.includes('RIGHT')) {
      this.x_velocity += 2
    }

    if (this.currentDirections.includes('UP') && this.isBelowJumpMax() && !this.isJumping()) {
      this.y_velocity += 20
    }
  }

  // If they are on or below the ground, the can jump.
  canJump = () => this.y >= this.initialY;

  isJumping = () => !this.canJump()

  isBelowJumpMax = () => this.y > 200

  draw = (ctx, directions) => {

    this.move(directions)
  
    const { gravity, friction, width, height} = this

    if (this.isJumping()) {
      this.y += gravity
    }

    // Let's not stray beyond the boundary.
    if (this.x < 0) {
      this.x = 0
    }
    // Let's not stray beyond the boundary.
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
  constructor() {
    this.initialY = 280
    this.initialX = CANVAS_WIDTH + 40
    this.x = this.initialX
    this.y = this.initialY
    this.x_velocity = 10
    this.y_velocity = 0
    this.width = 40
    this.height = 20
    this.friction = 0.9
  }

  draw = ctx => {
    console.log(this.x)
    const { friction, width, height} = this

    // Let's not stray beyond the boundary.
    if (this.x < 0) {
      this.x = this.initialX
    }

    this.x -= this.x_velocity + 10
    this.y -= this.y_velocity


    // Friction
    this.x_velocity *= friction
    this.y_velocity *= friction
  
    ctx.fillStyle = '#00CCBC'
    ctx.fillRect(this.x,this.y,width,height)
  }
}

function App() {

  const [player] = useState(new Player())
  const [enemy] = useState(new Enemy())

  useEffect(
    () => {
      const canvas = document.getElementById("myCanvas");
      const ctx = canvas.getContext("2d");
  
      // We want to be able to have multiple keys pressed at once so we have to use a cache here.
      let directionsCache = []

      setInterval(() => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        player.draw(ctx, directionsCache)
        enemy.draw(ctx)
      }, FPS)

      document.addEventListener('keydown', e => {
        e.preventDefault()

        if (e.keyCode === LEFT && !directionsCache.includes('LEFT')) {
          directionsCache = [...directionsCache, 'LEFT'].filter(direction => direction !== 'RIGHT')
        }
        if (e.keyCode === RIGHT && !directionsCache.includes('RIGHT')) {
          directionsCache = [...directionsCache, 'RIGHT'].filter(direction => direction !== 'LEFT')
        }
        if (e.keyCode === UP && !directionsCache.includes('UP')) {
          directionsCache = [...directionsCache, 'UP']
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

      })
    }
  )

  return (
    <div className="App">
      <canvas style={canvasStyle} id="myCanvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>
    </div>
  );
}

export default App;
