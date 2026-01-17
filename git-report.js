const { execSync } = require('child_process');

// Danh sách username git của team (đúng như trong git config user.name)
const authors = ['NguyenSonTung16', 'tinphan247', 'TienThanhNguyen'];

console.log('| Avatar | Username | Commits | Additions | Deletions |');
console.log('| :--- | :--- | :--- | :--- | :--- |');

authors.forEach(author => {
    try {
        // 1. Đếm tổng số commit trên tất cả branch
        const commitLog = execSync(`git log --all --author="${author}" --oneline`).toString();
        const commitCount = commitLog ? commitLog.split('\n').filter(Boolean).length : 0;

        // 2. Tính tổng Additions/Deletions trên tất cả branch
        const stats = execSync(`git log --all --author="${author}" --pretty=tformat: --numstat`).toString();

        let additions = 0;
        let deletions = 0;

        stats.split('\n').forEach(line => {
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
                const add = parseInt(parts[0]);
                const del = parseInt(parts[1]);
                if (!isNaN(add)) additions += add;
                if (!isNaN(del)) deletions += del;
            }
        });

        console.log(`| | ${author} | ${commitCount} | ${additions} | ${deletions} |`);
    } catch (e) {
        console.log(`| | ${author} | 0 | 0 | 0 | (Error/No commits)`);
    }
});


console.log('\n\n--- DANH SÁCH COMMITS ---');
console.log('| Date | Author | Commit Message | Files Changed |');
console.log('| :---- | :---- | :---- | :---- |');

// Lấy toàn bộ commit trên tất cả branch, xuất bảng chi tiết (luôn in commit, kể cả không có files changed)
try {
    const log = execSync('git log --all --pretty=format:"%ad|%an|%B<<END>>" --date=short --shortstat').toString();
    const lines = log.split('\n');
    let lastCommit = null;
    let messageBuffer = [];
    lines.forEach((line, idx) => {
        if (/^\d{4}-\d{2}-\d{2}\|/.test(line)) {
            // Nếu có commit trước đó chưa in (không có files changed), in ra với 0
            if (lastCommit) {
                lastCommit.message = messageBuffer.join(' ').replace(/<<END>>/g, '').trim();
                console.log(`| ${lastCommit.date} | ${lastCommit.author} | ${lastCommit.message} | 0 |`);
            }
            // Dòng commit info mới
            const parts = line.split('|');
            lastCommit = {
                date: parts[0].trim(),
                author: parts[1].trim(),
                message: '',
                filesChanged: 0
            };
            messageBuffer = [parts.slice(2).join('|').trim()];
        } else if (line.includes('<<END>>')) {
            // Kết thúc message của commit
            messageBuffer.push(line.replace('<<END>>', '').trim());
        } else if (lastCommit && /files changed/.test(line)) {
            // Dòng shortstat
            lastCommit.message = messageBuffer.join(' ').replace(/<<END>>/g, '').trim();
            const match = line.match(/(\d+) files changed/);
            lastCommit.filesChanged = match ? parseInt(match[1]) : 0;
            // Xuất bảng
            console.log(`| ${lastCommit.date} | ${lastCommit.author} | ${lastCommit.message} | ${lastCommit.filesChanged} |`);
            lastCommit = null;
            messageBuffer = [];
        } else if (lastCommit) {
            // Thu thập các dòng message body
            messageBuffer.push(line.trim());
        }
    });
    // In commit cuối cùng nếu chưa in (không có files changed)
    if (lastCommit) {
        lastCommit.message = messageBuffer.join(' ').replace(/<<END>>/g, '').trim();
        console.log(`| ${lastCommit.date} | ${lastCommit.author} | ${lastCommit.message} | 0 |`);
    }
} catch (e) {
    console.log('Không thể lấy danh sách commit:', e.message);
}