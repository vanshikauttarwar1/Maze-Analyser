// document.addEventListener('DOMContentLoaded', () => {
//     const canvas = document.getElementById('mazeCanvas');
//     const ctx = canvas.getContext('2d');
//     const generateBtn = document.getElementById('generateBtn');
//     const eraseBtn = document.getElementById('eraseBtn');
//     const doneBtn = document.getElementById('doneBtn');
//     const feedbackText = document.getElementById('feedbackText');
//     const playAgainBtn = document.getElementById('playAgainBtn');
//     const loader = document.getElementById('loader');

//     let drawing = false;
//     let baseMazeImage = null;

//     // --- Drawing Logic ---
//     function getMousePos(canvas, evt) {
//         const rect = canvas.getBoundingClientRect();
//         return {
//             x: evt.clientX - rect.left,
//             y: evt.clientY - rect.top
//         };
//     }

//     function startDrawing(e) {
//         drawing = true;
//         draw(e);
//     }

//     function stopDrawing() {
//         drawing = false;
//         ctx.beginPath();
//     }

//     function draw(e) {
//         if (!drawing) return;
//         e.preventDefault();
//         const pos = getMousePos(canvas, e.touches ? e.touches : e);
//         ctx.lineWidth = 10;
//         ctx.lineCap = 'round';
//         ctx.strokeStyle = '#0000FF';
//         ctx.lineTo(pos.x, pos.y);
//         ctx.stroke();
//         ctx.beginPath();
//         ctx.moveTo(pos.x, pos.y);
//     }

//     // --- Button Event Listeners ---
//     generateBtn.addEventListener('click', generateNewMaze);
//     eraseBtn.addEventListener('click', eraseDrawing);
//     doneBtn.addEventListener('click', evaluatePlayerPath);
//     playAgainBtn.addEventListener('click', () => {
//         playAgainBtn.style.display = 'none';
//         feedbackText.textContent = '';
//         generateNewMaze();
//     });

//     // --- Canvas Event Listeners ---
//     canvas.addEventListener('mousedown', startDrawing);
//     canvas.addEventListener('mouseup', stopDrawing);
//     canvas.addEventListener('mousemove', draw);
//     canvas.addEventListener('touchstart', startDrawing);
//     canvas.addEventListener('touchend', stopDrawing);
//     canvas.addEventListener('touchmove', draw);

//     // --- Game Logic Functions ---
//     async function generateNewMaze() {
//         loader.style.display = 'block';
//         feedbackText.textContent = 'Loading a new maze...';
//         try {
//             const response = await fetch('/generate-maze', { method: 'POST' });
//             if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//             const data = await response.json();
//             if (data.error) throw new Error(data.error);

//             baseMazeImage = new Image();
//             baseMazeImage.src = data.image_data_url;
//             baseMazeImage.onload = () => {
//                 ctx.clearRect(0, 0, canvas.width, canvas.height);
//                 ctx.drawImage(baseMazeImage, 0, 0, canvas.width, canvas.height);
//                 loader.style.display = 'none';
//                 feedbackText.textContent = 'Draw a path from Start to Home!';
//             };
//         } catch (error) {
//             console.error('Error generating maze:', error);
//             feedbackText.textContent = `Failed to load maze: ${error.message}`;
//             loader.style.display = 'none';
//         }
//     }

//     function eraseDrawing() {
//         if (baseMazeImage) {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(baseMazeImage, 0, 0, canvas.width, canvas.height);
//         }
//     }

//     async function evaluatePlayerPath() {
//         if (!baseMazeImage) {
//             feedbackText.textContent = 'Please generate a maze first!';
//             return;
//         }
//         loader.style.display = 'block';
//         feedbackText.textContent = 'AI is checking your path...';

//         const userPathImage = canvas.toDataURL('image/png');

//         try {
//             const response = await fetch('/evaluate-path', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     base_maze_image: baseMazeImage.src,
//                     user_path_image: userPathImage
//                 })
//             });

//             if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
//             // --- FIX: Simplified to a single .json() call ---
//             // The server now guarantees a perfectly formatted JSON object.
//             const result = await response.json();
//             // --- END OF FIX ---

//             handleGameResult(result);

//         } catch (error) {
//             console.error('Error evaluating path:', error);
//             // Updated error message for the UI
//             feedbackText.textContent = 'AI could not check your path. Try again!';
//         } finally {
//             loader.style.display = 'none';
//         }
//     }

//     function handleGameResult(result) {
//         if (result.result === 'win') {
//             feedbackText.innerHTML = 'Congratulations, You Win!';
//             confetti({ particleCount: 150, spread: 180, origin: { y: 0.6 } });
//         } else {
//             let reason = "Unfortunately, You Lose. Better luck next time! 😊";
//             if (result.reason === 'not_shortest') {
//                 reason = "Good try, but that's not the shortest path! 😊";
//             } else if (result.reason === 'invalid_path') {
//                 reason = "Oops! You can't go through walls. 😊";
//             }
//             feedbackText.innerHTML = reason;

//             if (result.correct_path) {
//                 drawCorrectPath(result.correct_path);
//             }
//         }
//         playAgainBtn.style.display = 'block';
//     }

//     function drawCorrectPath(path) {
//         ctx.strokeStyle = 'red';
//         ctx.lineWidth = 8;
//         ctx.beginPath();
//         ctx.moveTo(path.x, path.y);
//         for (let i = 1; i < path.length; i++) {
//             ctx.lineTo(path[i].x, path[i].y);
//         }
//         ctx.stroke();
//     }

//     // Initial maze generation on page load
//     generateNewMaze();
// });


document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const generateBtn = document.getElementById('generateBtn');
    const eraseBtn = document.getElementById('eraseBtn');
    const doneBtn = document.getElementById('doneBtn');
    const feedbackText = document.getElementById('feedbackText');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const loader = document.getElementById('loader');

    let drawing = false;
    let baseMazeImage = null;

    // --- Drawing Logic ---
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        const clientX = evt.touches ? evt.touches.clientX : evt.clientX;
        const clientY = evt.touches ? evt.touches.clientY : evt.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function startDrawing(e) { drawing = true; draw(e); }
    function stopDrawing() { drawing = false; ctx.beginPath(); }

    function draw(e) {
        if (!drawing) return;
        e.preventDefault();
        const pos = getMousePos(canvas, e);
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0000FF';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    // --- Button Event Listeners ---
    generateBtn.addEventListener('click', generateNewMaze);
    eraseBtn.addEventListener('click', eraseDrawing);
    doneBtn.addEventListener('click', evaluatePlayerPath);
    playAgainBtn.addEventListener('click', () => {
        playAgainBtn.style.display = 'none';
        feedbackText.textContent = '';
        generateNewMaze();
    });

    // --- Canvas Event Listeners ---
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', draw);

    // --- Game Logic Functions ---
    async function generateNewMaze() {
        loader.style.display = 'block';
        feedbackText.textContent = 'Loading a new maze...';
        try {
            const response = await fetch('/generate-maze', { method: 'POST' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            baseMazeImage = new Image();
            baseMazeImage.src = data.image_data_url;
            baseMazeImage.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(baseMazeImage, 0, 0, canvas.width, canvas.height);
                loader.style.display = 'none';
                feedbackText.textContent = 'Draw a path to Home!';
            };
        } catch (error) {
            console.error('Error generating maze:', error);
            feedbackText.textContent = `Failed to load maze: ${error.message}`;
            loader.style.display = 'none';
        }
    }

    function eraseDrawing() {
        if (baseMazeImage) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(baseMazeImage, 0, 0, canvas.width, canvas.height);
        }
    }

    async function evaluatePlayerPath() {
        if (!baseMazeImage) {
            feedbackText.textContent = 'Please generate a maze first!';
            return;
        }
        loader.style.display = 'block';
        feedbackText.textContent = 'AI is checking your path...';
        const userPathImage = canvas.toDataURL('image/png');
        try {
            const response = await fetch('/evaluate-path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    base_maze_image: baseMazeImage.src,
                    user_path_image: userPathImage
                })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const resultText = await response.text();
            const result = JSON.parse(resultText);
            
            handleGameResult(result);

        } catch (error) {
            console.error('Error evaluating path:', error);
            feedbackText.textContent = 'AI could not check your path. Try again!';
        } finally {
            loader.style.display = 'none';
        }
    }

    function handleGameResult(result) {
        if (result.result === 'win') {
            feedbackText.innerHTML = 'Congratulations, You Win!';
            confetti({ particleCount: 150, spread: 180, origin: { y: 0.6 } });
        } else {
            let reason = "Unfortunately, You Lose. Better luck next time! 😊";
            if (result.reason === 'not_shortest') {
                reason = "Good try, but that's not the shortest path! 😊";
            } else if (result.reason === 'invalid_path') {
                reason = "Oops! You can't go through walls. 😊";
            }
            feedbackText.innerHTML = reason;

            // This block will now run whenever the user loses
            if (result.correct_path) {
                console.log("Drawing correct path received from AI:", result.correct_path);
                drawCorrectPath(result.correct_path);
            }
        }
        playAgainBtn.style.display = 'block';
    }

    // --- CORRECTED DRAWING FUNCTION ---
    function drawCorrectPath(path) {
        if (!path || path.length === 0) {
            console.error("Cannot draw an empty path.");
            return;
        }
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Correctly start at the first point in the array
        ctx.moveTo(path.x, path.y);
        // Loop through the rest of the points
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
    }
    // --- END OF CORRECTION ---

    // Initial maze generation on page load
    generateNewMaze();
});