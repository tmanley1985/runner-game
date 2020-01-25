import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

const canvasStyle = {
  border: '1px solid black',
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
    this.gravity = 5
    this.friction = 0.9
  }
  
  move = direction => {
    if (direction === 'LEFT') {
      this.x_velocity -= 2
    }
    if (direction === 'RIGHT') {
      this.x_velocity += 2
    }

    if (direction === 'UP' && this.isBelowJumpMax() && !this.isJumping()) {
      this.y_velocity += 20
    }
  }

  // If they are on or below the ground, the can jump.
  canJump = () => this.y >= this.initialY;

  isJumping = () => !this.canJump()

  isBelowJumpMax = () => this.y > 200

  draw = ctx => {
    const { gravity, friction, width, height} = this

    if (this.isJumping()) {
      this.y += gravity
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

function App() {

  const [player, updatePlayer] = useState(new Player())

  useEffect(
    () => {
      const canvas = document.getElementById("myCanvas");
      const ctx = canvas.getContext("2d");
  
      setInterval(() => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        player.draw(ctx)
      }, FPS)

      document.addEventListener('keydown', e => {
        e.preventDefault()

        if (e.keyCode === LEFT) {
          player && player.move('LEFT')
        }
        if (e.keyCode === RIGHT) {
          player && player.move('RIGHT')
        }
        if (e.keyCode === UP) {
          player && player.move('UP')
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
