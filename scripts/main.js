var whiteboard = document.getElementById("whiteboard");
var context = whiteboard.getContext("2d");
var colourButton = document.getElementById("PencilColour");
var shapeButton = document.getElementById("SelectShape");

whiteboard.height = window.innerHeight;
whiteboard.width = window.innerWidth;

window.onload = function() {

    function changeShape() {
        var shape = shapeButton.value;
        console.log(shape);
        if (shape == "Line") {
            drawWithPencil();
            // let x = true;
        }
        if (shape == "Circle") {
            drawWithCircle();            
        }
        // if (shape == "Rectangle") {

        // }
    }

    // drawWithPencil();

    function changeColour() {
        var colour = colourButton.value;
        context.strokeStyle = colour;
    }


    // Listener for drawing tools
    colourButton.addEventListener('change', changeColour);
    shapeButton.addEventListener('change', changeShape);
    
};

function drawWithCircle() {
    console.log("Draw circle ")
}

function drawWithPencil() {

    // Variables
    let pencil = false;
    var canvasX, canvasY;
        

    function startPosition(e) {
        pencil = true;

        // Draw dots
        draw(e);
    }

    function finishPosition() {
        pencil = false;

        // Reset path to draw new lines without connecting to old line
        context.beginPath();
    }

    // Draw on whiteboard
    function draw(e) {
        if(!pencil) return;
        context.linewidth = 10;
        context.lineCap = 'round';
        
        // Set mouse cursor pointer according to whiteboard
        canvasX = e.pageX - whiteboard.offsetLeft;
        canvasY = e.pageY - whiteboard.offsetTop;
        // context.lineTo(e.clientX, e.clientY);
        context.lineTo(canvasX, canvasY);
        context.stroke();
        context.beginPath();
        // context.moveTo(e.clientX, e.clientY);
        context.moveTo(canvasX, canvasY);

        //context.strokeStyle = "red"; - change colour of line
    }

    // Mouse listener for drawing
    whiteboard.addEventListener('mousedown', startPosition);
    whiteboard.addEventListener('mouseup', finishPosition);
    whiteboard.addEventListener('mousemove', draw);


    

    // changeSize();
};



// // Resize whiteboard application
// window.addEventListener('resize', changeSize);

// function changeSize() {
//     whiteboard.height = window.innerHeight;
//     whiteboard.width = window.innerWidth;
// }