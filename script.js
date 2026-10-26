/* =====================================================
   DATA LAYER
   NOTE: This prototype persists data in the browser
   (localStorage) so the UI/UX can be fully exercised
   client-side. Every read/write goes through loadData()
   / saveData() below, so swapping this for real REST
   calls to a Java/Spring + PostgreSQL backend later only
   means changing this one layer, not the UI logic.
===================================================== */

const STORAGE_KEY = "ch_data_v2";
const API_BASE_URL = "http://localhost:5000/api";

function seedData(){

    const companies = {
        "c1":{id:"c1",name:"TCS",industry:"IT Services",hrName:"HR Team",phone:"044-1234567",website:"https://tcs.com"},
        "c2":{id:"c2",name:"Infosys",industry:"IT Services",hrName:"HR Team",phone:"080-1234567",website:"https://infosys.com"},
        "c3":{id:"c3",name:"Wipro",industry:"IT Services",hrName:"HR Team",phone:"040-1234567",website:"https://wipro.com"},
        "c4":{id:"c4",name:"Accenture",industry:"Consulting",hrName:"HR Team",phone:"044-9876543",website:"https://accenture.com"}
    };

    const students = {};

    const deptSeed = [
        ["CSE",120],["IT",70],["ECE",60],["EEE",40],["MECH",35]
    ];

    let n = 1;
    const firstNames = ["Arun","Priya","Narmatha","Vignesh","Divya","Karthik","Sneha","Ramesh","Anitha","Suresh","Kavya","Bala","Meena","Ajay","Deepa"];
    const lastInit = ["S","R","K","M","V","P"];

    deptSeed.forEach(([dept,count])=>{
        for(let i=0;i<count;i++){
            const batch = 2026 + (i%2); // mix of 2026 & 2027 to demonstrate batch filtering
            const regNo = "23"+dept+String(i+1).padStart(3,"0");
            const name = firstNames[i%firstNames.length]+" "+lastInit[i%lastInit.length]+".";
            const email = (regNo).toLowerCase()+"@campushire.edu";
            const cgpa = +(6.5 + Math.random()*3).toFixed(2);
            const backlogs = Math.random()<0.15 ? (Math.random()<0.5?1:2) : 0;
            const skillsPool = ["java","python","c","c++","sql","mysql","html","css","javascript","react","excel","communication"];
            const skills = [];
            const skillCount = 3+Math.floor(Math.random()*3);
            while(skills.length<skillCount){
                const sk = skillsPool[Math.floor(Math.random()*skillsPool.length)];
                if(!skills.includes(sk)) skills.push(sk);
            }
            students[email] = {
                email, password:"student123", name, regNo, dept, batch,
                cgpa, backlogs, tenth:+(70+Math.random()*25).toFixed(1), twelfth:+(65+Math.random()*25).toFixed(1),
                skills, phone:"9"+Math.floor(100000000+Math.random()*899999999),
                photo:"", resumeName:"", resumeData:"", createdAt:Date.now()
            };
            n++;
        }
    });

    // A convenient, well-known demo student for QA (kept, but credentials are NOT shown in the UI)
    students["narmatha@campushire.edu"] = {
        email:"narmatha@campushire.edu", password:"student123", name:"Salai Narmatha",
        regNo:"23CSE027", dept:"CSE", batch:2027, cgpa:8.38, backlogs:0,
        tenth:88, twelfth:84, skills:["java","c","python","html","css","javascript","mysql"],
        phone:"9999999999", photo:"", resumeName:"Resume_2026.pdf", resumeData:"", createdAt:Date.now()
    };

    const drives = [
        {id:"d1",companyId:"c1",title:"Graduate Software Engineer",package:"₹7 LPA",location:"Chennai",
         driveDate:"2026-10-10",regStart:"2026-09-15",regEnd:"2026-09-30",
         eligibility:{depts:["CSE","IT"],batch:2027,minCGPA:8.0,maxBacklogs:0,min10:60,min12:60,skills:["java","sql"]},
         rounds:["Aptitude","Technical Interview","HR Interview"],
         description:"Software development role in the flagship digital delivery unit."},
        {id:"d2",companyId:"c2",title:"Systems Engineer",package:"₹6.5 LPA",location:"Bangalore",
         driveDate:"2026-10-15",regStart:"2026-09-18",regEnd:"2026-10-02",
         eligibility:{depts:["CSE","IT","ECE"],batch:2027,minCGPA:7.5,maxBacklogs:0,min10:60,min12:60,skills:["java","python"]},
         rounds:["Aptitude","Technical Interview"],
         description:"Entry-level systems engineering role."},
        {id:"d3",companyId:"c3",title:"Project Engineer",package:"₹5.5 LPA",location:"Hyderabad",
         driveDate:"2026-10-05",regStart:"2026-09-10",regEnd:"2026-09-25",
         eligibility:{depts:[],batch:2027,minCGPA:7.0,maxBacklogs:1,min10:55,min12:55,skills:["c"]},
         rounds:["Aptitude","Technical Interview","HR Interview"],
         description:"Cross-department project engineering role."},
        {id:"d4",companyId:"c4",title:"Associate Software Engineer",package:"₹6.8 LPA",location:"Chennai",
         driveDate:"2026-09-28",regStart:"2026-09-05",regEnd:"2026-09-20",
         eligibility:{depts:["CSE","IT"],batch:2026,minCGPA:8.0,maxBacklogs:0,min10:65,min12:65,skills:["java","sql","python"]},
         rounds:["Aptitude","Technical Interview","HR Interview"],
         description:"Software engineering role for the 2026 batch."}
    ];

    return { students, companies, drives, applications:[], notifications:[] };
}

function loadData(){
    let raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){
        const seeded = seedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
    }
    try{ return JSON.parse(raw); }
    catch(e){
        const seeded = seedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
    }
}

function saveData(data){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function emailExists(data,email){
    return !!data.students[email] || email === "admin@campushire.edu";
}

function initials(name){
    if(!name) return "U";
    return name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
}

function val(id){
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

/* =====================================================
   ELIGIBILITY ENGINE
   (Runs client-side here only because this is a static
   prototype. In production this MUST be evaluated and
   enforced server-side — never trust the frontend.)
===================================================== */

function computeEligibility(s,d){
    if(!s || !d) return {eligible:false,checks:{},reasons:[],passes:[]};

    const e = d.eligibility;

    const deptPass = !e.depts || e.depts.length===0 || e.depts.includes(s.dept);
    const yearPass = s.batch === e.batch;
    const cgpaPass = s.cgpa >= e.minCGPA;
    const backlogPass = s.backlogs <= e.maxBacklogs;
    const tenthPass = (s.tenth||0) >= (e.min10||0);
    const twelfthPass = (s.twelfth||0) >= (e.min12||0);
    const matchedSkills = (e.skills||[]).filter(sk => (s.skills||[]).includes(sk));
    // Skill check passes if the student has AT LEAST ONE of the required skills.
    // If the drive requires no skills at all, this is automatically a pass.
    const skillPass = (e.skills||[]).length === 0 || matchedSkills.length > 0;

    const checks = {deptPass,yearPass,cgpaPass,backlogPass,tenthPass,twelfthPass,skillPass,matchedSkills};

    const eligible = deptPass && yearPass && cgpaPass && backlogPass && tenthPass && twelfthPass && skillPass;

    const reasons = [];
    const passes = [];

    if(!deptPass) reasons.push("Required department: "+(e.depts.join(" / "))+". Your department: "+s.dept+".");
    else passes.push("Department eligible");

    if(!yearPass) reasons.push("Required batch: "+e.batch+". Your batch: "+s.batch+".");
    else passes.push("Graduation year eligible");

    if(!cgpaPass) reasons.push("Minimum CGPA: "+e.minCGPA+". Your CGPA: "+s.cgpa+".");
    else passes.push("CGPA eligible");

    if(!backlogPass) reasons.push("Active backlogs allowed: "+e.maxBacklogs+". Your active backlogs: "+s.backlogs+".");
    else passes.push("Backlogs eligible");

    if(!tenthPass) reasons.push("10th minimum: "+e.min10+"%. Your 10th: "+s.tenth+"%.");
    else passes.push("10th % eligible");

    if(!twelfthPass) reasons.push("12th minimum: "+e.min12+"%. Your 12th: "+s.twelfth+"%.");
    else passes.push("12th % eligible");

    if(!skillPass) reasons.push("Required skills (need at least one): "+e.skills.join(", ")+". Your skills matched: none.");
    else if(e.skills && e.skills.length) passes.push("Required skills matched");

    return {eligible,checks,reasons,passes};
}

function regOpen(d){
    const now = new Date();
    const start = new Date(d.regStart);
    const end = new Date(d.regEnd+"T23:59:59");
    return now >= start && now <= end;
}

function driveStatusLabel(d){
    const now = new Date();
    const end = new Date(d.regEnd+"T23:59:59");
    const start = new Date(d.regStart);
    if(now < start) return "Upcoming";
    if(now > end) return "Registration Closed";
    return "Registration Open";
}

/* =====================================================
   SESSION STATE
===================================================== */

let currentUser = null; // {role, email}
let currentDriveId = null;
let editingStudentEmail = null;
let pendingStudentPhoto = "";
let pendingStudentResumeName = "";
let pendingStudentResumeData = "";
let placementTargetAppId = null;
let selectedApplicantIds = new Set();

/* =====================================================
   LOGIN
===================================================== */

function togglePasswordVisibility(inputId, btn){
    const input = document.getElementById(inputId);
    if(!input) return;
    if(input.type === "password"){
        input.type = "text";
        btn.textContent = "🙈";
        btn.setAttribute("aria-label","Hide password");
    } else {
        input.type = "password";
        btn.textContent = "👁️";
        btn.setAttribute("aria-label","Show password");
    }
}

async function login(){
    const role=val("loginRole"), email=val("loginEmail").toLowerCase(), password=document.getElementById("loginPassword").value, error=document.getElementById("loginError"), data=loadData();
    let valid=false;
    if(role==="admin") valid=(email==="admin@campushire.edu" && password==="admin123");
    else if(role==="student"){
        try{
            const response=await fetch(API_BASE_URL+"/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
            if(response.ok){
                const student=(await response.json()).student;
                data.students[email]={...(data.students[email]||{}),email:student.email,name:student.name,regNo:student.regNo,dept:student.dept,cgpa:student.cgpa,batch:student.batch,backlogs:student.backlogs,tenth:student.tenth,twelfth:student.twelfth,skills:student.skills||[],phone:student.phone||"",photo:student.photo||"",resumeName:student.resumeName||"",resumeData:student.resumeData||"",password,createdAt:student.createdAt||Date.now()};
                saveData(data); valid=true;
            } else valid=!!(data.students[email]&&data.students[email].password===password);
        }catch(e){ valid=!!(data.students[email]&&data.students[email].password===password); }
    }
    if(valid){ currentUser={role,email}; document.getElementById("loginPage").classList.add("hidden"); document.getElementById("app").classList.remove("hidden"); error.style.display="none"; configureRole(role); }
    else error.style.display="block";
}

function logout(){
    currentUser = null;
    document.getElementById("app").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
}

function configureRole(role){
    document.getElementById("studentMenu").classList.add("hidden");
    document.getElementById("adminMenu").classList.add("hidden");

    if(role === "student"){
        document.getElementById("studentMenu").classList.remove("hidden");
        document.getElementById("roleLabel").innerText = "STUDENT PORTAL";
        showOnlyPage("dashboard");
        renderStudentViews();
    } else if(role === "admin"){
        document.getElementById("adminMenu").classList.remove("hidden");
        document.getElementById("roleLabel").innerText = "TPO / ADMIN PORTAL";
        document.getElementById("topUserName").innerText = "TPO Admin";
        document.getElementById("topUserRole").innerText = "Administrator";
        document.getElementById("topAvatar").innerText = "AD";
        showOnlyPage("adminDashboard");
        renderAdminViews();
    }
}

/* =====================================================
   NAVIGATION
===================================================== */

function showPage(page,button){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById(page).classList.add("active");
    document.querySelectorAll(".menu button").forEach(b=>b.classList.remove("active"));
    if(button){ button.classList.add("active"); }
    refreshCurrentRoleViews();
    window.scrollTo(0,0);
}

function showOnlyPage(page){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById(page).classList.add("active");
}

function refreshCurrentRoleViews(){
    if(!currentUser) return;
    if(currentUser.role === "student") renderStudentViews();
    else if(currentUser.role === "admin") renderAdminViews();
    renderCalendar();
}

/* =====================================================
   STUDENT VIEWS
===================================================== */

function driveCardHTML(d, s, compact){
    const data = loadData();
    const c = data.companies[d.companyId] || {name:"Unknown"};
    const elig = computeEligibility(s,d);
    const open = regOpen(d);

    const badge = elig.eligible
        ? "<span class='eligible'>✓ You are eligible</span>"
        : "<span class='noteligible'>✕ Not eligible</span>";

    const statusTag = "<span class='tag'>"+driveStatusLabel(d)+"</span>";

    const already = data.applications.some(a=>a.studentEmail===currentUser.email && a.driveId===d.id);

    let actionBtn;
    if(already){
        actionBtn = "<button class='btn secondary' disabled>Already Applied</button>";
    } else if(!open){
        actionBtn = "<button class='btn secondary' disabled>Registration Closed</button>";
    } else {
        actionBtn = "<button class='btn primary' onclick=\"checkEligibility('"+d.id+"')\">Apply Now</button>";
    }

    const extraInfo = compact ? "" :
        "<p><strong>Min CGPA:</strong> "+d.eligibility.minCGPA+" &nbsp; <strong>Batch:</strong> "+d.eligibility.batch+"</p>";

    return (
        "<div class='job-card job-item'>"+
        "<div class='company'>"+c.name+"</div>"+
        "<div class='job-title'>"+d.title+"</div>"+
        "<p>"+(d.location||"-")+" • "+(d.package||"-")+"</p>"+
        "<div class='job-info'>"+
        (d.eligibility.skills||[]).map(sk=>"<span class='tag'>"+sk+"</span>").join("")+
        statusTag+
        "</div>"+
        extraInfo+
        "<p>"+badge+"</p><br>"+
        "<div style='display:flex;gap:8px;flex-wrap:wrap'>"+
        "<button class='btn secondary' onclick=\"openDriveDetail('"+d.id+"')\">View Details</button>"+
        actionBtn+
        "</div>"+
        "</div>"
    );
}

function renderStudentViews(){
    if(!currentUser || currentUser.role!=="student") return;

    const data = loadData();
    const s = data.students[currentUser.email];
    if(!s) return;

    document.getElementById("topUserName").innerText = s.name;
    document.getElementById("topUserRole").innerText = "Student";
    document.getElementById("topAvatar").innerHTML = s.photo ? ("<img src='"+s.photo+"'>") : initials(s.name);

    const hour = new Date().getHours();
    const greet = hour<12?"Good Morning":hour<17?"Good Afternoon":"Good Evening";
    document.getElementById("dashboardGreeting").innerText = greet+", "+s.name.split(" ")[0]+" 👋";

    const myApps = data.applications.filter(a=>a.studentEmail===currentUser.email);
    const eligibleDrives = data.drives.filter(d=>computeEligibility(s,d).eligible);
    const shortlisted = myApps.filter(a=>a.status==="Shortlisted");
    const selected = myApps.filter(a=>a.status==="Selected" || a.status==="Placed");

    document.getElementById("eligibleCount").innerText = eligibleDrives.length;
    document.getElementById("applicationCount").innerText = myApps.length;
    document.getElementById("studentShortlistedCount").innerText = shortlisted.length;
    document.getElementById("studentSelectedCount").innerText = selected.length;

    const bannerEl = document.getElementById("studentBanner");
    const placed = myApps.filter(a=>a.status==="Placed");
    if(placed.length>0){
        const latest = placed[placed.length-1];
        const data2 = loadData();
        const d = data2.drives.find(x=>x.id===latest.driveId);
        const c = d ? data2.companies[d.companyId] : null;
        bannerEl.innerHTML = "🎉 <strong>Congratulations!</strong> You have been placed at "+(c?c.name:latest.companyName)+" as "+latest.position+" role"+".";
        bannerEl.classList.remove("hidden");
    } else if(shortlisted.length>0){
        const latest = shortlisted[shortlisted.length-1];
        bannerEl.innerHTML = "🎉 <strong>Congratulations!</strong> You are shortlisted for "+latest.position+".";
        bannerEl.classList.remove("hidden");
    } else {
        bannerEl.classList.add("hidden");
    }

    const recGrid = document.getElementById("recommendedDrivesGrid");
    if(eligibleDrives.length===0){
        recGrid.innerHTML = "<p style='color:#64748b'>No recommended drives right now. Check All Drives for every opening.</p>";
    } else {
        recGrid.innerHTML = eligibleDrives.slice(0,2).map(d=>driveCardHTML(d,s,true)).join("");
    }

    const efmGrid = document.getElementById("eligibleForMeGrid");
    if(document.getElementById("eligibleForMe").classList.contains("active")){
        efmGrid.innerHTML = eligibleDrives.length
            ? eligibleDrives.map(d=>driveCardHTML(d,s,false)).join("")
            : "<p style='color:#64748b'>No drives match your profile right now.</p>";
    }

    if(document.getElementById("drives").classList.contains("active")){
        const filter = document.getElementById("driveFilter").value;
        let list = data.drives;
        if(filter==="eligible") list = list.filter(d=>computeEligibility(s,d).eligible);
        if(filter==="open") list = list.filter(d=>regOpen(d));
        document.getElementById("driveContainer").innerHTML = list.map(d=>driveCardHTML(d,s,false)).join("");
    }

    document.getElementById("profFullName").innerText = s.name;
    document.getElementById("profRegNo").innerText = s.regNo || "-";
    document.getElementById("profCgpa").innerText = s.cgpa;
    document.getElementById("profSkills").innerText = (s.skills||[]).join(", ") || "-";
    document.getElementById("profGradYear").innerText = s.batch;
    document.getElementById("profBacklogs").innerText = s.backlogs;
    document.getElementById("profTenth").innerText = s.tenth+"%";
    document.getElementById("profTwelfth").innerText = s.twelfth+"%";
    document.getElementById("profPhone").innerText = s.phone || "-";

    document.getElementById("studentAvatarBig").innerHTML = s.photo ? ("<img src='"+s.photo+"'>") : initials(s.name);
    document.getElementById("profileHeaderName").innerText = s.name;
    document.getElementById("profileHeaderDept").innerText = (s.dept||"-")+" • Batch "+s.batch;

    document.getElementById("resumeStatus").innerHTML = s.resumeName
        ? ("📄 "+s.resumeName+" <span style='float:right;color:#16a34a;font-weight:bold'>✓ Uploaded</span>")
        : ("No resume uploaded yet. <span style='float:right;color:#dc2626;font-weight:bold'>✕ Missing</span>");

    const table = document.getElementById("applicationTable");
    if(myApps.length===0){
        table.innerHTML = "<tr><td colspan='5' style='text-align:center;color:#64748b'>No applications yet.</td></tr>";
    } else {
        table.innerHTML = myApps.map(a=>{
            const cls = statusClass(a.status);
            return "<tr><td>"+a.companyName+"</td><td>"+a.position+"</td><td>"+a.appliedDate+"</td>"+
            "<td><span class='status "+cls+"'>"+a.status+"</span></td>"+
            "<td><button class='link-btn' onclick=\"openHistory('"+a.id+"')\">View History</button></td></tr>";
        }).join("");
    }

    renderStudentNotifications();
}

function statusClass(status){
    switch(status){
        case "Applied": return "gray";
        case "Under Review": return "orange";
        case "Shortlisted": return "blue";
        case "Next Round": return "blue";
        case "Selected": return "green";
        case "Placed": return "purple";
        case "Rejected": return "red";
        default: return "gray";
    }
}

function resumeUploaded(event){
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
        const data = loadData();
        const s = data.students[currentUser.email];
        s.resumeName = file.name;
        s.resumeData = ev.target.result;
        saveData(data);
        renderStudentViews();
    };
    reader.readAsDataURL(file);
}

/* Drive detail modal (student) */
function openDriveDetail(driveId){
    const data = loadData();
    const d = data.drives.find(x=>x.id===driveId);
    const c = data.companies[d.companyId];
    const s = data.students[currentUser.email];
    const elig = computeEligibility(s,d);

    document.getElementById("ddTitle").innerText = c.name+" — "+d.title;

    let html = "<p><strong>Package:</strong> "+d.package+"</p>";
    html += "<p><strong>Location:</strong> "+d.location+"</p>";
    html += "<p><strong>Drive Date:</strong> "+d.driveDate+"</p>";
    html += "<p><strong>Registration:</strong> "+d.regStart+" to "+d.regEnd+" ("+driveStatusLabel(d)+")</p>";
    html += "<p><strong>Selection Rounds:</strong> "+d.rounds.join(" → ")+"</p>";
    if(d.description) html += "<p style='margin-top:10px'>"+d.description+"</p>";

    if(elig.eligible){
        html += "<ul class='pass-list'>"+elig.passes.map(p=>"<li>✓ "+p+"</li>").join("")+"</ul>";
    } else {
        html += "<div class='closed-banner' style='background:#fee2e2;color:#991b1b'>Not Eligible</div>";
        html += "<ul class='reason-list'>"+elig.reasons.map(r=>"<li>❌ "+r+"</li>").join("")+"</ul>";
    }

    document.getElementById("ddBody").innerHTML = html;
    if (elig.eligible && d.registrationLink) {
    try {
        const url = new URL(d.registrationLink);

        if (url.protocol === "https:") {
            const container = document.createElement("div");
            container.style.marginTop = "18px";
            container.style.padding = "15px";
            container.style.background = "#eff6ff";
            container.style.borderRadius = "10px";

            const heading = document.createElement("strong");
            heading.textContent = "🔗 Company Registration";

            const link = document.createElement("a");
            link.href = url.href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Open Registration Form ↗";

            link.style.display = "block";
            link.style.marginTop = "10px";
            link.style.color = "#2563eb";
            link.style.fontWeight = "bold";
            link.style.textDecoration = "underline";

            container.appendChild(heading);
            container.appendChild(link);

            document.getElementById("ddBody").appendChild(container);
        }
    } catch (error) {
        console.warn("Invalid registration link for this drive.");
    }
}
    document.getElementById("driveDetailModal").style.display = "flex";
}
function closeDriveDetail(){
    document.getElementById("driveDetailModal").style.display = "none";
}

/* =====================================================
   ELIGIBILITY CHECK + APPLY
===================================================== */

function checkEligibility(driveId){
    currentDriveId = driveId;
    const data = loadData();
    const d = data.drives.find(x=>x.id===driveId);
    const c = data.companies[d.companyId];
    const s = data.students[currentUser.email];
    if(!d || !s) return;

    document.getElementById("checkingCompany").innerText = c.name+" • "+d.title;

    const elig = computeEligibility(s,d);
    const ch = elig.checks;

    document.getElementById("deptStudent").innerText = s.dept;
    document.getElementById("deptResult").innerHTML = ch.deptPass ? "<span class='check-pass'>✓ Pass</span>" : "<span class='check-fail'>✕ Fail</span>";

    document.getElementById("yearStudent").innerText = s.batch+" / Required "+d.eligibility.batch;
    document.getElementById("yearResult").innerHTML = ch.yearPass ? "<span class='check-pass'>✓ Pass</span>" : "<span class='check-fail'>✕ Fail</span>";

    document.getElementById("cgpaStudent").innerText = s.cgpa+" / Required "+d.eligibility.minCGPA;
    document.getElementById("cgpaResult").innerHTML = ch.cgpaPass ? "<span class='check-pass'>✓ Pass</span>" : "<span class='check-fail'>✕ Fail</span>";

    document.getElementById("backlogStudent").innerText = s.backlogs+" / Allowed "+d.eligibility.maxBacklogs;
    document.getElementById("backlogResult").innerHTML = ch.backlogPass ? "<span class='check-pass'>✓ Pass</span>" : "<span class='check-fail'>✕ Fail</span>";

    document.getElementById("tenthStudent").innerText = s.tenth+"% / Required "+d.eligibility.min10+"%";
    document.getElementById("tenthResult").innerHTML = ch.tenthPass ? "<span class='check-pass'>✓ Pass</span>" : "<span class='check-fail'>✕ Fail</span>";

    document.getElementById("twelfthStudent").innerText = s.twelfth+"% / Required "+d.eligibility.min12+"%";
    document.getElementById("twelfthResult").innerHTML = ch.twelfthPass ? "<span class='check-pass'>✓ Pass</span>" : "<span class='check-fail'>✕ Fail</span>";

    document.getElementById("skillStudent").innerText = ch.matchedSkills.length+"/"+d.eligibility.skills.length+" matched (need at least 1)";
    document.getElementById("skillResult").innerHTML = ch.skillPass ? "<span class='check-pass'>✓ Pass</span>" : "<span class='check-fail'>✕ Fail</span>";

    const resultBox = document.getElementById("eligibilityResult");
    const submitButton = document.getElementById("submitApplicationButton");

    const alreadyApplied = data.applications.some(a=>a.studentEmail===currentUser.email && a.driveId===driveId);
    const open = regOpen(d);

    if(alreadyApplied){
        resultBox.className = "result-box result-failure";
        resultBox.innerHTML = "<strong>⚠️ ALREADY APPLIED</strong><br><br>You have already applied to "+c.name+" for this role.";
        submitButton.style.display = "none";
    } else if(!open){
        resultBox.className = "result-box result-failure";
        resultBox.innerHTML = "<strong>⏰ REGISTRATION CLOSED</strong><br><br>The registration window for this drive is not currently open.";
        submitButton.style.display = "none";
    } else if(elig.eligible){
        resultBox.className = "result-box result-success";
        resultBox.innerHTML = "<strong>🎉 ELIGIBLE</strong><br><br>All eligibility requirements are satisfied. You can submit your application for "+c.name+".";
        submitButton.style.display = "inline-block";
    } else {
        resultBox.className = "result-box result-failure";
        resultBox.innerHTML = "<strong>❌ NOT ELIGIBLE</strong><br><br>"+elig.reasons.map(r=>"• "+r).join("<br>");
        submitButton.style.display = "none";
    }

    document.getElementById("eligibilityModal").style.display = "flex";
}

function submitApplication(){
    const data = loadData();
    const d = data.drives.find(x=>x.id===currentDriveId);
    const c = data.companies[d.companyId];
    const s = data.students[currentUser.email];
    if(!d || !s) return;

    const alreadyApplied = data.applications.some(a=>a.studentEmail===currentUser.email && a.driveId===currentDriveId);
    if(alreadyApplied || !regOpen(d)) return;

    const today = new Date().toLocaleDateString();

    data.applications.push({
        id: "app_"+Date.now(),
        studentEmail: currentUser.email,
        studentName: s.name,
        driveId: d.id,
        companyId: d.companyId,
        companyName: c.name,
        position: d.title,
        appliedDate: today,
        status: "Applied",
        history: [{date:today,status:"Applied"}]
    });

    saveData(data);
    renderStudentViews();

    document.getElementById("eligibilityResult").className = "result-box result-success";
    document.getElementById("eligibilityResult").innerHTML = "<strong>✅ APPLICATION SUBMITTED</strong><br><br>Your application has been successfully submitted to "+c.name+".";
    document.getElementById("submitApplicationButton").style.display = "none";
}

function closeEligibility(){
    document.getElementById("eligibilityModal").style.display = "none";
}

function openHistory(appId){
    const data = loadData();
    const app = data.applications.find(a=>a.id===appId);
    if(!app) return;
    document.getElementById("historyTitle").innerText = app.companyName+" — "+app.position;
    document.getElementById("historyTimeline").innerHTML = app.history.map(h=>
        "<div class='timeline-item'><div class='timeline-date'>"+h.date+"</div><div class='timeline-status'>"+h.status+"</div></div>"
    ).join("");
    document.getElementById("historyModal").style.display = "flex";
}

/* =====================================================
   STUDENT NOTIFICATIONS
===================================================== */

function renderStudentNotifications(){
    const data = loadData();
    const mine = data.notifications.filter(n=>n.targetEmails.includes(currentUser.email)).sort((a,b)=>b.ts-a.ts);
    const box = document.getElementById("studentNotifList");
    if(mine.length===0){
        box.innerHTML = "<p style='color:#64748b'>No notifications yet.</p>";
        return;
    }
    box.innerHTML = mine.map(n=>
        "<div class='notif-item'>"+n.message+"<div class='notif-meta'>"+n.date+" • "+n.audienceLabel+"</div></div>"
    ).join("");
}

/* =====================================================
   CALENDAR (shared)
===================================================== */

function renderCalendar(){
    const data = loadData();
    const events = [];

    data.drives.forEach(d=>{
        const c = data.companies[d.companyId];
        events.push({date:d.regStart,label:c.name+" — "+d.title+": Registration Opens"});
        events.push({date:d.regEnd,label:c.name+" — "+d.title+": Registration Deadline"});
        events.push({date:d.driveDate,label:c.name+" — "+d.title+": Drive Date ("+d.rounds.join(", ")+")"});
    });

    events.sort((a,b)=>new Date(a.date)-new Date(b.date));

    const box = document.getElementById("calendarList");
    if(!box) return;

    if(events.length===0){
        box.innerHTML = "<p style='color:#64748b'>No events scheduled.</p>";
        return;
    }

    box.innerHTML = events.map(e=>
        "<div class='cal-item'><div class='cal-date'>"+e.date+"</div><div>"+e.label+"</div></div>"
    ).join("");
}

/* =====================================================
   SEARCH / FILTER (student drive list)
===================================================== */

function searchDrives(){
    const input = document.getElementById("searchBox").value.toLowerCase();
    document.querySelectorAll(".job-item").forEach(card=>{
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(input) ? "block" : "none";
    });
}

/* =====================================================
   ADMIN: COMPANIES
===================================================== */

function addCompany(){
    const name = val("compName");
    const industry = val("compIndustry");
    const hrName = val("compHr") || "HR Team";
    const phone = val("compPhone") || "-";
    const website = val("compWebsite") || "-";

    if(!name || !industry){
        alert("Please fill in at least company name and industry.");
        return;
    }

    const data = loadData();
    const id = "c_"+Date.now();
    data.companies[id] = {id,name,industry,hrName,phone,website};
    saveData(data);

    ["compName","compIndustry","compHr","compPhone","compWebsite"].forEach(i=>document.getElementById(i).value="");

    renderAdminViews();
    alert("✅ Company added: "+name);
}

function renderAdminCompanyTable(){
    const data = loadData();
    const rows = Object.values(data.companies).map(c=>{
        const drives = data.drives.filter(d=>d.companyId===c.id);
        const driveIds = drives.map(d=>d.id);
        const apps = data.applications.filter(a=>driveIds.includes(a.driveId));
        const shortlisted = apps.filter(a=>a.status==="Shortlisted").length;
        const selected = apps.filter(a=>a.status==="Selected" || a.status==="Placed").length;
        return "<tr><td>"+c.name+"</td><td>"+c.industry+"</td><td>"+drives.length+"</td><td>"+apps.length+"</td><td>"+shortlisted+"</td><td>"+selected+"</td></tr>";
    });
    document.getElementById("adminCompanyTable").innerHTML = rows.join("") || "<tr><td colspan='6' style='text-align:center;color:#64748b'>No companies yet.</td></tr>";
}

/* =====================================================
   ADMIN: PLACEMENT DRIVES
===================================================== */

function populateDriveCompanySelect(){
    const data = loadData();
    const sel = document.getElementById("driveCompany");
    if(!sel) return;
    sel.innerHTML = Object.values(data.companies).map(c=>"<option value='"+c.id+"'>"+c.name+"</option>").join("");
}

function createDrive(){
    const data = loadData();

    const companyId = val("driveCompany");
    const title = val("driveTitle");
    const pkg = val("drivePackage");
    const location = val("driveLocation");
    const driveDate = val("driveDate");
    const regStart = val("driveRegStart");
    const regEnd = val("driveRegEnd");
    const depts = val("driveDepts").split(",").map(x=>x.trim()).filter(Boolean);
    const batch = parseInt(val("driveBatch"));
    const minCGPA = parseFloat(val("driveMinCgpa"));
    const maxBacklogs = parseInt(val("driveMaxBacklogs"))||0;
    const min10 = parseFloat(val("driveMin10"))||0;
    const min12 = parseFloat(val("driveMin12"))||0;
    const skills = val("driveSkills").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
    const rounds = val("driveRounds").split(",").map(x=>x.trim()).filter(Boolean);
    const description = val("driveDescription");
    const registrationLink = val("driveRegistrationLink");

if (registrationLink) {
    try {
        const url = new URL(registrationLink);

        if (url.protocol !== "https:") {
            alert("Please enter a valid HTTPS registration link.");
            return;
        }
    } catch (error) {
        alert("Please enter a valid registration URL.");
        return;
    }
}

    if(!companyId || !title || !driveDate || !regStart || !regEnd || isNaN(batch) || isNaN(minCGPA) || rounds.length===0){
        alert("Please fill in company, title, dates, batch, minimum CGPA, and at least one selection round.");
        return;
    }

    if(new Date(regEnd) < new Date(regStart)){
        alert("Registration deadline cannot be before registration start.");
        return;
    }

    const id = "d_"+Date.now();
    data.drives.push({
        id, companyId, title, package:pkg, location, driveDate, regStart, regEnd,
        eligibility:{depts,batch,minCGPA,maxBacklogs,min10,min12,skills},
        rounds, description, registrationLink
    });

    saveData(data);
    document.getElementById("driveRegistrationLink").value = "";

    ["driveTitle","drivePackage","driveLocation","driveDate","driveRegStart","driveRegEnd","driveDepts","driveSkills","driveRounds","driveDescription"].forEach(i=>document.getElementById(i).value="");

    renderAdminViews();
    alert("✅ Placement drive created.");
}

function renderAdminDriveTable(){
    const data = loadData();
    const rows = data.drives.map(d=>{
        const c = data.companies[d.companyId] || {name:"Unknown"};
        const eligibleCount = Object.values(data.students).filter(s=>computeEligibility(s,d).eligible).length;
        const appliedCount = data.applications.filter(a=>a.driveId===d.id).length;
        const status = driveStatusLabel(d);
        const statusCls = status==="Registration Open" ? "green" : status==="Upcoming" ? "orange" : "red";
        return "<tr><td>"+c.name+"</td><td>"+d.title+"</td><td>"+d.eligibility.batch+"</td>"+
        "<td>"+d.regStart+" → "+d.regEnd+"</td>"+
        "<td><span class='status "+statusCls+"'>"+status+"</span></td>"+
        "<td>"+eligibleCount+"</td><td>"+appliedCount+"</td>"+
        "<td><button class='link-btn' onclick=\"goToDriveApplications('"+d.id+"')\">View Applicants</button></td></tr>";
    });
    document.getElementById("adminDriveTable").innerHTML = rows.join("") || "<tr><td colspan='8' style='text-align:center;color:#64748b'>No drives created yet.</td></tr>";
}

function goToDriveApplications(driveId){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById("companyApplications").classList.add("active");
    document.querySelectorAll("#adminMenu button").forEach(b=>b.classList.remove("active"));
    document.getElementById("appsDriveSelect").value = driveId;
    renderApplicationsForDrive();
}

/* =====================================================
   ADMIN: APPLICATIONS
===================================================== */

function populateAppsDriveSelect(){
    const data = loadData();
    const sel = document.getElementById("appsDriveSelect");
    if(!sel) return;
    const current = sel.value;
    sel.innerHTML = data.drives.map(d=>{
        const c = data.companies[d.companyId];
        return "<option value='"+d.id+"'>"+c.name+" — "+d.title+"</option>";
    }).join("");
    if(current) sel.value = current;
}

function renderApplicationsForDrive(){
    const data = loadData();
    const sel = document.getElementById("appsDriveSelect");
    if(!sel || !sel.value){
        document.getElementById("appsDriveDetail").innerHTML = "<div class='section'><p style='color:#64748b'>No placement drives available yet. Create one first.</p></div>";
        return;
    }
    const driveId = sel.value;
    const d = data.drives.find(x=>x.id===driveId);
    const c = data.companies[d.companyId];
    if(!d) return;

    selectedApplicantIds = new Set();

    const eligibleStudents = Object.values(data.students).filter(s=>computeEligibility(s,d).eligible);
    const apps = data.applications.filter(a=>a.driveId===driveId);
    const notApplied = eligibleStudents.length - apps.length;

    const underReview = apps.filter(a=>a.status==="Under Review").length;
    const shortlisted = apps.filter(a=>a.status==="Shortlisted").length;
    const rejected = apps.filter(a=>a.status==="Rejected").length;
    const selected = apps.filter(a=>a.status==="Selected").length;
    const placed = apps.filter(a=>a.status==="Placed").length;

    let html = "<div class='section'>";
    html += "<div class='section-title'>"+c.name+" — "+d.title+"</div><br>";
    html += "<div class='drive-detail-grid'>";
    html += "<div class='mini-stat'><div class='num'>"+eligibleStudents.length+"</div><div class='lbl'>Total Eligible</div></div>";
    html += "<div class='mini-stat'><div class='num'>"+apps.length+"</div><div class='lbl'>Applications Received</div></div>";
    html += "<div class='mini-stat'><div class='num'>"+Math.max(notApplied,0)+"</div><div class='lbl'>Did Not Apply</div></div>";
    html += "<div class='mini-stat'><div class='num'>"+underReview+"</div><div class='lbl'>Under Review</div></div>";
    html += "</div>";
    html += "<div class='drive-detail-grid'>";
    html += "<div class='mini-stat'><div class='num'>"+shortlisted+"</div><div class='lbl'>Shortlisted</div></div>";
    html += "<div class='mini-stat'><div class='num'>"+rejected+"</div><div class='lbl'>Rejected</div></div>";
    html += "<div class='mini-stat'><div class='num'>"+selected+"</div><div class='lbl'>Selected</div></div>";
    html += "<div class='mini-stat'><div class='num'>"+placed+"</div><div class='lbl'>Placed</div></div>";
    html += "</div>";
    html += "</div>";

    html += "<div class='section'>";
    html += "<div class='section-header'><div class='section-title'>Applicants</div></div>";
    html += "<p class='field-note' style='margin-bottom:10px'>Use the status dropdown to shortlist, un-shortlist, reject, or advance any applicant based on their drive performance — changes are not one-directional.</p>";
    html += "<div class='bulk-bar'><span id='bulkCount'>0 selected</span>"+
        "<button class='btn success small' onclick=\"bulkUpdate('Shortlisted')\">Shortlist Selected</button>"+
        "<button class='btn secondary small' onclick=\"bulkUpdate('Under Review')\">Un-shortlist Selected</button>"+
        "<button class='btn danger small' onclick=\"bulkUpdate('Rejected')\">Reject Selected</button></div>";

    html += "<table><thead><tr><th></th><th>Register No</th><th>Student</th><th>Department</th><th>CGPA</th><th>Backlogs</th><th>Applied Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>";

    if(apps.length===0){
        html += "<tr><td colspan='9' style='text-align:center;color:#64748b'>No applications received yet.</td></tr>";
    } else {
        const STATUS_OPTIONS = ["Applied","Under Review","Shortlisted","Next Round","Selected","Rejected","Placed"];

        apps.forEach(a=>{
            const student = data.students[a.studentEmail] || {};
            const cls = statusClass(a.status);

            const selectId = "statusSel_"+a.id;
            const optionsHtml = STATUS_OPTIONS.map(opt=>
                "<option value='"+opt+"'"+(opt===a.status?" selected":"")+">"+opt+"</option>"
            ).join("");

            let actions = "<select id='"+selectId+"' class='status-select'>"+optionsHtml+"</select> ";
            actions += "<button class='btn primary small' onclick=\"changeApplicationStatus('"+a.id+"')\">Update</button> ";

            // Quick one-click shortcuts for the most common performance-based moves
            if(a.status!=="Shortlisted"){
                actions += "<button class='btn success small' onclick=\"updateApplicationStatus('"+a.id+"','Shortlisted')\">Shortlist</button> ";
            } else {
                actions += "<button class='btn secondary small' onclick=\"updateApplicationStatus('"+a.id+"','Under Review')\">Un-shortlist</button> ";
            }
            if(a.status!=="Rejected"){
                actions += "<button class='btn danger small' onclick=\"updateApplicationStatus('"+a.id+"','Rejected')\">Reject</button> ";
            } else {
                actions += "<button class='btn secondary small' onclick=\"updateApplicationStatus('"+a.id+"','Under Review')\">Undo Reject</button> ";
            }
            if(a.status==="Selected"){
                actions += "<button class='btn primary small' onclick=\"openPlacementModal('"+a.id+"')\">Record Placement</button> ";
            }

            actions += "<button class='btn secondary small' onclick=\"openHistoryAdmin('"+a.id+"')\">History</button>";

            const canBulk = (a.status!=="Placed");

            html += "<tr>"+
                "<td>"+(canBulk?("<input type='checkbox' onchange=\"toggleBulk('"+a.id+"',this.checked)\">"):"")+"</td>"+
                "<td>"+(student.regNo||"-")+"</td>"+
                "<td>"+a.studentName+"</td>"+
                "<td>"+(student.dept||"-")+"</td>"+
                "<td>"+(student.cgpa!==undefined?student.cgpa:"-")+"</td>"+
                "<td>"+(student.backlogs!==undefined?student.backlogs:"-")+"</td>"+
                "<td>"+a.appliedDate+"</td>"+
                "<td><span class='status "+cls+"'>"+a.status+"</span></td>"+
                "<td>"+actions+"</td>"+
                "</tr>";
        });
    }

    html += "</tbody></table></div>";

    document.getElementById("appsDriveDetail").innerHTML = html;
}

function toggleBulk(appId,checked){
    if(checked) selectedApplicantIds.add(appId);
    else selectedApplicantIds.delete(appId);
    document.getElementById("bulkCount").innerText = selectedApplicantIds.size+" selected";
}

function bulkUpdate(status){
    if(selectedApplicantIds.size===0){ alert("Select at least one applicant first."); return; }
    const data = loadData();
    const today = new Date().toLocaleDateString();
    selectedApplicantIds.forEach(id=>{
        const app = data.applications.find(a=>a.id===id);
        if(app){ app.status = status; app.history.push({date:today,status}); }
    });
    saveData(data);
    renderApplicationsForDrive();
}

function changeApplicationStatus(appId){
    const sel = document.getElementById("statusSel_"+appId);
    if(!sel) return;
    const newStatus = sel.value;

    // "Placed" needs offer/joining details, so route through the placement modal
    // instead of just flipping the status directly.
    if(newStatus==="Placed"){
        openPlacementModal(appId);
        return;
    }

    updateApplicationStatus(appId,newStatus);
}

function updateApplicationStatus(appId,status){
    const data = loadData();
    const app = data.applications.find(a=>a.id===appId);
    if(!app) return;
    app.status = status;
    app.history.push({date:new Date().toLocaleDateString(),status});
    saveData(data);
    renderApplicationsForDrive();
}

function openHistoryAdmin(appId){
    openHistory(appId);
}

function openPlacementModal(appId){
    placementTargetAppId = appId;
    document.getElementById("plPackage").value = "";
    document.getElementById("plOfferDate").value = "";
    document.getElementById("plJoiningDate").value = "";
    document.getElementById("plJoiningLocation").value = "";
    const data = loadData();
    const app = data.applications.find(a=>a.id===appId);
    document.getElementById("placementModalSub").innerText = app.studentName+" — "+app.companyName+" ("+app.position+")";
    document.getElementById("placementModal").style.display = "flex";
}

function confirmPlacement(){
    const data = loadData();
    const app = data.applications.find(a=>a.id===placementTargetAppId);
    if(!app) return;

    app.package = val("plPackage");
    app.offerDate = val("plOfferDate");
    app.joiningDate = val("plJoiningDate");
    app.joiningLocation = val("plJoiningLocation");
    app.status = "Placed";
    app.history.push({date:new Date().toLocaleDateString(),status:"Placed"});

    saveData(data);
    closeAllModals();
    renderApplicationsForDrive();
    renderAdminViews();
}

/* =====================================================
   ADMIN: STUDENTS
===================================================== */

function populateStudentFilters(){
    const data = loadData();
    const depts = [...new Set(Object.values(data.students).map(s=>s.dept))].sort();
    const batches = [...new Set(Object.values(data.students).map(s=>s.batch))].sort();

    const deptSel = document.getElementById("stuFilterDept");
    const batchSel = document.getElementById("stuFilterBatch");
    if(deptSel && deptSel.options.length<=1){
        depts.forEach(d=>{ const o=document.createElement("option"); o.value=d; o.innerText=d; deptSel.appendChild(o); });
    }
    if(batchSel && batchSel.options.length<=1){
        batches.forEach(b=>{ const o=document.createElement("option"); o.value=b; o.innerText=b; batchSel.appendChild(o); });
    }
}

function studentPlacementStatus(data,email){
    const apps = data.applications.filter(a=>a.studentEmail===email);
    if(apps.some(a=>a.status==="Placed")) return {label:"Placed",cls:"purple"};
    if(apps.some(a=>a.status==="Selected")) return {label:"Selected",cls:"green"};
    if(apps.some(a=>a.status==="Shortlisted" || a.status==="Next Round")) return {label:"In Process",cls:"blue"};
    if(apps.length>0) return {label:"Applied",cls:"orange"};
    return {label:"Not Placed",cls:"gray"};
}

function renderStudentManageTable(){
    const data = loadData();
    const search = (document.getElementById("stuSearchText").value||"").toLowerCase();
    const dept = document.getElementById("stuFilterDept").value;
    const batch = document.getElementById("stuFilterBatch").value;
    const minCgpa = parseFloat(document.getElementById("stuFilterCgpa").value)||0;

    let list = Object.values(data.students);

    if(search){
        list = list.filter(s=>s.name.toLowerCase().includes(search) || (s.regNo||"").toLowerCase().includes(search));
    }
    if(dept!=="all") list = list.filter(s=>s.dept===dept);
    if(batch!=="all") list = list.filter(s=>String(s.batch)===String(batch));
    list = list.filter(s=>s.cgpa>=minCgpa);

    list.sort((a,b)=>(a.regNo||"").localeCompare(b.regNo||""));
    list = list.slice(0,200); // cap render for prototype performance

    const rows = list.map(s=>{
        const ps = studentPlacementStatus(data,s.email);
        return "<tr><td>"+(s.regNo||"-")+"</td><td>"+s.name+"</td><td>"+s.dept+"</td><td>"+s.batch+"</td><td>"+s.cgpa+"</td><td>"+s.backlogs+"</td>"+
        "<td><span class='status "+ps.cls+"'>"+ps.label+"</span></td>"+
        "<td><button class='link-btn' onclick=\"viewStudentDetail('"+s.email+"')\">View</button></td></tr>";
    });

    document.getElementById("studentManageTable").innerHTML = rows.join("") || "<tr><td colspan='8' style='text-align:center;color:#64748b'>No students match this filter.</td></tr>";
}

function viewStudentDetail(email){
    const data = loadData();
    const s = data.students[email];
    if(!s) return;
    const apps = data.applications.filter(a=>a.studentEmail===email);
    const ps = studentPlacementStatus(data,email);

    let html = "<div class='section-header'><div class='section-title'>"+s.name+" ("+s.regNo+")</div><button class='link-btn' onclick=\"document.getElementById('studentDetailBox').classList.add('hidden')\">Close</button></div>";
    html += "<p><strong>Department:</strong> "+s.dept+" &nbsp; <strong>Batch:</strong> "+s.batch+" &nbsp; <strong>CGPA:</strong> "+s.cgpa+" &nbsp; <strong>Backlogs:</strong> "+s.backlogs+"</p>";
    html += "<p><strong>10th:</strong> "+s.tenth+"% &nbsp; <strong>12th:</strong> "+s.twelfth+"% &nbsp; <strong>Phone:</strong> "+(s.phone||"-")+"</p>";
    html += "<p><strong>Skills:</strong> "+(s.skills||[]).join(", ")+"</p>";
    html += "<p style='margin-top:10px'><strong>Placement Status:</strong> <span class='status "+ps.cls+"'>"+ps.label+"</span></p>";

    html += "<br><table><thead><tr><th>Company</th><th>Role</th><th>Applied</th><th>Status</th></tr></thead><tbody>";
    if(apps.length===0){
        html += "<tr><td colspan='4' style='text-align:center;color:#64748b'>No applications.</td></tr>";
    } else {
        apps.forEach(a=>{
            html += "<tr><td>"+a.companyName+"</td><td>"+a.position+"</td><td>"+a.appliedDate+"</td><td><span class='status "+statusClass(a.status)+"'>"+a.status+"</span></td></tr>";
        });
    }
    html += "</tbody></table>";

    const box = document.getElementById("studentDetailBox");
    box.innerHTML = html;
    box.classList.remove("hidden");
}

/* =====================================================
   ADMIN: NOTIFICATIONS
===================================================== */

function toggleNotifDriveField(){
    const audience = document.getElementById("notifAudience").value;
    const needsDrive = ["eligible","applicants","shortlisted","selected"].includes(audience);
    document.getElementById("notifDriveField").classList.toggle("hidden",!needsDrive);
    document.getElementById("notifDeptField").classList.toggle("hidden",audience!=="department");
}

function populateNotifDriveSelect(){
    const data = loadData();
    const sel = document.getElementById("notifDriveSelect");
    if(!sel) return;
    sel.innerHTML = data.drives.map(d=>{
        const c = data.companies[d.companyId];
        return "<option value='"+d.id+"'>"+c.name+" — "+d.title+"</option>";
    }).join("");
}

function sendNotification(){
    const data = loadData();
    const audience = val("notifAudience");
    const message = val("notifMessage");
    if(!message){ alert("Please write a message."); return; }

    let targetEmails = [];
    let audienceLabel = "";

    if(audience==="all"){
        targetEmails = Object.keys(data.students);
        audienceLabel = "All Students";
    } else if(audience==="department"){
        const dept = val("notifDept");
        targetEmails = Object.values(data.students).filter(s=>s.dept===dept).map(s=>s.email);
        audienceLabel = "Department: "+dept;
    } else {
        const driveId = document.getElementById("notifDriveSelect").value;
        const d = data.drives.find(x=>x.id===driveId);
        const c = data.companies[d.companyId];
        if(audience==="eligible"){
            targetEmails = Object.values(data.students).filter(s=>computeEligibility(s,d).eligible).map(s=>s.email);
            audienceLabel = "Eligible for "+c.name+" — "+d.title;
        } else {
            const statusMap = {applicants:null,shortlisted:"Shortlisted",selected:"Selected"};
            const apps = data.applications.filter(a=>a.driveId===driveId && (statusMap[audience]===null || a.status===statusMap[audience] || (audience==="selected" && a.status==="Placed")));
            targetEmails = apps.map(a=>a.studentEmail);
            audienceLabel = audience.charAt(0).toUpperCase()+audience.slice(1)+" for "+c.name+" — "+d.title;
        }
    }

    data.notifications.push({
        id:"n_"+Date.now(), date:new Date().toLocaleDateString(), ts:Date.now(),
        audienceLabel, message, targetEmails
    });

    saveData(data);
    document.getElementById("notifMessage").value = "";
    renderAdminViews();
    alert("✅ Notification sent to "+targetEmails.length+" student(s).");
}

function renderAdminNotifList(){
    const data = loadData();
    const box = document.getElementById("adminNotifList");
    if(!box) return;
    const sorted = [...data.notifications].sort((a,b)=>b.ts-a.ts);
    box.innerHTML = sorted.map(n=>
        "<div class='notif-item'>"+n.message+"<div class='notif-meta'>"+n.date+" • "+n.audienceLabel+" • "+n.targetEmails.length+" recipient(s)</div></div>"
    ).join("") || "<p style='color:#64748b'>No notifications sent yet.</p>";
}

/* =====================================================
   ADMIN DASHBOARD + REPORTS
===================================================== */

function renderAdminViews(){
    const data = loadData();

    const students = Object.values(data.students);
    const companies = Object.values(data.companies);
    const apps = data.applications;

    document.getElementById("adminTotalStudents").innerText = students.length;
    document.getElementById("adminFinalYear").innerText = students.filter(s=>s.batch===Math.max(...students.map(x=>x.batch))).length;
    document.getElementById("adminCompaniesCount").innerText = companies.length;
    document.getElementById("adminActiveDrives").innerText = data.drives.filter(d=>driveStatusLabel(d)!=="Registration Closed").length;
    document.getElementById("adminApplicationsCount").innerText = apps.length;
    document.getElementById("adminShortlistedCount").innerText = apps.filter(a=>a.status==="Shortlisted").length;
    document.getElementById("adminSelectedCount").innerText = apps.filter(a=>a.status==="Selected").length;
    document.getElementById("adminPlacedCount").innerText = apps.filter(a=>a.status==="Placed").length;

    populateDriveCompanySelect();
    renderAdminCompanyTable();
    renderAdminDriveTable();
    populateAppsDriveSelect();
    if(document.getElementById("companyApplications").classList.contains("active")){
        renderApplicationsForDrive();
    }
    populateStudentFilters();
    if(document.getElementById("studentManage").classList.contains("active")){
        renderStudentManageTable();
    }
    populateNotifDriveSelect();
    toggleNotifDriveField();
    renderAdminNotifList();
    renderReports();
}

function renderReports(){
    const data = loadData();
    const students = Object.values(data.students);
    const apps = data.applications;

    const eligibleAny = students.filter(s=>data.drives.some(d=>computeEligibility(s,d).eligible)).length;
    const appliedAny = new Set(apps.map(a=>a.studentEmail)).size;
    const placedCount = apps.filter(a=>a.status==="Placed").length;
    const placedStudents = new Set(apps.filter(a=>a.status==="Placed").map(a=>a.studentEmail)).size;

    document.getElementById("repTotal").innerText = students.length;
    document.getElementById("repEligible").innerText = eligibleAny;
    document.getElementById("repApplied").innerText = appliedAny;
    document.getElementById("repPlacedPct").innerText = students.length ? Math.round((placedStudents/students.length)*100)+"%" : "0%";

    const deptMap = {};
    students.forEach(s=>{
        if(!deptMap[s.dept]) deptMap[s.dept] = {total:0,eligible:0,applied:0,shortlisted:0,selected:0,placed:0};
        deptMap[s.dept].total++;
        if(data.drives.some(d=>computeEligibility(s,d).eligible)) deptMap[s.dept].eligible++;
    });
    apps.forEach(a=>{
        const s = data.students[a.studentEmail];
        if(!s) return;
        const m = deptMap[s.dept];
        if(!m) return;
        if(a.status!=="Applied"){} // applied handled below via unique student
        if(a.status==="Shortlisted") m.shortlisted++;
        if(a.status==="Selected") m.selected++;
        if(a.status==="Placed") m.placed++;
    });
    const appliedByDeptStudents = {};
    apps.forEach(a=>{
        const s = data.students[a.studentEmail];
        if(!s) return;
        appliedByDeptStudents[s.dept] = appliedByDeptStudents[s.dept] || new Set();
        appliedByDeptStudents[s.dept].add(a.studentEmail);
    });
    Object.keys(deptMap).forEach(d=>{
        deptMap[d].applied = appliedByDeptStudents[d] ? appliedByDeptStudents[d].size : 0;
    });

    const deptRows = Object.entries(deptMap).sort((a,b)=>a[0].localeCompare(b[0]));
    document.getElementById("deptTable").innerHTML = deptRows.map(([d,v])=>
        "<tr><td>"+d+"</td><td>"+v.total+"</td><td>"+v.eligible+"</td><td>"+v.applied+"</td><td>"+v.shortlisted+"</td><td>"+v.selected+"</td><td>"+v.placed+"</td></tr>"
    ).join("") || "<tr><td colspan='7' style='text-align:center;color:#64748b'>No student data yet.</td></tr>";

    const companyRows = Object.values(data.companies).map(c=>{
        const drives = data.drives.filter(d=>d.companyId===c.id);
        const driveIds = drives.map(d=>d.id);
        const cApps = apps.filter(a=>driveIds.includes(a.driveId));
        return "<tr><td>"+c.name+"</td><td>"+drives.length+"</td><td>"+cApps.length+"</td>"+
        "<td>"+cApps.filter(a=>a.status==="Shortlisted").length+"</td>"+
        "<td>"+cApps.filter(a=>a.status==="Selected").length+"</td>"+
        "<td>"+cApps.filter(a=>a.status==="Placed").length+"</td></tr>";
    });
    document.getElementById("companyStatsTable").innerHTML = companyRows.join("") || "<tr><td colspan='6' style='text-align:center;color:#64748b'>No companies yet.</td></tr>";
}

/* =====================================================
   CSV EXPORT
===================================================== */

function downloadCSV(filename,rows){
    const csv = rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportCSV(kind){
    const data = loadData();

    if(kind==="students"){
        const rows = [["Register No","Name","Department","Batch","CGPA","Backlogs","10th","12th","Phone","Skills"]];
        Object.values(data.students).forEach(s=>{
            rows.push([s.regNo,s.name,s.dept,s.batch,s.cgpa,s.backlogs,s.tenth,s.twelfth,s.phone,(s.skills||[]).join("; ")]);
        });
        downloadCSV("students.csv",rows);
    }

    if(kind==="applications"){
        const rows = [["Register No","Student","Company","Role","Applied Date","Status"]];
        data.applications.forEach(a=>{
            const s = data.students[a.studentEmail]||{};
            rows.push([s.regNo||"-",a.studentName,a.companyName,a.position,a.appliedDate,a.status]);
        });
        downloadCSV("applications.csv",rows);
    }

    if(kind==="placements"){
        const rows = [["Register No","Student","Company","Role","Package","Offer Date","Joining Date","Joining Location"]];
        data.applications.filter(a=>a.status==="Placed").forEach(a=>{
            const s = data.students[a.studentEmail]||{};
            rows.push([s.regNo||"-",a.studentName,a.companyName,a.position,a.package||"-",a.offerDate||"-",a.joiningDate||"-",a.joiningLocation||"-"]);
        });
        downloadCSV("placements.csv",rows);
    }

    if(kind==="dept"){
        const rows = [["Department","Students","Eligible","Applications","Shortlisted","Selected","Placed"]];
        document.querySelectorAll("#deptTable tr").forEach(tr=>{
            const cells = [...tr.children].map(td=>td.innerText);
            if(cells.length) rows.push(cells);
        });
        downloadCSV("department_report.csv",rows);
    }

    if(kind==="company"){
        const rows = [["Company","Drives","Applications","Shortlisted","Selected","Placed"]];
        document.querySelectorAll("#companyStatsTable tr").forEach(tr=>{
            const cells = [...tr.children].map(td=>td.innerText);
            if(cells.length) rows.push(cells);
        });
        downloadCSV("company_report.csv",rows);
    }
}

/* =====================================================
   STUDENT SIGNUP / EDIT PROFILE
===================================================== */

function closeAllModals(){
    document.getElementById("studentSignupModal").style.display = "none";
    document.getElementById("placementModal").style.display = "none";
    document.getElementById("historyModal").style.display = "none";
    document.getElementById("driveDetailModal").style.display = "none";
}

function clearStudentForm(){
    ["suName","suEmail","suRegNo","suPassword","suConfirmPassword","suDept","suGradYear","suCgpa","suTenth","suTwelfth","suPhone","suSkills"].forEach(id=>{
        document.getElementById(id).value = "";
    });
    document.getElementById("suBacklogs").value = 0;
    document.getElementById("suPhoto").value = "";
    document.getElementById("suResumeFile").value = "";
    document.getElementById("suPhotoPreview").style.display = "none";
    document.getElementById("suPhotoPreview").src = "";
    document.getElementById("suResumeStatus").innerText = "No resume selected yet.";
    pendingStudentPhoto = "";
    pendingStudentResumeName = "";
    pendingStudentResumeData = "";
}

function openSignup(){
    closeAllModals();
    editingStudentEmail = null;
    clearStudentForm();
    document.getElementById("suModalTitle").innerText = "🎓 Student Registration";
    document.getElementById("suSubmitBtn").innerText = "Create Account";
    document.getElementById("suEmail").readOnly = false;
    document.getElementById("suPasswordNote").classList.add("hidden");
    document.getElementById("studentSignupModal").style.display = "flex";
}

function openEditProfile(){
    const data = loadData();
    const s = data.students[currentUser.email];
    if(!s) return;

    editingStudentEmail = currentUser.email;

    document.getElementById("suModalTitle").innerText = "✏️ Edit Profile";
    document.getElementById("suSubmitBtn").innerText = "Save Changes";
    document.getElementById("suName").value = s.name;
    document.getElementById("suEmail").value = currentUser.email;
    document.getElementById("suEmail").readOnly = true;
    document.getElementById("suRegNo").value = s.regNo || "";
    document.getElementById("suPassword").value = "";
    document.getElementById("suConfirmPassword").value = "";
    document.getElementById("suPasswordNote").classList.remove("hidden");
    document.getElementById("suDept").value = s.dept || "";
    document.getElementById("suGradYear").value = s.batch || "";
    document.getElementById("suCgpa").value = s.cgpa || "";
    document.getElementById("suBacklogs").value = s.backlogs || 0;
    document.getElementById("suTenth").value = s.tenth || "";
    document.getElementById("suTwelfth").value = s.twelfth || "";
    document.getElementById("suSkills").value = (s.skills||[]).join(", ");
    document.getElementById("suPhone").value = s.phone || "";

    pendingStudentPhoto = s.photo || "";
    pendingStudentResumeName = s.resumeName || "";
    pendingStudentResumeData = s.resumeData || "";

    const preview = document.getElementById("suPhotoPreview");
    if(s.photo){ preview.src = s.photo; preview.style.display = "block"; }
    else{ preview.style.display = "none"; }

    document.getElementById("suResumeStatus").innerText = s.resumeName ? ("📄 "+s.resumeName) : "No resume selected yet.";

    document.getElementById("studentSignupModal").style.display = "flex";
}

document.getElementById("suPhoto").addEventListener("change", function(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
        pendingStudentPhoto = ev.target.result;
        const preview = document.getElementById("suPhotoPreview");
        preview.src = pendingStudentPhoto;
        preview.style.display = "block";
    };
    reader.readAsDataURL(file);
});

document.getElementById("suResumeFile").addEventListener("change", function(e){
    const file = e.target.files[0];
    if(!file) return;
    pendingStudentResumeName = file.name;
    const reader = new FileReader();
    reader.onload = function(ev){
        pendingStudentResumeData = ev.target.result;
        document.getElementById("suResumeStatus").innerText = "📄 "+file.name+" (ready to upload)";
    };
    reader.readAsDataURL(file);
});

async function registerStudent(){
    const name = val("suName");
    const email = val("suEmail").toLowerCase();
    const regNo = val("suRegNo");
    const password = document.getElementById("suPassword").value;
    const confirm = document.getElementById("suConfirmPassword").value;
    const dept = val("suDept");
    const cgpa = parseFloat(val("suCgpa"));
    const gradYear = parseInt(val("suGradYear"));
    const backlogs = parseInt(val("suBacklogs"))||0;
    const tenth = parseFloat(val("suTenth"))||0;
    const twelfth = parseFloat(val("suTwelfth"))||0;
    const skills = val("suSkills").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
    const phone = val("suPhone");

    if(!name || !email || !regNo || !dept || isNaN(cgpa) || isNaN(gradYear) || skills.length===0){
        alert("Please fill in all required fields (name, email, register number, department, CGPA, batch, skills).");
        return;
    }

    const data = loadData();

    if(editingStudentEmail){
        const existing = data.students[editingStudentEmail];
        if(password || confirm){
            if(password !== confirm){ alert("Passwords do not match."); return; }
        }
        data.students[editingStudentEmail] = {
            ...existing, name, regNo, dept, cgpa, batch:gradYear, backlogs, tenth, twelfth, skills, phone,
            photo: pendingStudentPhoto || existing.photo || "",
            resumeName: pendingStudentResumeName || existing.resumeName || "",
            resumeData: pendingStudentResumeData || existing.resumeData || "",
            password: password ? password : existing.password
        };
        saveData(data);
        try {
            await fetch(API_BASE_URL + "/students/" + encodeURIComponent(editingStudentEmail), {
                method: "PUT",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(data.students[editingStudentEmail])
            });
        } catch(e) {
            console.warn("Database profile update failed:", e);
        }
        closeAllModals();
        renderStudentViews();
        alert("✅ Profile updated successfully.");
        return;
    }

    if(!password || password !== confirm){
        alert("Passwords do not match or are empty.");
        return;
    }
    if(emailExists(data,email)){
        alert("This email is already registered. Please login or use a different email.");
        return;
    }

    try{
        const response=await fetch(API_BASE_URL+"/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,regNo,password,dept,cgpa,batch:gradYear,backlogs,tenth,twelfth,skills,phone,photo:pendingStudentPhoto||"",resumeName:pendingStudentResumeName||"",resumeData:pendingStudentResumeData||""})});
        const result=await response.json().catch(()=>({}));
        if(!response.ok){ alert(result.message||"Could not save the student in the database."); return; }
    }catch(e){ alert("Cannot connect to the CampusHire database server. Start the backend first and try again."); return; }

    data.students[email] = {
        email, password, name, regNo, dept, cgpa, batch:gradYear, backlogs, tenth, twelfth, skills, phone,
        photo: pendingStudentPhoto, resumeName: pendingStudentResumeName, resumeData: pendingStudentResumeData,
        createdAt: Date.now()
    };

    saveData(data);
    closeAllModals();
    alert("✅ Account created successfully! Please login with your new credentials.");
    document.getElementById("loginRole").value = "student";
    document.getElementById("loginEmail").value = email;
    document.getElementById("loginPassword").value = "";
}

/* =====================================================
   FORGOT PASSWORD / OTP
===================================================== */
function openForgotPassword(){
 const m=document.getElementById("forgotPasswordModal"); if(!m)return;
 document.getElementById("forgotEmail").value=val("loginEmail");
 ["forgotOtp","forgotNewPassword","forgotConfirmPassword"].forEach(id=>document.getElementById(id).value="");
 ["forgotOtpGroup","forgotNewPasswordGroup","forgotConfirmPasswordGroup"].forEach(id=>document.getElementById(id).style.display="none");
 document.getElementById("sendOtpButton").style.display="inline-block"; document.getElementById("resetPasswordButton").style.display="none";
 document.getElementById("forgotPasswordMessage").innerText="Enter your registered student email to receive an OTP."; m.style.display="flex";
}
function closeForgotPassword(){const m=document.getElementById("forgotPasswordModal");if(m)m.style.display="none";}
async function sendPasswordOtp(){
 const email=val("forgotEmail").toLowerCase(), msg=document.getElementById("forgotPasswordMessage"), btn=document.getElementById("sendOtpButton");
 if(!email){msg.innerText="Please enter your registered email.";return;} btn.disabled=true;btn.innerText="Sending...";
 try{const r=await fetch(API_BASE_URL+"/auth/forgot-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})}),j=await r.json().catch(()=>({})); if(!r.ok){msg.innerText=j.message||"Unable to send OTP.";return;} msg.innerText=j.message||"OTP sent to your registered email."; ["forgotOtpGroup","forgotNewPasswordGroup","forgotConfirmPasswordGroup"].forEach(id=>document.getElementById(id).style.display="block");btn.style.display="none";document.getElementById("resetPasswordButton").style.display="inline-block";}catch(e){msg.innerText="Cannot connect to the CampusHire backend. Please start the server.";}finally{btn.disabled=false;btn.innerText="Send OTP";}
}
async function resetForgottenPassword(){
 const email=val("forgotEmail").toLowerCase(),otp=val("forgotOtp"),np=document.getElementById("forgotNewPassword").value,cp=document.getElementById("forgotConfirmPassword").value,msg=document.getElementById("forgotPasswordMessage"),btn=document.getElementById("resetPasswordButton");
 if(!/^\d{6}$/.test(otp)){msg.innerText="Please enter the 6-digit OTP sent to your email.";return;} if(np.length<6){msg.innerText="New password must contain at least 6 characters.";return;} if(np!==cp){msg.innerText="New passwords do not match.";return;}
 btn.disabled=true;btn.innerText="Resetting..."; try{const r=await fetch(API_BASE_URL+"/auth/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,otp,newPassword:np})}),j=await r.json().catch(()=>({})); if(!r.ok){msg.innerText=j.message||"Invalid or expired OTP.";return;} const data=loadData();if(data.students[email]){data.students[email].password=np;saveData(data);}closeForgotPassword();document.getElementById("loginEmail").value=email;document.getElementById("loginPassword").value="";alert("✅ Password reset successfully. Please login with your new password.");}catch(e){msg.innerText="Cannot connect to the CampusHire backend. Please start the server.";}finally{btn.disabled=false;btn.innerText="Reset Password";}
}

/* =====================================================
   DARK MODE
===================================================== */

function toggleDark(){
    document.body.classList.toggle("dark");
}

/* =====================================================
   OUTSIDE MODAL CLICK
===================================================== */

window.onclick = function(event){
    const modals = ["eligibilityModal","studentSignupModal","placementModal","historyModal","driveDetailModal","forgotPasswordModal"];
    modals.forEach(id=>{
        const modal = document.getElementById(id);
        if(event.target === modal){ modal.style.display = "none"; }
    });
};

/* =====================================================
   INITIALIZE
===================================================== */

loadData();


   
/* =====================================================
   CampusHire AI Placement Assistant
   Lightweight offline version — no API key or Ollama
===================================================== */


(function initCampusHireAssistant() {
  const launcher = document.getElementById("ch-ai-launcher");
  const panel = document.getElementById("ch-ai-panel");
  const closeButton = document.getElementById("ch-ai-close");
  const form = document.getElementById("ch-ai-form");
  const input = document.getElementById("ch-ai-input");
  const sendButton = document.getElementById("ch-ai-send");
  const messages = document.getElementById("ch-ai-messages");

  if (!launcher || !panel || !form || !input || !messages) {
    console.error("CampusHire chatbot elements were not found.");
    return;
  }

  let waiting = false;
  const chatHistory = [];

  function openAssistant() {
    panel.classList.add("ch-ai-open");
    panel.setAttribute("aria-hidden", "false");
    launcher.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closeAssistant() {
    panel.classList.remove("ch-ai-open");
    panel.setAttribute("aria-hidden", "true");
    launcher.setAttribute("aria-expanded", "false");
  }

  function addMessage(message, type) {
    const bubble = document.createElement("div");
    bubble.className = "ch-ai-message " + type;
    bubble.textContent = message;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  async function sendMessage(rawMessage) {
    const message = String(rawMessage || "").trim();

    if (!message || waiting) return;

    addMessage(message, "user");
    input.value = "";
    waiting = true;

    if (sendButton) sendButton.disabled = true;

    const pending = addMessage("Thinking...", "status");

    try {
      const response = await fetch(
        "http://localhost:5000/api/assistant/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            history: chatHistory.slice(-8)
          })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "AI request failed.");
      }

      const reply = String(data.reply || "No response was returned.");
      addMessage(reply, "bot");

      chatHistory.push(
        { role: "user", text: message },
        { role: "model", text: reply }
      );

      if (chatHistory.length > 10) {
        chatHistory.splice(0, chatHistory.length - 10);
      }
    } catch (error) {
      addMessage(
        "Unable to connect to Gemini: " + error.message,
        "bot"
      );
    } finally {
      pending.remove();
      waiting = false;

      if (sendButton) sendButton.disabled = false;

      input.focus();
    }
  }
 
  // Open and close the chatbot
  launcher.addEventListener("click", function () {
    if (panel.classList.contains("ch-ai-open")) {
      closeAssistant();
    } else {
      openAssistant();
    }
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeAssistant);
  }

  // Send a message
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  // Suggested question buttons
  document.querySelectorAll("[data-question]").forEach(function (button) {
    button.addEventListener("click", function () {
      openAssistant();
      sendMessage(button.getAttribute("data-question"));
    });
  });
})();

