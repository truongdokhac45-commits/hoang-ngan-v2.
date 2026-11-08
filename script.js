import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBx3Q0oVw_nj1PXO3yT9A_AHcVGci0yBAY",
  authDomain: "vto-edulab.firebaseapp.com",
  projectId: "vto-edulab",
  storageBucket: "vto-edulab.firebasestorage.app",
  messagingSenderId: "211278118251",
  appId: "1:211278118251:web:6a6537dd2c2ae71966a02e",
  measurementId: "G-0HXW94977W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Hàm kiểm soát hiển thị giao diện chính và modal đăng nhập
function checkAccessControl() {
  const loginModal = document.getElementById("loginModal");
  const mainApp = document.querySelector(".app-container");
  const isLoggedIn = localStorage.getItem("vto_logged_in") === "true";

  if (!isLoggedIn) {
    if (loginModal) loginModal.style.display = "flex";
    if (mainApp) mainApp.style.display = "none";
  } else {
    if (loginModal) loginModal.style.display = "none";
    if (mainApp) mainApp.style.display = "flex";
  }
}

// Hàm Đăng ký toàn cục
window.registerUser = function(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Đăng ký thành công tài khoản: " + userCredential.user.email);
    })
    .catch((error) => {
      alert("Lỗi đăng ký: " + error.message);
    });
};

// ==========================================
// HÀM ĐĂNG NHẬP HỆ THỐNG
// ==========================================
window.loginUser = function() {
  const emailInput = document.getElementById('loginUserX');
  const passwordInput = document.getElementById('loginPassX');
  
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  if (!email || !password) {
    alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
    return;
  }

  // Kiểm tra tài khoản và mật khẩu mới của hệ thống
  if (email === 'Hoangngan@123' && password === 'Hoangngan123') {
    alert("🎉 Đăng nhập thành công! Chào mừng cô Hoàng Ngân.");
    localStorage.setItem("vto_logged_in", "true");
    checkAccessControl();
    return;
  }

  // Chế độ dự phòng Firebase
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Đăng nhập thành công! Chào mừng: " + userCredential.user.email);
      localStorage.setItem("vto_logged_in", "true");
      checkAccessControl();
    })
    .catch((error) => {
      alert("❌ Sai tài khoản hoặc mật khẩu hệ thống!");
    });
};

// ==========================================
// HÀM ĐĂNG XUẤT KHỎI HỆ THỐNG
// ==========================================
window.logoutUser = function() {
  const confirmLogout = confirm("🚪 Bạn có chắc chắn muốn đăng xuất khỏi hệ thống VTO EDULAB không?");
  if (confirmLogout) {
    localStorage.removeItem("vto_logged_in");
    
    if (typeof signOut === 'function' && auth) {
      signOut(auth).catch((error) => {
        console.log("Lỗi đăng xuất firebase: ", error);
      });
    }

    alert("👋 Đã đăng xuất thành công!");
    checkAccessControl();
    
    // Xóa trắng ô input đăng nhập
    const emailInput = document.getElementById('loginUserX');
    const passwordInput = document.getElementById('loginPassX');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
  }
};

// ==========================================
// HÀM XỬ LÝ TẢI LÊN BÀI GIẢNG POWERPOINT
// ==========================================
window.uploadLessonToFirebase = function() {
    const title = document.getElementById('lessonTitleInput').value.trim();
    const fileInput = document.getElementById('lessonFileInput');
    const file = fileInput.files[0];

    if (!title) {
        alert('Vui lòng nhập tiêu đề bài giảng!');
        return;
    }

    if (!file) {
        alert('Vui lòng chọn file PowerPoint (.ppt, .pptx) cần tải lên!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileDataUrl = e.target.result;

        let savedLessons = JSON.parse(localStorage.getItem('vto_lessons')) || [
            { title: '📊 Slide bài giảng Toán lớp 5A1 - Phép cộng phân số', fileName: 'toan_5a1.pptx', fileData: '' },
            { title: '📊 Slide bài giảng Hình học không gian 5A2', fileName: 'hinh_5a2.pptx', fileData: '' }
        ];

        savedLessons.unshift({
            title: `📊 ${title}`,
            fileName: file.name,
            fileData: fileDataUrl
        });

        localStorage.setItem('vto_lessons', JSON.stringify(savedLessons));

        alert(`🚀 Đã tải lên và lưu thành công bài giảng:\n"${title}"`);

        document.getElementById('uploadLessonModal').style.display = 'none';
        document.getElementById('lessonTitleInput').value = '';
        fileInput.value = '';

        renderLessonsList();
    };

    reader.readAsDataURL(file);
};

// Hàm render danh sách bài giảng ra giao diện Kho bài giảng và hỗ trợ Tải xuống
function renderLessonsList() {
    const ulList = document.getElementById('lessonsUlList');
    if (!ulList) return;

    let savedLessons = JSON.parse(localStorage.getItem('vto_lessons')) || [
        { title: '📊 Slide bài giảng Toán lớp 5A1 - Phép cộng phân số', fileName: 'toan_5a1.pptx', fileData: '' },
        { title: '📊 Slide bài giảng Hình học không gian 5A2', fileName: 'hinh_5a2.pptx', fileData: '' }
    ];

    ulList.innerHTML = '';
    savedLessons.forEach((lesson) => {
        const li = document.createElement('li');
        li.style.cssText = 'padding: 12px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;';
        
        let downloadBtnHTML = '';
        if (lesson.fileData) {
            downloadBtnHTML = `<a href="${lesson.fileData}" download="${lesson.fileName}" style="color: #0284c7; text-decoration: none; cursor: pointer; font-weight: 500;">Tải xuống</a>`;
        } else {
            downloadBtnHTML = `<span style="color: #94a3b8; font-size: 13px;">(File mẫu)</span>`;
        }

        li.innerHTML = `
            <span>${lesson.title} <small style="color: #64748b;">(${lesson.fileName || 'PowerPoint'})</small></span>
            ${downloadBtnHTML}
        `;
        ulList.appendChild(li);
    });
}

// Theo dõi trạng thái người dùng
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Đã đăng nhập với tài khoản:", user.email);
    localStorage.setItem("vto_logged_in", "true");
  }
  checkAccessControl();
});

// ==========================================
// 2. LOGIC QUẢN LÝ GIAO DIỆN & BÀI TẬP
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    checkAccessControl();
    renderLessonsList();

    const defaultTasks = [
        { title: 'Bài tập về nhà Số học phân số', className: 'Toán 5A1', deadline: 'Hôm qua, 21:00', status: 'Mới nộp', score: null },
        { title: 'Kiểm tra 15 phút Hình học', className: 'Toán nâng cao 5A2', deadline: 'Hôm nay, 18:00', status: 'Mới nộp', score: null }
    ];

    let tasks = JSON.parse(localStorage.getItem('vto_tasks')) || defaultTasks;

    const gradeModal = document.getElementById('gradeModal');
    const closeGradeModalBtn = document.getElementById('closeModalBtn');
    const cancelGradeModalBtn = document.getElementById('cancelModalBtn');
    const saveGradeBtn = document.getElementById('saveGradeBtn');
    const modalTaskName = document.getElementById('modalTaskName');
    const modalClassName = document.getElementById('modalClassName');
    const scoreInput = document.getElementById('scoreInput');
    const feedbackInput = document.getElementById('feedbackInput');

    const createTaskModal = document.getElementById('createTaskModal');
    const openCreateTaskBtn = document.getElementById('openCreateTaskBtn');
    const closeCreateModalBtn = document.getElementById('closeCreateModalBtn');
    const cancelCreateModalBtn = document.getElementById('cancelCreateModalBtn');
    const saveNewTaskBtn = document.getElementById('saveNewTaskBtn');

    let selectedTaskIndex = null;

    function renderTasks() {
        const tbody = document.querySelector('.dashboard-body table tbody') || document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        tasks.forEach((task, index) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';
            
            let statusHTML = `<span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${task.status}</span>`;
            if (task.score !== null) {
                statusHTML = `<span style="background: #dcfce7; color: #15803d; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Đã chấm: ${task.score}đ</span>`;
            }

            tr.innerHTML = `
                <td style="padding: 14px 20px; font-weight: 500;">${task.title}</td>
                <td style="padding: 14px 20px;">${task.className}</td>
                <td style="padding: 14px 20px; color: #64748b;">${task.deadline}</td>
                <td style="padding: 14px 20px;">${statusHTML}</td>
                <td style="padding: 14px 20px; text-align: right;">
                    <a href="#" class="btn-cham-bai" data-index="${index}" style="color: #2563eb; font-weight: 600; text-decoration: none; margin-right: 12px;">Chấm bài</a>
                    <a href="#" class="btn-xoa-bai" data-index="${index}" style="color: #ef4444; font-weight: 600; text-decoration: none;" title="Xóa bài tập"><i class="fa-solid fa-trash-can"></i> Xóa</a>
                </td>
            `;
            tbody.appendChild(tr);
        });
        localStorage.setItem('vto_tasks', JSON.stringify(tasks));
    }

    renderTasks();

    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;

        if (link.classList.contains('btn-cham-bai') || link.textContent.trim().includes('Chấm bài')) {
            e.preventDefault();
            const index = link.getAttribute('data-index');
            selectedTaskIndex = index !== null ? parseInt(index) : 0;
            
            const task = tasks[selectedTaskIndex];
            if (task) {
                modalTaskName.textContent = task.title;
                modalClassName.textContent = task.className;
                scoreInput.value = task.score !== null ? task.score : '';
                feedbackInput.value = '';
                if (gradeModal) gradeModal.style.display = 'flex';
            }
        }

        if (link.classList.contains('btn-xoa-bai') || link.textContent.trim().includes('Xóa')) {
            e.preventDefault();
            const index = parseInt(link.getAttribute('data-index'));
            const taskToDelete = tasks[index];

            if (taskToDelete) {
                const confirmDelete = confirm(`🗑️ Bạn có chắc chắn muốn xóa bài tập:\n"${taskToDelete.title}"?`);
                if (confirmDelete) {
                    tasks.splice(index, 1);
                    renderTasks();
                }
            }
        }

        if (link.textContent.trim() === 'Vào lớp học') {
            e.preventDefault();
            const card = link.closest('.class-card');
            const tenLop = card ? card.querySelector('h4').textContent : 'Lớp học';
            alert(`🏫 Đang chuyển đến không gian lớp học: ${tenLop}`);
        }
    });

    if (closeGradeModalBtn) closeGradeModalBtn.onclick = () => gradeModal.style.display = 'none';
    if (cancelGradeModalBtn) cancelGradeModalBtn.onclick = () => gradeModal.style.display = 'none';

    if (saveGradeBtn) {
        saveGradeBtn.onclick = function() {
            const score = scoreInput.value;
            if (score === '' || score < 0 || score > 10) {
                alert('Vui lòng nhập điểm hợp lệ từ 0 đến 10!');
                return;
            }
            if (selectedTaskIndex !== null && tasks[selectedTaskIndex]) {
                tasks[selectedTaskIndex].score = score;
                tasks[selectedTaskIndex].status = 'Đã chấm';
                renderTasks();
            }
            alert(`✅ Đã lưu điểm thành công: ${score}đ`);
            gradeModal.style.display = 'none';
        };
    }

    if (openCreateTaskBtn) openCreateTaskBtn.onclick = () => createTaskModal.style.display = 'flex';
    if (closeCreateModalBtn) closeCreateModalBtn.onclick = () => createTaskModal.style.display = 'none';
    if (cancelCreateModalBtn) cancelCreateModalBtn.onclick = () => createTaskModal.style.display = 'none';

    if (saveNewTaskBtn) {
        saveNewTaskBtn.onclick = function() {
            const title = document.getElementById('newTaskTitle').value.trim();
            const className = document.getElementById('newTaskClass').value;
            const deadline = document.getElementById('newTaskDeadline').value.trim() || 'Hôm nay, 23:59';
            const fileInput = document.getElementById('newTaskFile');

            if (!title) {
                alert('Vui lòng nhập tiêu đề bài tập!');
                return;
            }

            let fileName = fileInput.files.length > 0 ? fileInput.files[0].name : '';
            let fullTitle = title + (fileName ? ` (📎 ${fileName})` : '');

            tasks.unshift({
                title: fullTitle,
                className: className,
                deadline: deadline,
                status: 'Mới nộp',
                score: null
            });

            renderTasks();

            document.getElementById('newTaskTitle').value = '';
            document.getElementById('newTaskDeadline').value = '';
            fileInput.value = '';

            alert('🚀 Up bài tập mới thành công!');
            createTaskModal.style.display = 'none';
        };
    }

    const menuItems = document.querySelectorAll('.menu-list li');
    const dashboardBody = document.querySelector('.dashboard-body');

    const pageContents = {
        'tong-quan': dashboardBody ? dashboardBody.innerHTML : '',
        'lop-hoc': `
            <h2>📚 Quản lý Lớp học của tôi</h2>
            <p>Danh sách các lớp học phụ trách chi tiết.</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
                <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h4>Toán lớp 5A1</h4>
                    <p style="color: #64748b; font-size: 13px;">Sĩ số: 38 học sinh • Phòng: A2.04</p>
                    <button style="margin-top: 10px; padding: 6px 12px; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Vào phòng học</button>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h4>Toán nâng cao 5A2</h4>
                    <p style="color: #64748b; font-size: 13px;">Sĩ số: 35 học sinh • Phòng: B1.02</p>
                    <button style="margin-top: 10px; padding: 6px 12px; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Vào phòng học</button>
                </div>
            </div>
        `,
        'kho-bai-giang': `
            <h2>📁 Kho bài giảng điện tử</h2>
            <p>Lưu trữ giáo án, slide bài giảng và tài liệu số cho giáo viên.</p>
            <div style="margin-top: 15px; margin-bottom: 20px;">
                <button onclick="document.getElementById('uploadLessonModal').style.display='flex'" style="background: #2563eb; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-cloud-arrow-up"></i> + Tải lên bài giảng PowerPoint
                </button>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <ul id="lessonsUlList" style="list-style: none; padding: 0;">
                    <!-- Danh sách bài giảng sẽ được load tự động tại đây -->
                </ul>
            </div>
        `,
        'bai-tap': `
            <h2>📝 Quản lý Bài tập</h2>
            <p>Tạo mới, chỉnh sửa và quản lý kho bài tập giao cho học sinh.</p>
        `,
        'bai-nop-cham': `
            <h2>✅ Bài nộp & Chấm điểm</h2>
            <p>Danh sách toàn bộ bài làm của học sinh đã nộp lên hệ thống để chờ giáo viên đánh giá.</p>
        `,
        'thu-vien': `
        <h2>📖 Thư viện tham khảo</h2>
        <p>Kho tài liệu, sách giáo khoa điện tử và các văn bản hướng dẫn chuyên môn.</p>
        <div style="background: #fff; padding: 20px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <ul style="padding-left: 20px; color: #334155; line-height: 1.8;">
                <li>Sách giáo khoa Toán lớp 5 (Bộ Kết nối tri thức)</li>
                <li>Tài liệu bồi dưỡng học sinh giỏi Toán tiểu học</li>
                <li>Văn bản hướng dẫn thực hiện nhiệm vụ năm học của Phòng GD&ĐT</li>
            </ul>
        </div>
    `
    };

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const targetKey = this.getAttribute('data-target');
            const breadcrumbStrong = document.querySelector('.breadcrumb strong');
            
            if (dashboardBody && pageContents[targetKey]) {
                dashboardBody.innerHTML = pageContents[targetKey];
                
                if (breadcrumbStrong) {
                    breadcrumbStrong.textContent = this.textContent.trim();
                }

                if (targetKey === 'tong-quan') {
                    renderTasks();
                }

                if (targetKey === 'kho-bai-giang') {
                    renderLessonsList();
                }
            }
        });
    });
});