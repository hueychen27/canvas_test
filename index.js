// some code is from https://dev.to/javascriptacademy/create-a-drawing-app-using-javascript-and-canvas-2an1
const canvas = document.getElementById("test1");
const ctx = canvas.getContext("2d");
const thing = document.getElementById("tool");
const type = document.getElementById("type");
const powerEl = document.getElementById("power");
const thicknessEl = document.getElementById("thickness");
const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;
canvas.width = window.innerWidth - canvasOffsetX - 20;
canvas.height = window.innerHeight - canvasOffsetY - 25;
let isPainting = false;
let lineWidth = 5;
let startX;
let startY;
let power;
let thickness;
let pathsry = [];
let pathRedo = [];
let mouseover;
const changeThickness = () => {
    if (type.value != 'stretcher') {
        thicknessEl.value = eval(`thickness.${type.value}`)
    } else {
        thicknessEl.value = ""
    }
}
const changePower = () => {
    if (type.value == 'normal' || type.value == 'stretcher') {
        powerEl.value = "";
        return;
    }
    eval(`if (type.value != 'normal' && type.value != 'stretcher') powerEl.value = power.${type.value}; else powerEl.value = "";`);
}
const setColor = (color) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
}
setColor(document.getElementById("colour").value)
const reset = () => {
    power = {
        firework: 40,
        lightning: 20
    }
    thickness = {
        normal: 5,
        firework: 1,
        lightning: 5
    }
    changePower();
    changeThickness();
}
reset();
changePower();
changeThickness();
const clear = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
const popup = async (txt, icon, title, cbt, dbt) => {
    await Swal.fire({
        title: title,
        text: txt,
        icon: icon,
        confirmButtonText: cbt,
        showCancelButton: true,
        cancelButtonText: dbt
    }).then((result) => {
        if (result.isConfirmed) {
            clear();
        }
        Swal.fire({
            title: "little question...",
            text: "Do you want to display the Base64 png url?",
            icon: "info",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                load(true);
                return;
            }
        })
        load(false);
    })
}
const load = (base64) => {
    let dataURL = localStorage.getItem("thingy");
    pathsry.push(dataURL);
    console.log(dataURL)
    if (base64) {
        Swal.fire({
            title: "Base64 png image",
            text: `Base64: ${dataURL}`,
            icon: "info"
        })
    }
    let img = new Image;
    img.src = dataURL;
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
    };
    power = JSON.parse(localStorage.getItem("power"));
    thickness = JSON.parse(localStorage.getItem("thickness"));
    eval(`if (type.value != 'normal' || type.value != 'stretcher') powerEl.value = power.${type.value}; else powerEl.value = "";`);
    changeThickness();
}
thing.addEventListener('click', e => {
    if (e.target.id === 'reset') {
        reset();
    }
    if (e.target.id === 'save') {
        localStorage.setItem("thingy", canvas.toDataURL());
        localStorage.setItem("power", JSON.stringify(power));
        localStorage.setItem("thickness", JSON.stringify(thickness));
    }
    if (e.target.id === 'upload') {
        popup("Do you want to remove current drawing?", "info", "???", "yes", "noo1!!")
    }
    if (e.target.id === 'remove') {
        clear();
        pathsry.push(canvas.toDataURL());
    }
});
thing.addEventListener("change", e => {
    if (e.target.id === 'colour') {
        setColor(e.target.value)
    }
    if (e.target.id === 'type') {
        changePower();
        changeThickness();
    }
    if (e.target.id === 'power') {
        eval(`if (type.value != 'normal' || type.value != 'stretcher') power.${type.value} = e.target.value`)
    }
    if (e.target.id === 'thickness') {
        eval(`if (type.value != 'stretcher') thickness.${type.value} = e.target.value`)
    }
})
document.onkeydown = (e) => {
    if (e.key == "c") clear();
}
canvas.addEventListener('mousedown', (e) => {
    if (mouseover == false) return;
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isPainting = false;
    ctx.beginPath();
    pathsry.push(canvas.toDataURL());
});
canvas.addEventListener("mouseover", () => {
    mouseover = true;
})
canvas.addEventListener("mouseleave", () => {
    mouseover = false;
    isPainting = false;
    ctx.beginPath();
})
const draw = (e) => {
    // some code is from https://stackoverflow.com/a/16452675/15055490
    if (!isPainting && mouseover) return;
    pathRedo = [];
    if (document.getElementById("mode").value == "erase") {
        ctx.globalCompositeOperation = "destination-out";
    } else {
        ctx.globalCompositeOperation = "source-over";
    }
    eval(`ctx.lineWidth = thickness.${type.value}`);
    ctx.lineCap = 'round';
    if (type.value == "normal") {
        ctx.lineTo(e.offsetX - canvasOffsetX, e.offsetY);
        ctx.stroke();
    }
    if (type.value == "firework") {
        ctx.rect(e.clientX - canvasOffsetX, e.offsetY, eval(`thickness.${type.value}`), eval(`thickness.${type.value}`));

        for (let i = 20; i--;) {
            ctx.rect((e.offsetX - canvasOffsetX) + Math.random() * power.firework - (power.firework / 2),
                e.offsetY + Math.random() * power.firework - (power.firework / 2), eval(`thickness.${type.value}`), eval(`thickness.${type.value}`));
            ctx.fill();
        }
    }
    if (type.value == "lightning") {
        ctx.lineTo(e.offsetX - canvasOffsetX, e.offsetY);
        ctx.lineTo((e.offsetX - canvasOffsetX) + Math.random() * power.lightning - (power.lightning / 2),
            e.offsetY + Math.random() * power.lightning - (power.lightning / 2));
        ctx.stroke();
    }
    if (type.value == 'stretcher') {
        //ctx.arc code from https://stackoverflow.com/questions/25907163/html5-canvas-eraser-tool-without-overdraw-white-color
        ctx.arc(e.offsetX - canvasOffsetX, e.offsetY, 0, 0, Math.PI * 2, false);
        ctx.fill();
    }
}


canvas.addEventListener('mousemove', draw);

// Undo function https://stackoverflow.com/a/53961111/15055490
function drawPaths() {
    clear();
    let img = new Image();
    img.src = pathsry[pathsry.length - 1];
    img.onload = () => {
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(img, 0, 0);
        if (document.getElementById("mode").value == "erase") {
            ctx.globalCompositeOperation = "destination-out";
        } else {
            ctx.globalCompositeOperation = "source-over";
        }
    };
}

function Undo() {
    if (pathsry.length == 0) return;
    pathRedo.push(pathsry.pop());
    drawPaths();
}

function Redo() {
    if (pathRedo.length == 0) return;
    pathsry.push(pathRedo.pop());
    drawPaths();
}

document.getElementById("undo").addEventListener("click", Undo);
document.getElementById("redo").addEventListener("click", Redo);
document.onkeydown = (e) => {
    if (e.ctrlKey && e.key == "z") Undo();
    if (e.ctrlKey && e.key == "y") Redo();
}

// ctx.font = "30px Arial";
// ctx.fillText("Hello World", 10, 50);
// ctx.beginPath();
// ctx.moveTo(250, 250);
// ctx.lineTo(200, 300);
// ctx.lineTo(300, 200)
// ctx.stroke()
// ctx.fillRect(100, 100, 300, 69)