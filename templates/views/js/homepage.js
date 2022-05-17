

// symptoms and precautions 
showmore = document.getElementById("showmore");
expand = document.getElementById("expand");
count = 0
function expand_fnx() {
    if (count == 0) {
        showmore.style.display = "grid";
        expand.style.marginTop = "58%"
        expand.textContent = "Show Less";
        count = 1;
    }
    else {
        showmore.style.display = "none";
        expand.style.marginTop = "14%"
        expand.textContent = "Show More";
        count = 0
    }
}

function expand_fnx2() {
    if (count == 0) {
        showmore.style.display = "grid";
        expand2.style.marginTop = "215%"
        expand2.textContent = "Show Less";
        count = 1;
    }
    else {
        showmore.style.display = "none";
        expand2.style.marginTop = "105%"
        expand2.textContent = "Show More";
        count = 0
    }
}

function expand_fnx3() {
    if (count == 0) {
        showmore.style.display = "grid";
        expand3.style.marginTop = "84%"
        expand3.textContent = "Show Less";
        count = 1;
    }
    else {
        showmore.style.display = "none";
        expand3.style.marginTop = "42%"
        expand3.textContent = "Show More";
        count = 0
    }
}