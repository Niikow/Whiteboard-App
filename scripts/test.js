var whiteboard = document.getElementById("whiteboard");
var context = whiteboard.getContext("2d");
var colourButton = document.getElementById("PencilColour");
var shapeButton = document.getElementById("SelectShape");

whiteboard.height = window.innerHeight;
whiteboard.width = window.innerWidth;

let pencilEnabled = true;
let shape = shapeButton.value;

window.onload = function() {

    // var x = 1;
    // if (x == 1) {
    //     pencilEnabled = false;
    // }

    // console.log(shape);

    // if (shape == "Line") {
    //     // pencilEnabled = true;
    //     console.log("Line");
    // }
    // if (shape == "Circle") {
    //     // pencilEnabled = false;
    //     console.log("Circle");
    // }
    


    // function changeShape() {
    //     let shape = shapeButton.value;
    //     console.log(shape);
    //     if (shape == "Circle") {
    //         pencilEnabled = false;
    //     }

    // }

    drawWithPencil();
    
    function changeColour() {
        var colour = colourButton.value;
        context.strokeStyle = colour;
    }

    colourButton.addEventListener('change', changeColour);
    shapeButton.addEventListener('change', () => {
        shape = shapeButton.value;
        drawChecker();
    });

    function drawChecker() {
        if (shape == "Line") {
            // pencilEnabled = true;
            // console.log(shape);
            window.addEventListener("load", drawWithPencil, true);
        }
        if (shape == "Circle") {
            pencilEnabled = false;
            console.log(shape);
        }
        if (shape == "Rectangle") {
            pencilEnabled = false;
            console.log(shape);
        }
    }
};

function drawWithPencil() {
    if (pencilEnabled) {
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
    }
};