function connecttoQBO(){
    var panel1 = document.getElementById("panel_1_id")
    var panel2 = document.getElementById("panel_2_id")
    panel2.style.removeProperty("display");
    let pos = 0;
    id = setInterval(frame, 15);
    function frame() {
        if (pos >= window.innerWidth) {
        clearInterval(id);
        } else {
        pos = pos + window.innerWidth/10; 
        panel1.style.left = -1 * pos + "px"; 
        panel2.style.left = window.innerWidth - pos + "px";
        }
    }
}
function synchronizeQuickbooks(){
    var panel2 = document.getElementById("panel_2_id")
    var panel3 = document.getElementById("panel_3_id")
    var check_bill = document.getElementById("check_bills_id")
    var check_vendor = document.getElementById("check_vendors_id")
    var check_gl = document.getElementById("check_gl_id")
    panel3.style.removeProperty("display");

    var progress_bill = document.getElementById("progress_bill_id")
    var progress_vendor = document.getElementById("progress_vendor_id")
    var progress_gl = document.getElementById("progress_gl_id")

    var progress_panel1 = document.getElementById("progress_panel1_id")
    var progress_panel2 = document.getElementById("progress_panel2_id")
    var progress_panel3 = document.getElementById("progress_panel3_id")

    if(!check_bill.checked)progress_panel1.style.display = "none"
    if(!check_vendor.checked)progress_panel2.style.display = "none"
    if(!check_gl.checked)progress_panel3.style.display = "none"

    let pos = 0;
    id = setInterval(frame, 15);
    function frame() {
        if (pos >= window.innerWidth) {
            clearInterval(id);
            var delayInMilliseconds = 200; //200 m second
            var count = 0;
            id1 = setInterval(function() {
                count ++;
                progress_bill.value = count*10
                progress_vendor.value = count*10
                progress_gl.value = count*10
                if(count == 10){
                    clearInterval(id1)
                    window.close();
                    window.opener.postMessage({msg:'ok',bill:check_bill.checked,vendor:check_vendor.checked,gl:check_gl.checked},'*')
                }
            }, delayInMilliseconds);
        } else {
            pos = pos + window.innerWidth/10; 
            panel2.style.left = -1 * pos + "px"; 
            panel3.style.left = window.innerWidth - pos + "px";
        }
    }
}