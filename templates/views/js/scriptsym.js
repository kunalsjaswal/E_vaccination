showmore = document.getElementById("showmore");
expand = document.getElementById("expand");
count = 0
function expand_fnx() {
    if (count == 0) {
        showmore.style.display = "grid";
        expand.style.marginTop = "58%";
        // expand3.style.marginTop="70%";
        expand.textContent = "Show Less";
        count = 1;
    }
    else {
        showmore.style.display = "none";
        expand.style.marginTop = "30%"
        // expand3.style.marginTop="42%";
        expand.textContent = "Show More";
        count = 0
    }
}
