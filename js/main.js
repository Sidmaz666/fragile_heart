// Selecting Game Objects

const screen = document.querySelector("#screen")
const box = document.querySelector("#box")
const box_collider = document.querySelector("#box-collider")
const box_container = document.querySelector("#box-container")
const obstacles_container = document.querySelector("#obstacles-container")
const initial_screen = document.querySelector('#initial-screen')

// Getting Audio Elements
const background_music = document.querySelector('#background-music')
// Setting Default Background Volume
background_music.volume = 0.2
const gameend_music = document.querySelector('#gameend-music')
const hurt_music = document.querySelector('#hurt-music')
const life_music = document.querySelector('#life-music')
const slide_music = document.querySelector('#slide-music')
// Get The Screen Width
const screen_width = screen.clientWidth

// Declaring Score & Life Variables
let score = 0
// Initial Life is 10
let life = 3

// Detect Key Press and Pass the key to the Key Handler Function
document.body.addEventListener("keydown",
  function( event ){
  const {key} = event	
  if(
    key == "ArrowLeft" ||
    key == "ArrowRight" 
  ){
	keyPressHandler(key.toLowerCase().toString().trim())
  }
})

// Trigger Keyboard Event On Button Click
function triggerKBEvent(key){
let newEvent = new Event('keydown')
newEvent.key=key
document.body.dispatchEvent(newEvent)
}

// Handle KeyPresses Move the Box Function

let initialPos = 0
let speedFactor = 40
// minimum & maximum limit of movement
let minWidth = 215
let maxWidth = -215
// Change Movement Parameters For small screens
if(screen_width == 360){
  minWidth = 150
  maxWidth = -150
}

function keyPressHandler(key){
  	switch (key) {
		case 'arrowleft':
	    	// Only Decrement When x is greater than -215
		if(initialPos*speedFactor > maxWidth){
		initialPos--
		}
		translateBoxPosition(box,`${initialPos * speedFactor}px`)
		break;
		case 'arrowright':
	    	// Only Increment When x is smaller than 215
		if(initialPos*speedFactor < minWidth){
		initialPos++
		}
		translateBoxPosition(box,`${initialPos * speedFactor}px`)
		break;
		default:
		break;
	}
}


// Translate Box Position
function translateBoxPosition(element,position){
  const position_raw = Number(position.toString().replace('px',''))
  if(position_raw < minWidth && position_raw > maxWidth){
    // Only Move The Box When Obstacles Are Ready
    if(isPause == false){
    element.style.transform = `translateX(${position})`
    // Play Box Slide Music
    slide_music.play()
    }
  }
}

// Random Colors Function
function randomColor(){
    	const colors = [
	  {color:"#C6FF00", tag: "yellow"},
	  {color:"#1B5E20", tag: "green"},
	  {color:"#FF6D00", tag: "orange"},
	  {color:"#C62828", tag: "red"}
	]	
	const randomNumber = Math.floor(Math.random() * colors.length)
	return colors[randomNumber]
}



// Generate Obstacles Function
function createObstacles(){
  let maxObs_max_number = 10
  let maxObs_min_number = 7
  let maxR = 400
  let maxW = 400
  let maxRm = -120
  let maxWm = 200

// For Smaller Screen
if(screen_width == 360){
	maxR = 250
	maxW = 250
    	maxRm = -45
    	maxWm = 125
  	maxObs_max_number = 7
  	maxObs_min_number = 5
  }

  const maxObs = Math.floor(Math.random() * (maxObs_max_number - maxObs_min_number + 1)+maxObs_min_number)
  const id_list = []
  let trackTag
  for (var i = 1; i <= maxObs; i++) {
  const id = "ob-" + crypto.randomUUID().replaceAll('-','')
  id_list.push(id)
  const maxMargin = Math.floor(Math.random() * (50 - 30 + 1)+30)
  const maxRight = Math.floor(Math.random() * (maxR - (maxRm) + 1)+(maxRm))
  const maxWidth = Math.floor(Math.random() * (maxW - maxWm + 1)+maxWm)
  const rightOrLeft = Math.random() >= 0.5 ? 'right' : 'left'
  let randCol = randomColor()
  // Prevent Spawning Same Colors in Parallel
  while(trackTag == randCol.tag){
	randCol = randomColor()
  }
  trackTag = randCol.tag
  obstacles_container.insertAdjacentHTML("beforeend", `
      <div class="flex w-full m-[${maxMargin}px] ">
      <div
      id="${id}"
      data-tag=${randCol.tag}
      class="w-[${maxWidth}px] bg-[${randCol.color}] h-[10px]
	absolute ${rightOrLeft}-[${maxRight}px] rounded-full">
      </div>
      </div>
    `)
  }
  return id_list
}


// Scroll & generate obstacles function

function deleteObstacles(obs){
      const screen_position = screen.getBoundingClientRect()
      const obs_position = obs.getBoundingClientRect()
      if(screen_position.bottom <= obs_position.bottom){
	  obs.remove()
      }
}

// Control Pause|Play
let isPause = true
let scrollInterval
// Move/ReSpawn Obstacles
function moveObstacles(){
// Initial obstacle Creation
 let obs_ids = createObstacles()
    // Get the Obstacles
    let obstacles = []
    obs_ids.forEach((id) => {
        const select_obs = document.querySelector(`#${id}`)
        obstacles.push(select_obs)
    })

    // Reverse the Obstacles Array To get the last obstacle
    obstacles.reverse()

    // Increment Parameter
    let inc = 1
    let speed = 5

    // Translate Each Obstacles in Y Axis
     scrollInterval = setInterval(() => {
       if(!isPause){
	obstacles.forEach((obs,i) => {
		const obs_wrap = obs.parentElement
	  	obs_wrap.style.transform = `translateY(${inc*speed}px)`
	  	const boxPos = box_collider.getBoundingClientRect()
	  	const obsPos = obs.getBoundingClientRect()
	  	if(isCollide(boxPos, obsPos)){
		  // Check Tags
		  const tag = obs.dataset.tag
		  if(tag == "red"){
		    score -= 50
		    life -= 3
		    updateBar("redbar")
		    //Play Hurt Sound
		    hurt_music.play()
		  } else if(tag == "green"){
		    life++
		    updateBar("greenbar")
		    // Play Life Music
		    life_music.play()
		  } else if(tag=="orange"){
		    score -= 20
		    life -= 2
		    updateBar("orangebar")
		    //Play Hurt Sound
		    hurt_music.play()
		  } else {
		    score +=10
		    life--
		    updateBar("yellowbar")
		    //Play Hurt Sound
		    hurt_music.play()
		  }
		    // Hide it!
		    obs_wrap.remove()
		}
	  	// Avoid Providing >Negative Scores
	  	if(score < 0){
			score = 0
	  	}
		updateLifeScore()
	  	deleteObstacles(obs_wrap)
	})	
	
      inc++
      score++
     
      // Spawn New Obstacles 
      if(obstacles_container.childElementCount == 0){
		clearInterval(scrollInterval)
		moveObstacles()
      }
      // Play Background Music if Paused
	 if(background_music.paused == true){
	   background_music.play()
	 }

      // Stop the Game When Life is Zero
      if(life <= 0){
	clearInterval(scrollInterval)
	isPause = true
	endGame()
      }
     }
    },100)

}

// Detect Collision // Reference From StackOverflow
function isCollide(a, b) {
    return !(
        ((a.y + a.height) < (b.y)) ||
        (a.y > (b.y + b.height)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width))
    );
}

// Update Life and Score 
function updateLifeScore(){
	const select_lifeText = document.querySelector('#life-display')
	const select_scoreText = document.querySelector('#score-display')
  	select_scoreText.textContent = score
  	select_lifeText.textContent = life
}

// Start Game Function
function startGame(){
// Remove Play Button From DOM
initial_screen.firstChild.remove()
initial_screen.classList.toggle("hidden")
// Playing Background Music
background_music.play()
// Scroll To the Bottom of the Page
window.scroll(0 , document.body.scrollHeight);
//Waiting Three Seconds Before Starting the game
const playDelay = setTimeout(() => {
// Allowing the Game To Start
isPause = false
// Start Moving the Obstacles
moveObstacles()
// Clear the Timeout Event
clearTimeout(playDelay)
},3000)
}

function endGame(){
// Clear Obstacles
obstacles_container.innerHTML = ""
// Remove Previous History
initial_screen.innerHTML = ""
// Reset Bars
  Array.from(["yellowbar","greenbar","redbar","orangebar"]).forEach((bar) => {
    document.querySelector(`#${bar}`).style.width = "0px"
  })
// Pausing Background Music
background_music.pause()
// Playing Game Over Sound
gameend_music.play()
// Display 
initial_screen.classList.toggle("hidden")
initial_screen.insertAdjacentHTML("beforeend",`
    <div 
      class="absolute z-50 top-0 w-full h-full
      flex justify-center items-center flex-col
      bg-black/90 text-white 
       ">
	<i class="fa-solid fa-skull text-6xl animate-bounce"></i>
	<span class="p-2 mt-5 text-gray-200 font-bold text-4xl">
	 Game Over!
	</span>
	<span class="p-2 mt-5 text-gray-200 font-bold text-4xl">
	Score : ${score}
	</span>
	<button class="text-6xl text-gray-400 mt-5" 
	  onclick="startGame()"
	  >
	<i class="fa-solid fa-repeat"></i>
	</button>
	<span class="mt-5 font-thin text-gray-600">
		Developed By 
		<a href="https://github.com/sidmaz666">
		  Sidmaz666 <i class="fa-brands fa-github"></i>
		</a>
	</span>
	</div>
`)
// Reset
score = 0
life = 0
updateLifeScore()
// Give Back Life
life = 3
// Reset to Position
initialPos = 0
box.style.transform = `translateX(0px)`
}

function initializeGame(){
 // Add Play Button & Instructions on the Screen
initial_screen.insertAdjacentHTML("beforeend",`
    <div 
      class="absolute z-50 top-0 w-full h-full
      flex justify-center items-center flex-col
      bg-black/90 text-white 
       ">
	<button class="text-6xl text-gray-400 flex flex-col" 
	  onclick="startGame()"
	  >
	  <span class="text-sm mb-6 text-semibold"> Tap Here!</span>
	<i class="fa-sharp fa-box animate-bounce "></i>
	</button>
	<span class="p-2 mt-5 text-gray-200 font-bold text-center">
	Use Left & Right Arrow Keys  or Tap <br/> 
	on the Bottom Left & Right Side <br/>
	To Move the Box.<br/><br/>
	<span class="flex flex-col items-start justify-items-stretch">
	  <li><b class="text-orange-500">Orange</b> -2 Life and -20 Score</li>
	  <li><b class="text-yellow-500">Yellow</b> -1 Life and +20 Score</li>
	  <li><b class="text-green-500">Green</b> 1 Life and 0 Score</li>
	  <li><b class="text-red-500">Red</b> -3 Life and -50 Score</li>
	</span>
	</span>
	<span class="mt-3 font-thin text-gray-600">
		Developed By 
		<a href="https://github.com/sidmaz666">
		  Sidmaz666 <i class="fa-brands fa-github"></i>
		</a>
	</span>
	</div>
`)
}
// Increase Bar Width According to the Hit on the Obstacles
function updateBar(id){
  const select_bar = document.querySelector(`#${id}`)
  let current_width = Number(select_bar.style.width.replace('px',''))
  current_width++
  select_bar.style.width = `${current_width}px`
}
// Initialize Game
initializeGame()
